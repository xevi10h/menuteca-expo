-- Add missing index on foreign key column
-- This improves JOIN performance between restaurants and addresses tables

CREATE INDEX IF NOT EXISTS idx_restaurants_address_id
ON public.restaurants(address_id);
