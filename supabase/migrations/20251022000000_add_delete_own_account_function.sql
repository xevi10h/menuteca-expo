-- Create a function that allows users to delete their own account
-- This is required for GDPR compliance (App Store Guideline 5.1.1(v))

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
  result json;
BEGIN
  -- Get the current user's ID from the JWT
  user_id := auth.uid();

  -- Check if user is authenticated
  IF user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;

  -- Soft delete all user's data first (to preserve referential integrity)
  -- Soft delete user's restaurants
  UPDATE public.restaurants
  SET deleted_at = NOW()
  WHERE owner_id = user_id
    AND deleted_at IS NULL;

  -- Soft delete user's reviews
  UPDATE public.reviews
  SET deleted_at = NOW()
  WHERE user_id = user_id
    AND deleted_at IS NULL;

  -- Soft delete user's profile
  UPDATE public.profiles
  SET deleted_at = NOW()
  WHERE id = user_id
    AND deleted_at IS NULL;

  -- Delete the auth user (this is the critical part that requires SECURITY DEFINER)
  DELETE FROM auth.users
  WHERE id = user_id;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Account deleted successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Return error if something goes wrong
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

-- Add a comment explaining the function
COMMENT ON FUNCTION public.delete_own_account() IS
'Allows authenticated users to delete their own account. Required for GDPR compliance (App Store Guideline 5.1.1(v)). Soft deletes all user data first, then permanently deletes the auth account.';
