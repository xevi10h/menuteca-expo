create table "public"."addresses" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "street" jsonb not null,
    "number" character varying(20) not null,
    "additional_information" text,
    "postal_code" character varying(20) not null,
    "city" jsonb not null,
    "country" jsonb not null,
    "coordinates" jsonb not null,
    "formatted_address" text
);


create table "public"."cuisines" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "name" jsonb not null,
    "image" text not null
);


create table "public"."dishes" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "menu_id" uuid not null,
    "name" jsonb not null,
    "description" jsonb not null,
    "extra_price" numeric(10,2) not null default 0,
    "category" character varying(50) not null,
    "is_vegetarian" boolean not null default false,
    "is_lactose_free" boolean not null default false,
    "is_spicy" boolean not null default false,
    "is_gluten_free" boolean not null default false,
    "is_vegan" boolean not null default false,
    "is_active" boolean not null default true
);


create table "public"."menus" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "restaurant_id" uuid not null,
    "name" jsonb not null,
    "days" text[] not null default '{}'::text[],
    "start_time" time without time zone not null,
    "end_time" time without time zone not null,
    "price" numeric(10,2) not null,
    "first_courses_to_share" boolean not null default false,
    "second_courses_to_share" boolean not null default false,
    "desserts_to_share" boolean not null default false,
    "includes_bread" boolean not null default false,
    "drinks" jsonb not null default '{"beer": false, "wine": false, "water": false, "soft_drinks": false}'::jsonb,
    "includes_coffee_and_dessert" character varying(20) not null default 'none'::character varying,
    "minimum_people" integer not null default 1,
    "has_minimum_people" boolean not null default false,
    "is_active" boolean not null default true,
    "deleted_at" timestamp with time zone
);


create table "public"."password_reset_codes" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "code_hash" character varying(255) not null,
    "expires_at" timestamp with time zone not null,
    "is_used" boolean default false,
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."profiles" (
    "id" uuid not null,
    "email" text not null,
    "username" text not null,
    "name" text not null,
    "photo" text,
    "language" text not null default 'es_ES'::text,
    "has_password" boolean not null default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "deleted_at" timestamp with time zone
);


alter table "public"."profiles" enable row level security;

create table "public"."restaurants" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "name" character varying(255) not null,
    "minimum_price" numeric(10,2) not null,
    "cuisine_id" uuid not null,
    "rating" numeric(3,2),
    "main_image" text not null,
    "profile_image" text,
    "images" text[] default '{}'::text[],
    "address_id" uuid not null,
    "tags" text[] default '{}'::text[],
    "phone" character varying(50),
    "reservation_link" text,
    "owner_id" uuid not null,
    "is_active" boolean not null default true,
    "deleted_at" timestamp with time zone
);


create table "public"."reviews" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "profile_id" uuid not null,
    "restaurant_id" uuid not null,
    "rating" numeric(3,2) not null,
    "comment" jsonb not null,
    "photos" text[] default '{}'::text[],
    "restaurant_response_message" jsonb,
    "restaurant_response_date" timestamp with time zone,
    "deleted_at" timestamp with time zone
);


CREATE UNIQUE INDEX addresses_pkey ON public.addresses USING btree (id);

CREATE UNIQUE INDEX cuisines_pkey ON public.cuisines USING btree (id);

CREATE UNIQUE INDEX dishes_pkey ON public.dishes USING btree (id);

CREATE INDEX idx_dishes_category ON public.dishes USING btree (category);

CREATE INDEX idx_dishes_is_active ON public.dishes USING btree (is_active);

CREATE INDEX idx_dishes_menu_id ON public.dishes USING btree (menu_id);

CREATE INDEX idx_menus_deleted_at ON public.menus USING btree (deleted_at);

CREATE INDEX idx_menus_is_active ON public.menus USING btree (is_active);

CREATE INDEX idx_menus_restaurant_id ON public.menus USING btree (restaurant_id);

CREATE INDEX idx_password_reset_codes_expires_at ON public.password_reset_codes USING btree (expires_at);

CREATE INDEX idx_password_reset_codes_is_used ON public.password_reset_codes USING btree (is_used);

