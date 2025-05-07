-- Create course_enrollments table
create table public.course_enrollments (
  id uuid not null default extensions.uuid_generate_v4 (),
  course_id uuid null,
  user_id uuid null,
  progress_percentage integer null default 0,
  last_accessed_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint course_enrollments_pkey primary key (id),
  constraint course_enrollments_course_id_user_id_key unique (course_id, user_id),
  constraint course_enrollments_course_id_fkey foreign KEY (course_id) references courses (id) on delete CASCADE,
  constraint course_enrollments_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

-- Create indexes for better query performance
create index IF not exists course_enrollments_user_id_idx on public.course_enrollments using btree (user_id) TABLESPACE pg_default;
create index IF not exists course_enrollments_course_id_idx on public.course_enrollments using btree (course_id) TABLESPACE pg_default;

-- Create trigger to automatically update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on public.course_enrollments
for each row
execute function public.handle_updated_at();
