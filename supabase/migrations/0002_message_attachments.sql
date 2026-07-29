-- Photos shared in educator conversations.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'message-attachments',
  'message-attachments',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Authenticated users can upload message attachments"
on storage.objects for insert
to authenticated
with check (bucket_id = 'message-attachments');

create policy "Message attachments are readable"
on storage.objects for select
to authenticated
using (bucket_id = 'message-attachments');
