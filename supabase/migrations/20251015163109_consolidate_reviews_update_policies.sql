-- Consolidate multiple UPDATE policies on reviews table into a single policy
-- This improves performance by avoiding multiple policy evaluations

-- Drop the three separate UPDATE policies
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Restaurant owners can respond to reviews" ON public.reviews;

-- Create a single consolidated UPDATE policy that handles all three cases
CREATE POLICY "Users can manage reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (
  deleted_at IS NULL
  AND (
    -- Case 1: User owns the review and can update it
    (SELECT auth.uid()) = user_id
    OR
    -- Case 2: Restaurant owner can respond to reviews
    EXISTS (
      SELECT 1
      FROM public.restaurants
      WHERE restaurants.id = reviews.restaurant_id
      AND restaurants.owner_id = (SELECT auth.uid())
    )
  )
)
WITH CHECK (
  -- Allow users to update their own reviews (normal update)
  (
    (SELECT auth.uid()) = user_id
    AND (
      -- Normal update (not deleting)
      deleted_at IS NULL
      OR
      -- Soft delete (setting deleted_at)
      deleted_at IS NOT NULL
    )
  )
  OR
  -- Allow restaurant owners to respond (but not modify user's content)
  (
    (SELECT auth.uid()) <> user_id
    AND EXISTS (
      SELECT 1
      FROM public.restaurants
      WHERE restaurants.id = reviews.restaurant_id
      AND restaurants.owner_id = (SELECT auth.uid())
    )
    AND (
      restaurant_response_message IS NOT NULL
      OR restaurant_response_date IS NOT NULL
    )
  )
);
