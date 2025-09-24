

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."cleanup_expired_reset_codes"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM password_reset_codes 
    WHERE expires_at < NOW() - INTERVAL '1 day';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_reset_codes"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "street" "jsonb" NOT NULL,
    "number" character varying(20) NOT NULL,
    "additional_information" "text",
    "postal_code" character varying(20) NOT NULL,
    "city" "jsonb" NOT NULL,
    "country" "jsonb" NOT NULL,
    "coordinates" "jsonb" NOT NULL,
    "formatted_address" "text"
);


ALTER TABLE "public"."addresses" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_addresses_within_radius"("center_lat" double precision, "center_lng" double precision, "radius_km" double precision, "max_results" integer DEFAULT 20) RETURNS SETOF "public"."addresses"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_addresses_within_radius"("center_lat" double precision, "center_lng" double precision, "radius_km" double precision, "max_results" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  user_name text;
  user_username text;
  user_photo text;
  user_language text;
BEGIN
  -- Extraer datos del metadata o usar valores por defecto
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name', 
    split_part(NEW.email, '@', 1)
  );
  
  user_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || FLOOR(RANDOM() * 1000)::text
  );
  
  user_photo := NEW.raw_user_meta_data->>'picture'; -- Google usa 'picture', no 'photo'
  
  user_language := COALESCE(
    NEW.raw_user_meta_data->>'language',
    'es_ES'
  );

  -- Insertar perfil con manejo de errores
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
      user_username,
      user_name,
      user_photo,
      user_language,
      CASE WHEN NEW.encrypted_password IS NOT NULL AND NEW.encrypted_password != '' THEN true ELSE false END
    );
    
  EXCEPTION WHEN others THEN
    -- Si falla, intentar con username alternativo
    user_username := 'user_' || EXTRACT(EPOCH FROM NOW())::bigint || '_' || FLOOR(RANDOM() * 1000)::text;
    
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
      user_username,
      user_name,
      user_photo,
      user_language,
      CASE WHEN NEW.encrypted_password IS NOT NULL AND NEW.encrypted_password != '' THEN true ELSE false END
    );
  END;
  
  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Log del error (si tienes logging habilitado)
  RAISE LOG 'Error en handle_new_user: %', SQLERRM;
  RETURN NEW; -- Continúa aunque falle el perfil
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_password_reset_codes_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_password_reset_codes_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_owns_restaurant"("restaurant_id_param" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- This would need to query your actual restaurants table
  -- For now, we'll return true and handle in application logic
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."user_owns_restaurant"("restaurant_id_param" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_owns_review"("review_id_param" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- This would need to query your actual reviews table
  -- For now, we'll return true and handle in application logic
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."user_owns_review"("review_id_param" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cuisines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "name" "jsonb" NOT NULL,
    "image" "text" NOT NULL
);


ALTER TABLE "public"."cuisines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dishes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "menu_id" "uuid" NOT NULL,
    "name" "jsonb" NOT NULL,
    "description" "jsonb" NOT NULL,
    "extra_price" numeric(10,2) DEFAULT 0 NOT NULL,
    "category" character varying(50) NOT NULL,
    "is_vegetarian" boolean DEFAULT false NOT NULL,
    "is_lactose_free" boolean DEFAULT false NOT NULL,
    "is_spicy" boolean DEFAULT false NOT NULL,
    "is_gluten_free" boolean DEFAULT false NOT NULL,
    "is_vegan" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    CONSTRAINT "dishes_category_check" CHECK ((("category")::"text" = ANY (ARRAY[('appetizers'::character varying)::"text", ('firstCourses'::character varying)::"text", ('secondCourses'::character varying)::"text", ('mainCourses'::character varying)::"text", ('sides'::character varying)::"text", ('desserts'::character varying)::"text", ('drinks'::character varying)::"text"]))),
    CONSTRAINT "dishes_extra_price_check" CHECK (("extra_price" >= (0)::numeric))
);