CREATE INDEX idx_password_reset_codes_user_active ON public.password_reset_codes USING btree (user_id, is_used, expires_at) WHERE (is_used = false);

CREATE INDEX idx_password_reset_codes_user_id ON public.password_reset_codes USING btree (user_id);

CREATE INDEX idx_restaurants_cuisine_id ON public.restaurants USING btree (cuisine_id);

CREATE INDEX idx_restaurants_deleted_at ON public.restaurants USING btree (deleted_at);

CREATE INDEX idx_restaurants_is_active ON public.restaurants USING btree (is_active);

CREATE INDEX idx_restaurants_owner_id ON public.restaurants USING btree (owner_id);

CREATE INDEX idx_restaurants_rating ON public.restaurants USING btree (rating);

CREATE INDEX idx_reviews_deleted_at ON public.reviews USING btree (deleted_at);

CREATE INDEX idx_reviews_rating ON public.reviews USING btree (rating);

CREATE INDEX idx_reviews_restaurant_id ON public.reviews USING btree (restaurant_id);

CREATE INDEX idx_reviews_user_id ON public.reviews USING btree (profile_id);

CREATE UNIQUE INDEX menus_pkey ON public.menus USING btree (id);

CREATE UNIQUE INDEX password_reset_codes_pkey ON public.password_reset_codes USING btree (id);

CREATE INDEX profiles_deleted_at_idx ON public.profiles USING btree (deleted_at) WHERE (deleted_at IS NULL);

CREATE INDEX profiles_email_idx ON public.profiles USING btree (email);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE INDEX profiles_username_idx ON public.profiles USING btree (username);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE UNIQUE INDEX restaurants_pkey ON public.restaurants USING btree (id);

CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id);

CREATE UNIQUE INDEX reviews_user_id_restaurant_id_key ON public.reviews USING btree (profile_id, restaurant_id);

alter table "public"."addresses" add constraint "addresses_pkey" PRIMARY KEY using index "addresses_pkey";

alter table "public"."cuisines" add constraint "cuisines_pkey" PRIMARY KEY using index "cuisines_pkey";

alter table "public"."dishes" add constraint "dishes_pkey" PRIMARY KEY using index "dishes_pkey";

alter table "public"."menus" add constraint "menus_pkey" PRIMARY KEY using index "menus_pkey";

alter table "public"."password_reset_codes" add constraint "password_reset_codes_pkey" PRIMARY KEY using index "password_reset_codes_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."restaurants" add constraint "restaurants_pkey" PRIMARY KEY using index "restaurants_pkey";

alter table "public"."reviews" add constraint "reviews_pkey" PRIMARY KEY using index "reviews_pkey";

alter table "public"."dishes" add constraint "dishes_category_check" CHECK (((category)::text = ANY (ARRAY[('appetizers'::character varying)::text, ('firstCourses'::character varying)::text, ('secondCourses'::character varying)::text, ('mainCourses'::character varying)::text, ('sides'::character varying)::text, ('desserts'::character varying)::text, ('drinks'::character varying)::text]))) not valid;

alter table "public"."dishes" validate constraint "dishes_category_check";

alter table "public"."dishes" add constraint "dishes_extra_price_check" CHECK ((extra_price >= (0)::numeric)) not valid;

alter table "public"."dishes" validate constraint "dishes_extra_price_check";

alter table "public"."dishes" add constraint "dishes_menu_id_fkey" FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE not valid;

alter table "public"."dishes" validate constraint "dishes_menu_id_fkey";

alter table "public"."menus" add constraint "menus_includes_coffee_and_dessert_check" CHECK (((includes_coffee_and_dessert)::text = ANY (ARRAY[('none'::character varying)::text, ('coffee'::character varying)::text, ('dessert'::character varying)::text, ('both'::character varying)::text]))) not valid;

alter table "public"."menus" validate constraint "menus_includes_coffee_and_dessert_check";

alter table "public"."menus" add constraint "menus_minimum_people_check" CHECK ((minimum_people >= 1)) not valid;

