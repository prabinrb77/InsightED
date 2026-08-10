-- Optional demonstration tenants. Run after migrations in SQL Editor.
-- Demo browser logins work without this file; these rows are for a connected project.
insert into schools (id,name,country) values
  ('10000000-0000-0000-0000-000000000001','Harbourview Primary','Australia'),
  ('10000000-0000-0000-0000-000000000002','Banksia Grove School','Australia'),
  ('10000000-0000-0000-0000-000000000003','Rivergum College','Australia')
on conflict (id) do update set name=excluded.name;

insert into students (school_id,student_code,first_name,last_name,class_group) values
  ('10000000-0000-0000-0000-000000000001','4021','Ethan','Miller','Grade 4'),
  ('10000000-0000-0000-0000-000000000001','4022','Maya','Reid','Grade 4'),
  ('10000000-0000-0000-0000-000000000002','4021','Liam','Brooks','Year 5'),
  ('10000000-0000-0000-0000-000000000002','4022','Zara','Khan','Year 5'),
  ('10000000-0000-0000-0000-000000000003','4021','Evie','Campbell','Year 7'),
  ('10000000-0000-0000-0000-000000000003','4022','Aiden','Nguyen','Year 8')
on conflict (school_id,student_code) where archived_at is null do nothing;
