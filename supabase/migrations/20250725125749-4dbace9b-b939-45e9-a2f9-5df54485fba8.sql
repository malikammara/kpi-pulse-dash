-- Create admin emails table
CREATE TABLE public.admin_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create KPI data table
CREATE TABLE public.kpi_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  margin DECIMAL(12,2) DEFAULT 0,
  calls INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  solo_closing INTEGER DEFAULT 0,
  out_house_meetings INTEGER DEFAULT 0,
  in_house_meetings INTEGER DEFAULT 0,
  product_knowledge DECIMAL(5,2) DEFAULT 0,
  smd DECIMAL(5,2) DEFAULT 0,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Enable RLS
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_data ENABLE ROW LEVEL SECURITY;

-- Insert initial admin emails
INSERT INTO public.admin_emails (email) VALUES 
  ('tahakhadim@gmail.com'),
  ('syedyousufhussainzaidi@gmail.com');

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_emails 
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RLS Policies for admin_emails
CREATE POLICY "Admins can view all admin emails" 
ON public.admin_emails FOR SELECT 
USING (public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Admins can insert admin emails" 
ON public.admin_emails FOR INSERT 
WITH CHECK (public.is_admin(auth.jwt() ->> 'email'));

-- RLS Policies for employees
CREATE POLICY "Admins can view all employees" 
ON public.employees FOR SELECT 
USING (public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Admins can insert employees" 
ON public.employees FOR INSERT 
WITH CHECK (public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Admins can update employees" 
ON public.employees FOR UPDATE 
USING (public.is_admin(auth.jwt() ->> 'email'));

-- RLS Policies for kpi_data
CREATE POLICY "Admins can view all kpi data" 
ON public.kpi_data FOR SELECT 
USING (public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Admins can insert kpi data" 
ON public.kpi_data FOR INSERT 
WITH CHECK (public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Admins can update kpi data" 
ON public.kpi_data FOR UPDATE 
USING (public.is_admin(auth.jwt() ->> 'email'));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kpi_data_updated_at
  BEFORE UPDATE ON public.kpi_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();