ALTER TABLE "public"."dishes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."menus" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "restaurant_id" "uuid" NOT NULL,
    "name" "jsonb" NOT NULL,
    "days" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "first_courses_to_share" boolean DEFAULT false NOT NULL,
    "second_courses_to_share" boolean DEFAULT false NOT NULL,
    "desserts_to_share" boolean DEFAULT false NOT NULL,
    "includes_bread" boolean DEFAULT false NOT NULL,
    "drinks" "jsonb" DEFAULT '{"beer": false, "wine": false, "water": false, "soft_drinks": false}'::"jsonb" NOT NULL,
    "includes_coffee_and_dessert" character varying(20) DEFAULT 'none'::character varying NOT NULL,
    "minimum_people" integer DEFAULT 1 NOT NULL,
    "has_minimum_people" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "menus_includes_coffee_and_dessert_check" CHECK ((("includes_coffee_and_dessert")::"text" = ANY (ARRAY[('none'::character varying)::"text", ('coffee'::character varying)::"text", ('dessert'::character varying)::"text", ('both'::character varying)::"text"]))),
    CONSTRAINT "menus_minimum_people_check" CHECK (("minimum_people" >= 1)),
    CONSTRAINT "menus_price_check" CHECK (("price" >= (0)::numeric))
);


ALTER TABLE "public"."menus" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."password_reset_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "code_hash" character varying(255) NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "is_used" boolean DEFAULT false,
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."password_reset_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "username" "text" NOT NULL,
    "name" "text" NOT NULL,
    "photo" "text",
    "language" "text" DEFAULT 'es_ES'::"text" NOT NULL,
    "has_password" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";

COMMENT ON TABLE "public"."profiles" IS 'User profiles linked to auth.users';


CREATE TABLE IF NOT EXISTS "public"."restaurants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "name" character varying(255) NOT NULL,
    "minimum_price" numeric(10,2) NOT NULL,
    "cuisine_id" "uuid" NOT NULL,
    "rating" numeric(3,2),
    "profile_image" "text",
    "images" "text"[] DEFAULT '{}'::"text"[],
    "address_id" "uuid" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "phone" character varying(50),
    "reservation_link" "text",
    "owner_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "restaurants_minimum_price_check" CHECK (("minimum_price" >= (0)::numeric)),
    CONSTRAINT "restaurants_rating_check" CHECK ((("rating" >= (0)::numeric) AND ("rating" <= (5)::numeric)))
);


ALTER TABLE "public"."restaurants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "restaurant_id" "uuid" NOT NULL,
    "rating" numeric(3,2) NOT NULL,
    "comment" "jsonb" NOT NULL,
    "photos" "text"[] DEFAULT '{}'::"text"[],
    "restaurant_response_message" "jsonb",
    "restaurant_response_date" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= (0)::numeric) AND ("rating" <= (5)::numeric)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cuisines"
    ADD CONSTRAINT "cuisines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dishes"
    ADD CONSTRAINT "dishes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."menus"
    ADD CONSTRAINT "menus_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."password_reset_codes"
    ADD CONSTRAINT "password_reset_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."restaurants"
    ADD CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_restaurant_id_key" UNIQUE ("profile_id", "restaurant_id");



CREATE INDEX "idx_dishes_category" ON "public"."dishes" USING "btree" ("category");



CREATE INDEX "idx_dishes_is_active" ON "public"."dishes" USING "btree" ("is_active");



CREATE INDEX "idx_dishes_menu_id" ON "public"."dishes" USING "btree" ("menu_id");



CREATE INDEX "idx_menus_deleted_at" ON "public"."menus" USING "btree" ("deleted_at");



CREATE INDEX "idx_menus_is_active" ON "public"."menus" USING "btree" ("is_active");



CREATE INDEX "idx_menus_restaurant_id" ON "public"."menus" USING "btree" ("restaurant_id");



CREATE INDEX "idx_password_reset_codes_expires_at" ON "public"."password_reset_codes" USING "btree" ("expires_at");



CREATE INDEX "idx_password_reset_codes_is_used" ON "public"."password_reset_codes" USING "btree" ("is_used");



CREATE INDEX "idx_password_reset_codes_user_active" ON "public"."password_reset_codes" USING "btree" ("user_id", "is_used", "expires_at") WHERE ("is_used" = false);



CREATE INDEX "idx_password_reset_codes_user_id" ON "public"."password_reset_codes" USING "btree" ("user_id");



CREATE INDEX "idx_restaurants_cuisine_id" ON "public"."restaurants" USING "btree" ("cuisine_id");



