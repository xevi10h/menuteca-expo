revoke select on table "auth"."schema_migrations" from "postgres";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


revoke select on table "storage"."iceberg_namespaces" from "anon";

revoke select on table "storage"."iceberg_namespaces" from "authenticated";

revoke delete on table "storage"."iceberg_namespaces" from "service_role";

revoke insert on table "storage"."iceberg_namespaces" from "service_role";

revoke references on table "storage"."iceberg_namespaces" from "service_role";

revoke select on table "storage"."iceberg_namespaces" from "service_role";

revoke trigger on table "storage"."iceberg_namespaces" from "service_role";

revoke truncate on table "storage"."iceberg_namespaces" from "service_role";

revoke update on table "storage"."iceberg_namespaces" from "service_role";

revoke select on table "storage"."iceberg_tables" from "anon";

revoke select on table "storage"."iceberg_tables" from "authenticated";

revoke delete on table "storage"."iceberg_tables" from "service_role";

revoke insert on table "storage"."iceberg_tables" from "service_role";

revoke references on table "storage"."iceberg_tables" from "service_role";

revoke select on table "storage"."iceberg_tables" from "service_role";

revoke trigger on table "storage"."iceberg_tables" from "service_role";

revoke truncate on table "storage"."iceberg_tables" from "service_role";

revoke update on table "storage"."iceberg_tables" from "service_role";

alter table "storage"."iceberg_namespaces" drop constraint "iceberg_namespaces_bucket_id_fkey";

alter table "storage"."iceberg_tables" drop constraint "iceberg_tables_bucket_id_fkey";

alter table "storage"."iceberg_tables" drop constraint "iceberg_tables_namespace_id_fkey";

alter table "storage"."iceberg_namespaces" drop constraint "iceberg_namespaces_pkey";

alter table "storage"."iceberg_tables" drop constraint "iceberg_tables_pkey";

drop index if exists "storage"."iceberg_namespaces_pkey";

drop index if exists "storage"."iceberg_tables_pkey";

drop index if exists "storage"."idx_iceberg_namespaces_bucket_id";

drop index if exists "storage"."idx_iceberg_tables_namespace_id";

drop table "storage"."iceberg_namespaces";

drop table "storage"."iceberg_tables";

grant delete on table "storage"."s3_multipart_uploads" to "postgres";

grant insert on table "storage"."s3_multipart_uploads" to "postgres";

grant references on table "storage"."s3_multipart_uploads" to "postgres";

grant select on table "storage"."s3_multipart_uploads" to "postgres";

grant trigger on table "storage"."s3_multipart_uploads" to "postgres";

grant truncate on table "storage"."s3_multipart_uploads" to "postgres";

grant update on table "storage"."s3_multipart_uploads" to "postgres";

grant delete on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant insert on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant references on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant select on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant trigger on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant truncate on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant update on table "storage"."s3_multipart_uploads_parts" to "postgres";

create policy "Anyone can view profile photos"
on "storage"."objects"
as permissive
for select
to authenticated
using ((bucket_id = 'profiles'::text));


create policy "Anyone can view restaurant images"
on "storage"."objects"
as permissive
for select
to authenticated
using ((bucket_id = 'restaurants'::text));


create policy "Anyone can view review photos"
on "storage"."objects"
as permissive
for select
to authenticated
using ((bucket_id = 'reviews'::text));


create policy "Restaurant owners can delete their restaurant images"
on "storage"."objects"
as permissive
for delete
to authenticated
using ((bucket_id = 'restaurants'::text));


create policy "Restaurant owners can update their restaurant images"
on "storage"."objects"
as permissive
for update
to authenticated
using ((bucket_id = 'restaurants'::text));


create policy "Restaurant owners can upload restaurant images"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'restaurants'::text));


create policy "Users can delete review photos"
on "storage"."objects"
as permissive
for delete
to authenticated
using ((bucket_id = 'reviews'::text));


create policy "Users can delete their own profile photos"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'profiles'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


create policy "Users can update review photos"
on "storage"."objects"
as permissive
for update
to authenticated
using ((bucket_id = 'reviews'::text));


create policy "Users can update their own profile photos"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'profiles'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


create policy "Users can upload review photos"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'reviews'::text));


create policy "Users can upload their own profile photos"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'profiles'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



