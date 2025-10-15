-- Fix RLS performance issues by wrapping auth.uid() calls in subqueries
-- This prevents the auth.uid() function from being re-evaluated for every row

-- ====================
-- PROFILES TABLE
-- ====================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate with optimized queries
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- ====================
-- RESTAURANTS TABLE
-- ====================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Users can update their own restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Users can delete their own restaurants" ON public.restaurants;

-- Recreate with optimized queries
CREATE POLICY "Users can create their own restaurants"
ON public.restaurants
FOR INSERT
WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can update their own restaurants"
ON public.restaurants
FOR UPDATE
USING ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Users can delete their own restaurants"
ON public.restaurants
FOR DELETE
USING ((SELECT auth.uid()) = owner_id);

-- ====================
-- REVIEWS TABLE
-- ====================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Restaurant owners can respond to reviews" ON public.reviews;

-- Recreate with optimized queries
CREATE POLICY "Users can create their own reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (((SELECT auth.uid()) = user_id) AND (deleted_at IS NULL))
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (((SELECT auth.uid()) = user_id) AND (deleted_at IS NULL))
WITH CHECK (((SELECT auth.uid()) = user_id) AND (deleted_at IS NOT NULL));

CREATE POLICY "Restaurant owners can respond to reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (
  (deleted_at IS NULL)
  AND EXISTS (
    SELECT 1
    FROM public.restaurants
    WHERE restaurants.id = reviews.restaurant_id
    AND restaurants.owner_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  ((SELECT auth.uid()) <> user_id)
  AND (
    (restaurant_response_message IS NOT NULL)
    OR (restaurant_response_date IS NOT NULL)
  )
);
