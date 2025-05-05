-- Create users_view to display user information
create view public.users_view as
select
  users.id,
  users.name,
  users.role,
  users.identifier_code,
  users.subject,
  users.grade,
  users.created_at,
  users.updated_at
from
  users;

-- Grant access to the view
GRANT SELECT ON public.users_view TO authenticated;
GRANT SELECT ON public.users_view TO anon;
