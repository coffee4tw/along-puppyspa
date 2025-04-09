-- Enable Row Level Security (RLS)
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- Create owners table
create table if not exists public.owners (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text not null,
    phone text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create puppies table
create table if not exists public.puppies (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    breed text not null,
    age integer not null,
    notes text,
    owner_id uuid references public.owners(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create services table
create table if not exists public.services (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text not null,
    estimated_duration integer not null, -- in minutes
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create waiting_list table
create table if not exists public.waiting_list (
    id uuid default gen_random_uuid() primary key,
    owner_id uuid references public.owners(id) on delete cascade not null,
    puppy_id uuid references public.puppies(id) on delete cascade not null,
    service_id uuid references public.services(id) on delete cascade not null,
    arrival_time timestamp with time zone default timezone('utc'::text, now()) not null,
    status text check (status in ('waiting', 'in-progress', 'completed', 'cancelled')) not null default 'waiting',
    notes text,
    completed_at timestamp with time zone,
    position integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists idx_puppies_owner_id on public.puppies(owner_id);
create index if not exists idx_waiting_list_owner_id on public.waiting_list(owner_id);
create index if not exists idx_waiting_list_puppy_id on public.waiting_list(puppy_id);
create index if not exists idx_waiting_list_service_id on public.waiting_list(service_id);
create index if not exists idx_waiting_list_status on public.waiting_list(status);
create index if not exists idx_waiting_list_position on public.waiting_list(position);

-- Add some sample services
insert into public.services (name, description, estimated_duration)
values 
    ('Basic Grooming', 'Basic grooming service including bath, brush, and nail trim', 60),
    ('Full Spa Package', 'Complete spa treatment including bath, haircut, nail trim, and teeth cleaning', 120),
    ('Quick Bath', 'Simple bath and blow dry', 30),
    ('Nail Trim', 'Nail trimming service', 15)
on conflict do nothing;

-- Enable Row Level Security (RLS) but allow all operations for now
alter table public.owners enable row level security;
alter table public.puppies enable row level security;
alter table public.services enable row level security;
alter table public.waiting_list enable row level security;

-- Create policies to allow all operations (we can make these more restrictive later)
create policy "Allow all operations on owners" on public.owners for all using (true);
create policy "Allow all operations on puppies" on public.puppies for all using (true);
create policy "Allow all operations on services" on public.services for all using (true);
create policy "Allow all operations on waiting_list" on public.waiting_list for all using (true);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_owners_updated_at
    before update on public.owners
    for each row
    execute function public.handle_updated_at();

create trigger handle_puppies_updated_at
    before update on public.puppies
    for each row
    execute function public.handle_updated_at();

create trigger handle_services_updated_at
    before update on public.services
    for each row
    execute function public.handle_updated_at();

create trigger handle_waiting_list_updated_at
    before update on public.waiting_list
    for each row
    execute function public.handle_updated_at(); 