alter table "public"."menus" validate constraint "menus_minimum_people_check";

alter table "public"."menus" add constraint "menus_price_check" CHECK ((price >= (0)::numeric)) not valid;

alter table "public"."menus" validate constraint "menus_price_check";

alter table "public"."menus" add constraint "menus_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE not valid;

alter table "public"."menus" validate constraint "menus_restaurant_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

alter table "public"."restaurants" add constraint "restaurants_address_id_fkey" FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE CASCADE not valid;

alter table "public"."restaurants" validate constraint "restaurants_address_id_fkey";

alter table "public"."restaurants" add constraint "restaurants_cuisine_id_fkey" FOREIGN KEY (cuisine_id) REFERENCES cuisines(id) ON DELETE CASCADE not valid;

alter table "public"."restaurants" validate constraint "restaurants_cuisine_id_fkey";

alter table "public"."restaurants" add constraint "restaurants_minimum_price_check" CHECK ((minimum_price >= (0)::numeric)) not valid;

alter table "public"."restaurants" validate constraint "restaurants_minimum_price_check";

alter table "public"."restaurants" add constraint "restaurants_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES profiles(id) not valid;

alter table "public"."restaurants" validate constraint "restaurants_owner_id_fkey";

alter table "public"."restaurants" add constraint "restaurants_rating_check" CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric))) not valid;

alter table "public"."restaurants" validate constraint "restaurants_rating_check";

alter table "public"."reviews" add constraint "reviews_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(id) not valid;

alter table "public"."reviews" validate constraint "reviews_profile_id_fkey";

alter table "public"."reviews" add constraint "reviews_rating_check" CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric))) not valid;

alter table "public"."reviews" validate constraint "reviews_rating_check";

alter table "public"."reviews" add constraint "reviews_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_restaurant_id_fkey";

alter table "public"."reviews" add constraint "reviews_user_id_restaurant_id_key" UNIQUE using index "reviews_user_id_restaurant_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_codes()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM password_reset_codes 
    WHERE expires_at < NOW() - INTERVAL '1 day';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_addresses_within_radius(center_lat double precision, center_lng double precision, radius_km double precision, max_results integer DEFAULT 20)
 RETURNS SETOF addresses
 LANGUAGE plpgsql
