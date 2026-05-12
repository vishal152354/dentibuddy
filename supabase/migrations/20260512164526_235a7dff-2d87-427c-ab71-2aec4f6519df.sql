
-- Profiles auto-created on signup
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Children
create table public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users on delete cascade,
  name text not null,
  date_of_birth date,
  gender text,
  avatar_emoji text default '🧒',
  notes text,
  created_at timestamptz not null default now()
);
alter table public.children enable row level security;
create policy "own children all" on public.children for all using (auth.uid() = parent_id) with check (auth.uid() = parent_id);

-- Dentists (public read)
create table public.dentists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  clinic_name text not null,
  specialty text default 'Pediatric Dentist',
  rating numeric(2,1) default 4.5,
  photo_url text,
  address text,
  city text,
  consultation_fee int default 500,
  experience_years int default 5,
  bio text,
  available_today boolean default true,
  created_at timestamptz not null default now()
);
alter table public.dentists enable row level security;
create policy "anyone read dentists" on public.dentists for select using (true);

-- Appointments
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users on delete cascade,
  child_id uuid not null references public.children on delete cascade,
  dentist_id uuid not null references public.dentists on delete cascade,
  appointment_date date not null,
  appointment_time time not null,
  reason text,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);
alter table public.appointments enable row level security;
create policy "own appts all" on public.appointments for all using (auth.uid() = parent_id) with check (auth.uid() = parent_id);

-- Chat messages
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.chat_messages enable row level security;
create policy "own chat all" on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tips (public read)
create table public.tips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text default 'general',
  emoji text default '🦷',
  created_at timestamptz not null default now()
);
alter table public.tips enable row level security;
create policy "anyone read tips" on public.tips for select using (true);

-- Seed dentists
insert into public.dentists (name, clinic_name, specialty, rating, address, city, consultation_fee, experience_years, bio, available_today) values
('Dr. Anika Sharma', 'Smile Kids Dental Clinic', 'Pediatric Dentist', 4.9, '12 MG Road, Bandra West', 'Mumbai', 600, 12, 'Specializes in gentle care for children aged 2-15. Loved by kids for her friendly approach.', true),
('Dr. Rohan Mehta', 'Little Tooth Care', 'Pediatric Orthodontist', 4.8, '45 Park Street, Salt Lake', 'Kolkata', 750, 10, 'Expert in early orthodontic intervention and braces for kids and teens.', true),
('Dr. Priya Iyer', 'Happy Smiles Pediatric Dentistry', 'Pediatric Dentist', 4.7, '88 Anna Nagar', 'Chennai', 500, 8, 'Passionate about preventive dental care and cavity protection for young children.', true),
('Dr. Karan Singh', 'Tiny Teeth Clinic', 'Pediatric Dentist', 4.9, '23 Connaught Place', 'New Delhi', 800, 15, 'Senior pediatric dentist with expertise in special-needs dental care.', false),
('Dr. Meera Nair', 'Bright Buddy Dental', 'Pediatric Dentist', 4.6, '7 Brigade Road', 'Bangalore', 550, 6, 'Specializes in dental sealants, fluoride therapy, and behavioral guidance.', true),
('Dr. Arjun Reddy', 'KidsFirst Dental Studio', 'Pediatric Dentist', 4.8, '101 Banjara Hills', 'Hyderabad', 650, 9, 'Combines play-based dental therapy with modern equipment.', true);

-- Seed tips
insert into public.tips (title, content, category, emoji) values
('Brush Twice a Day', 'Help your child brush for 2 minutes, twice a day, with a pea-sized amount of fluoride toothpaste.', 'hygiene', '🪥'),
('Limit Sugary Snacks', 'Sugar feeds the bacteria that cause cavities. Offer fruits, cheese, or nuts as healthier alternatives.', 'diet', '🍎'),
('First Dental Visit', 'Take your child for their first dental check-up by their first birthday or when their first tooth appears.', 'visits', '🦷'),
('Make Brushing Fun', 'Use a 2-minute song, a colorful brush, or a sticker chart to make brushing a fun daily habit.', 'hygiene', '🎵'),
('Floss Daily', 'Once two of your child''s teeth touch, it''s time to start flossing gently between them every day.', 'hygiene', '🧵'),
('Watch for Tooth Pain', 'If your child complains of tooth pain or sensitivity, book a dentist visit within 48 hours.', 'emergency', '⚠️'),
('Avoid Bottle at Bedtime', 'Never put your baby to sleep with a bottle of milk or juice — it causes early childhood cavities.', 'baby', '🍼'),
('Use a Mouthguard', 'If your child plays contact sports, a custom mouthguard prevents broken teeth and jaw injuries.', 'safety', '🛡️');