CREATE INDEX "idx_restaurants_deleted_at" ON "public"."restaurants" USING "btree" ("deleted_at");



CREATE INDEX "idx_restaurants_is_active" ON "public"."restaurants" USING "btree" ("is_active");



CREATE INDEX "idx_restaurants_owner_id" ON "public"."restaurants" USING "btree" ("owner_id");



CREATE INDEX "idx_restaurants_rating" ON "public"."restaurants" USING "btree" ("rating");



CREATE INDEX "idx_reviews_deleted_at" ON "public"."reviews" USING "btree" ("deleted_at");



CREATE INDEX "idx_reviews_rating" ON "public"."reviews" USING "btree" ("rating");



CREATE INDEX "idx_reviews_restaurant_id" ON "public"."reviews" USING "btree" ("restaurant_id");



CREATE INDEX "idx_reviews_user_id" ON "public"."reviews" USING "btree" ("profile_id");



CREATE INDEX "profiles_deleted_at_idx" ON "public"."profiles" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);



CREATE INDEX "profiles_email_idx" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "profiles_username_idx" ON "public"."profiles" USING "btree" ("username");



CREATE OR REPLACE TRIGGER "addresses_updated_at" BEFORE UPDATE ON "public"."addresses" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "cuisines_updated_at" BEFORE UPDATE ON "public"."cuisines" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "dishes_updated_at" BEFORE UPDATE ON "public"."dishes" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "menus_updated_at" BEFORE UPDATE ON "public"."menus" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "restaurants_updated_at" BEFORE UPDATE ON "public"."restaurants" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "reviews_updated_at" BEFORE UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_password_reset_codes_updated_at" BEFORE UPDATE ON "public"."password_reset_codes" FOR EACH ROW EXECUTE FUNCTION "public"."update_password_reset_codes_updated_at"();



ALTER TABLE ONLY "public"."dishes"
    ADD CONSTRAINT "dishes_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."menus"
    ADD CONSTRAINT "menus_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."restaurants"
    ADD CONSTRAINT "restaurants_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."restaurants"
    ADD CONSTRAINT "restaurants_cuisine_id_fkey" FOREIGN KEY ("cuisine_id") REFERENCES "public"."cuisines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."restaurants"
    ADD CONSTRAINT "restaurants_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE CASCADE;



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can delete their own profile" ON "public"."profiles" FOR DELETE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."cleanup_expired_reset_codes"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_reset_codes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_reset_codes"() TO "service_role";



GRANT ALL ON TABLE "public"."addresses" TO "anon";
GRANT ALL ON TABLE "public"."addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."addresses" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_addresses_within_radius"("center_lat" double precision, "center_lng" double precision, "radius_km" double precision, "max_results" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_addresses_within_radius"("center_lat" double precision, "center_lng" double precision, "radius_km" double precision, "max_results" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_addresses_within_radius"("center_lat" double precision, "center_lng" double precision, "radius_km" double precision, "max_results" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_password_reset_codes_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_password_reset_codes_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_password_reset_codes_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_owns_restaurant"("restaurant_id_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."user_owns_restaurant"("restaurant_id_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_owns_restaurant"("restaurant_id_param" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."user_owns_review"("review_id_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."user_owns_review"("review_id_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_owns_review"("review_id_param" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."cuisines" TO "anon";
GRANT ALL ON TABLE "public"."cuisines" TO "authenticated";
GRANT ALL ON TABLE "public"."cuisines" TO "service_role";



GRANT ALL ON TABLE "public"."dishes" TO "anon";
GRANT ALL ON TABLE "public"."dishes" TO "authenticated";
GRANT ALL ON TABLE "public"."dishes" TO "service_role";



GRANT ALL ON TABLE "public"."menus" TO "anon";
GRANT ALL ON TABLE "public"."menus" TO "authenticated";
GRANT ALL ON TABLE "public"."menus" TO "service_role";



GRANT ALL ON TABLE "public"."password_reset_codes" TO "anon";
GRANT ALL ON TABLE "public"."password_reset_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."password_reset_codes" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."restaurants" TO "anon";
GRANT ALL ON TABLE "public"."restaurants" TO "authenticated";
GRANT ALL ON TABLE "public"."restaurants" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
