revoke select on table "auth"."schema_migrations" from "postgres";

alter table "auth"."sso_providers" add column "disabled" boolean;

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


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



