-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'dept_head', 'super_admin');

-- Create enum for functional status
CREATE TYPE public.functional_status AS ENUM ('yes', 'no');

-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipment master table
CREATE TABLE public.equipment_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory entries table
CREATE TABLE public.inventory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL NOT NULL,
  source TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  incharge_name TEXT NOT NULL,
  incharge_mobile TEXT NOT NULL,
  alternate_number TEXT,
  district TEXT NOT NULL,
  taluk TEXT NOT NULL,
  firka TEXT NOT NULL,
  village TEXT NOT NULL,
  plot_no TEXT NOT NULL,
  street TEXT NOT NULL,
  locality TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  geocode_lat DECIMAL(10, 8) NOT NULL,
  geocode_lng DECIMAL(11, 8) NOT NULL,
  functional_status functional_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipment items table
CREATE TABLE public.equipment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_entry_id UUID REFERENCES public.inventory_entries(id) ON DELETE CASCADE NOT NULL,
  equipment_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_items ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's department
CREATE OR REPLACE FUNCTION public.get_user_department(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT department_id
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for departments
CREATE POLICY "Everyone can view departments"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage departments"
  ON public.departments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- RLS Policies for equipment_master
CREATE POLICY "Everyone can view equipment"
  ON public.equipment_master FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage equipment"
  ON public.equipment_master FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for inventory_entries
CREATE POLICY "Users can view their own entries"
  ON public.inventory_entries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Dept heads can view their department entries"
  ON public.inventory_entries FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'dept_head') 
    AND department_id = public.get_user_department(auth.uid())
  );

CREATE POLICY "Super admins can view all entries"
  ON public.inventory_entries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can create entries"
  ON public.inventory_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own entries"
  ON public.inventory_entries FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Dept heads can update their department entries"
  ON public.inventory_entries FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'dept_head') 
    AND department_id = public.get_user_department(auth.uid())
  );

CREATE POLICY "Super admins can manage all entries"
  ON public.inventory_entries FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for equipment_items
CREATE POLICY "Users can view equipment for their entries"
  ON public.equipment_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inventory_entries
      WHERE id = equipment_items.inventory_entry_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Dept heads can view equipment for their department"
  ON public.equipment_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inventory_entries
      WHERE id = equipment_items.inventory_entry_id
      AND department_id = public.get_user_department(auth.uid())
    ) AND public.has_role(auth.uid(), 'dept_head')
  );

CREATE POLICY "Super admins can view all equipment"
  ON public.equipment_items FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can create equipment for their entries"
  ON public.equipment_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inventory_entries
      WHERE id = equipment_items.inventory_entry_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage equipment for their entries"
  ON public.equipment_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inventory_entries
      WHERE id = equipment_items.inventory_entry_id
      AND user_id = auth.uid()
    )
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_entries_updated_at
  BEFORE UPDATE ON public.inventory_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some default departments
INSERT INTO public.departments (name) VALUES
  ('Agriculture'),
  ('Public Works'),
  ('Health'),
  ('Education'),
  ('Transportation');

-- Insert some default equipment
INSERT INTO public.equipment_master (name) VALUES
  ('Tractor'),
  ('Excavator'),
  ('Generator'),
  ('Water Pump'),
  ('Ambulance'),
  ('Computer'),
  ('Projector'),
  ('Vehicle');