AS $function$
begin
  return query
  select * from addresses
  where (
    6371 * acos(
      cos(radians(center_lat)) * 
      cos(radians((coordinates->>'latitude')::double precision)) * 
      cos(radians((coordinates->>'longitude')::double precision) - radians(center_lng)) + 
      sin(radians(center_lat)) * 
      sin(radians((coordinates->>'latitude')::double precision))
    )
  ) <= radius_km
  order by (
    6371 * acos(
      cos(radians(center_lat)) * 
      cos(radians((coordinates->>'latitude')::double precision)) * 
      cos(radians((coordinates->>'longitude')::double precision) - radians(center_lng)) + 
      sin(radians(center_lat)) * 
      sin(radians((coordinates->>'latitude')::double precision))
    )
  )
  limit max_results;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    name, 
    photo, 
    language,
    has_password
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'photo',
    COALESCE(NEW.raw_user_meta_data->>'language', 'es_ES'),
    CASE WHEN NEW.encrypted_password IS NOT NULL THEN true ELSE false END
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_password_reset_codes_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.user_owns_restaurant(restaurant_id_param text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- This would need to query your actual restaurants table
  -- For now, we'll return true and handle in application logic
  RETURN TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.user_owns_review(review_id_param text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- This would need to query your actual reviews table
  -- For now, we'll return true and handle in application logic
  RETURN TRUE;
END;
$function$
;

grant delete on table "public"."addresses" to "anon";

grant insert on table "public"."addresses" to "anon";

grant references on table "public"."addresses" to "anon";

grant select on table "public"."addresses" to "anon";

grant trigger on table "public"."addresses" to "anon";

grant truncate on table "public"."addresses" to "anon";

grant update on table "public"."addresses" to "anon";

grant delete on table "public"."addresses" to "authenticated";

grant insert on table "public"."addresses" to "authenticated";

grant references on table "public"."addresses" to "authenticated";

grant select on table "public"."addresses" to "authenticated";

grant trigger on table "public"."addresses" to "authenticated";

grant truncate on table "public"."addresses" to "authenticated";

grant update on table "public"."addresses" to "authenticated";

grant delete on table "public"."addresses" to "service_role";

grant insert on table "public"."addresses" to "service_role";

grant references on table "public"."addresses" to "service_role";

grant select on table "public"."addresses" to "service_role";

grant trigger on table "public"."addresses" to "service_role";

grant truncate on table "public"."addresses" to "service_role";

grant update on table "public"."addresses" to "service_role";

grant delete on table "public"."cuisines" to "anon";

grant insert on table "public"."cuisines" to "anon";

grant references on table "public"."cuisines" to "anon";

grant select on table "public"."cuisines" to "anon";

grant trigger on table "public"."cuisines" to "anon";

grant truncate on table "public"."cuisines" to "anon";

grant update on table "public"."cuisines" to "anon";

grant delete on table "public"."cuisines" to "authenticated";

grant insert on table "public"."cuisines" to "authenticated";

grant references on table "public"."cuisines" to "authenticated";

grant select on table "public"."cuisines" to "authenticated";

grant trigger on table "public"."cuisines" to "authenticated";

grant truncate on table "public"."cuisines" to "authenticated";

grant update on table "public"."cuisines" to "authenticated";

grant delete on table "public"."cuisines" to "service_role";

grant insert on table "public"."cuisines" to "service_role";

grant references on table "public"."cuisines" to "service_role";

grant select on table "public"."cuisines" to "service_role";

grant trigger on table "public"."cuisines" to "service_role";

grant truncate on table "public"."cuisines" to "service_role";

grant update on table "public"."cuisines" to "service_role";

grant delete on table "public"."dishes" to "anon";

grant insert on table "public"."dishes" to "anon";

grant references on table "public"."dishes" to "anon";

grant select on table "public"."dishes" to "anon";

grant trigger on table "public"."dishes" to "anon";

grant truncate on table "public"."dishes" to "anon";

grant update on table "public"."dishes" to "anon";

grant delete on table "public"."dishes" to "authenticated";

grant insert on table "public"."dishes" to "authenticated";

grant references on table "public"."dishes" to "authenticated";

grant select on table "public"."dishes" to "authenticated";

grant trigger on table "public"."dishes" to "authenticated";

grant truncate on table "public"."dishes" to "authenticated";

grant update on table "public"."dishes" to "authenticated";

grant delete on table "public"."dishes" to "service_role";

grant insert on table "public"."dishes" to "service_role";

grant references on table "public"."dishes" to "service_role";

grant select on table "public"."dishes" to "service_role";

grant trigger on table "public"."dishes" to "service_role";

grant truncate on table "public"."dishes" to "service_role";

grant update on table "public"."dishes" to "service_role";

grant delete on table "public"."menus" to "anon";

grant insert on table "public"."menus" to "anon";

grant references on table "public"."menus" to "anon";

grant select on table "public"."menus" to "anon";

grant trigger on table "public"."menus" to "anon";

grant truncate on table "public"."menus" to "anon";

grant update on table "public"."menus" to "anon";

grant delete on table "public"."menus" to "authenticated";

grant insert on table "public"."menus" to "authenticated";

grant references on table "public"."menus" to "authenticated";

grant select on table "public"."menus" to "authenticated";

grant trigger on table "public"."menus" to "authenticated";

grant truncate on table "public"."menus" to "authenticated";

grant update on table "public"."menus" to "authenticated";

grant delete on table "public"."menus" to "service_role";

grant insert on table "public"."menus" to "service_role";

grant references on table "public"."menus" to "service_role";

grant select on table "public"."menus" to "service_role";

grant trigger on table "public"."menus" to "service_role";

grant truncate on table "public"."menus" to "service_role";

grant update on table "public"."menus" to "service_role";

grant delete on table "public"."password_reset_codes" to "anon";

grant insert on table "public"."password_reset_codes" to "anon";

grant references on table "public"."password_reset_codes" to "anon";

grant select on table "public"."password_reset_codes" to "anon";

grant trigger on table "public"."password_reset_codes" to "anon";

grant truncate on table "public"."password_reset_codes" to "anon";

grant update on table "public"."password_reset_codes" to "anon";

grant delete on table "public"."password_reset_codes" to "authenticated";

grant insert on table "public"."password_reset_codes" to "authenticated";

grant references on table "public"."password_reset_codes" to "authenticated";

grant select on table "public"."password_reset_codes" to "authenticated";

grant trigger on table "public"."password_reset_codes" to "authenticated";

grant truncate on table "public"."password_reset_codes" to "authenticated";

grant update on table "public"."password_reset_codes" to "authenticated";

grant delete on table "public"."password_reset_codes" to "service_role";

grant insert on table "public"."password_reset_codes" to "service_role";

grant references on table "public"."password_reset_codes" to "service_role";

grant select on table "public"."password_reset_codes" to "service_role";

grant trigger on table "public"."password_reset_codes" to "service_role";

grant truncate on table "public"."password_reset_codes" to "service_role";

grant update on table "public"."password_reset_codes" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."restaurants" to "anon";

grant insert on table "public"."restaurants" to "anon";

grant references on table "public"."restaurants" to "anon";

grant select on table "public"."restaurants" to "anon";

grant trigger on table "public"."restaurants" to "anon";

grant truncate on table "public"."restaurants" to "anon";

grant update on table "public"."restaurants" to "anon";

grant delete on table "public"."restaurants" to "authenticated";

grant insert on table "public"."restaurants" to "authenticated";

grant references on table "public"."restaurants" to "authenticated";

grant select on table "public"."restaurants" to "authenticated";

grant trigger on table "public"."restaurants" to "authenticated";

grant truncate on table "public"."restaurants" to "authenticated";

grant update on table "public"."restaurants" to "authenticated";

grant delete on table "public"."restaurants" to "service_role";

grant insert on table "public"."restaurants" to "service_role";

grant references on table "public"."restaurants" to "service_role";

grant select on table "public"."restaurants" to "service_role";

grant trigger on table "public"."restaurants" to "service_role";

grant truncate on table "public"."restaurants" to "service_role";

grant update on table "public"."restaurants" to "service_role";

grant delete on table "public"."reviews" to "anon";

grant insert on table "public"."reviews" to "anon";

grant references on table "public"."reviews" to "anon";

grant select on table "public"."reviews" to "anon";

grant trigger on table "public"."reviews" to "anon";

grant truncate on table "public"."reviews" to "anon";

grant update on table "public"."reviews" to "anon";

grant delete on table "public"."reviews" to "authenticated";

grant insert on table "public"."reviews" to "authenticated";

grant references on table "public"."reviews" to "authenticated";

grant select on table "public"."reviews" to "authenticated";

grant trigger on table "public"."reviews" to "authenticated";

grant truncate on table "public"."reviews" to "authenticated";

grant update on table "public"."reviews" to "authenticated";

grant delete on table "public"."reviews" to "service_role";

grant insert on table "public"."reviews" to "service_role";

grant references on table "public"."reviews" to "service_role";

grant select on table "public"."reviews" to "service_role";

grant trigger on table "public"."reviews" to "service_role";

grant truncate on table "public"."reviews" to "service_role";

grant update on table "public"."reviews" to "service_role";

create policy "Public profiles are viewable by everyone"
on "public"."profiles"
as permissive
for select
to public
using (true);


create policy "Users can insert their own profile"
on "public"."profiles"
as permissive
for insert
to public
with check ((auth.uid() = id));


create policy "Users can update their own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


CREATE TRIGGER addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER cuisines_updated_at BEFORE UPDATE ON public.cuisines FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER dishes_updated_at BEFORE UPDATE ON public.dishes FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER menus_updated_at BEFORE UPDATE ON public.menus FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_password_reset_codes_updated_at BEFORE UPDATE ON public.password_reset_codes FOR EACH ROW EXECUTE FUNCTION update_password_reset_codes_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


