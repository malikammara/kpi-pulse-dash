/*
  # Create CRM Tables for Employee Contact Management

  1. New Tables
    - `contacts` - Store prospect/client contact information
    - `contact_followups` - Store followup history and scheduled followups
    - `contact_meetings` - Store meeting records
    - `contact_accounts` - Store account opening and margin information

  2. Security
    - Enable RLS on all tables
    - Add policies for employees to access their own data
    - Add policies for admins to access all data

  3. Features
    - Contact categorization (interested, not interested, sent details, etc.)
    - Followup scheduling with notifications
    - Meeting tracking
    - Account opening and margin tracking
*/

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  category TEXT NOT NULL DEFAULT 'new' CHECK (category IN ('new', 'interested', 'not_interested', 'sent_details', 'in_followup', 'will_show_meeting', 'meeting_done', 'account_opened')),
  notes TEXT,
  source TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact followups table
CREATE TABLE IF NOT EXISTS public.contact_followups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  followup_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  comments TEXT,
  next_followup_date TIMESTAMP WITH TIME ZONE,
  notification_sent BOOLEAN DEFAULT FALSE,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact meetings table
CREATE TABLE IF NOT EXISTS public.contact_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_type TEXT DEFAULT 'in_person' CHECK (meeting_type IN ('in_person', 'video_call', 'phone_call')),
  duration_minutes INTEGER,
  outcome TEXT,
  notes TEXT,
  next_steps TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact accounts table
CREATE TABLE IF NOT EXISTS public.contact_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  account_opening_date DATE NOT NULL,
  account_number TEXT,
  initial_margin DECIMAL(12,2) DEFAULT 0,
  current_margin DECIMAL(12,2) DEFAULT 0,
  margin_history JSONB DEFAULT '[]',
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'closed')),
  notes TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts
CREATE POLICY "Employees can view their own contacts" 
ON public.contacts FOR SELECT 
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Admins can view all contacts" 
ON public.contacts FOR SELECT 
USING (public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Employees can insert their own contacts" 
ON public.contacts FOR INSERT 
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Admins can insert contacts" 
ON public.contacts FOR INSERT 
WITH CHECK (public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Employees can update their own contacts" 
ON public.contacts FOR UPDATE 
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Admins can update all contacts" 
ON public.contacts FOR UPDATE 
USING (public.is_admin(auth.jwt() ->> 'email'));

-- RLS Policies for contact_followups
CREATE POLICY "Employees can view their own followups" 
ON public.contact_followups FOR SELECT 
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Admins can view all followups" 
ON public.contact_followups FOR SELECT 
USING (public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Employees can insert their own followups" 
ON public.contact_followups FOR INSERT 
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Admins can insert followups" 
ON public.contact_followups FOR INSERT 
WITH CHECK (public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Employees can update their own followups" 
ON public.contact_followups FOR UPDATE 
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Admins can update all followups" 
ON public.contact_followups FOR UPDATE 
USING (public.is_admin(auth.jwt() ->> 'email'));

-- RLS Policies for contact_meetings
CREATE POLICY "Employees can view their own meetings" 
ON public.contact_meetings FOR SELECT 
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Admins can view all meetings" 
ON public.contact_meetings FOR SELECT 
USING (public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Employees can insert their own meetings" 
ON public.contact_meetings FOR INSERT 
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Admins can insert meetings" 
ON public.contact_meetings FOR INSERT 
WITH CHECK (public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Employees can update their own meetings" 
ON public.contact_meetings FOR UPDATE 
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Admins can update all meetings" 
ON public.contact_meetings FOR UPDATE 
USING (public.is_admin(auth.jwt() ->> 'email'));

-- RLS Policies for contact_accounts
CREATE POLICY "Employees can view their own accounts" 
ON public.contact_accounts FOR SELECT 
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Admins can view all accounts" 
ON public.contact_accounts FOR SELECT 
USING (public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Employees can insert their own accounts" 
ON public.contact_accounts FOR INSERT 
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Admins can insert accounts" 
ON public.contact_accounts FOR INSERT 
WITH CHECK (public.is_admin(auth.jwt() ->> 'email'));

CREATE POLICY "Employees can update their own accounts" 
ON public.contact_accounts FOR UPDATE 
USING (
  employee_id IN (
    SELECT id FROM public.employees 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Admins can update all accounts" 
ON public.contact_accounts FOR UPDATE 
USING (public.is_admin(auth.jwt() ->> 'email'));

-- Create triggers for updated_at
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_followups_updated_at
  BEFORE UPDATE ON public.contact_followups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_meetings_updated_at
  BEFORE UPDATE ON public.contact_meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_accounts_updated_at
  BEFORE UPDATE ON public.contact_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_employee_id ON public.contacts(employee_id);
CREATE INDEX IF NOT EXISTS idx_contacts_category ON public.contacts(category);
CREATE INDEX IF NOT EXISTS idx_contact_followups_employee_id ON public.contact_followups(employee_id);
CREATE INDEX IF NOT EXISTS idx_contact_followups_contact_id ON public.contact_followups(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_followups_date ON public.contact_followups(followup_date);
CREATE INDEX IF NOT EXISTS idx_contact_meetings_employee_id ON public.contact_meetings(employee_id);
CREATE INDEX IF NOT EXISTS idx_contact_meetings_contact_id ON public.contact_meetings(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_accounts_employee_id ON public.contact_accounts(employee_id);
CREATE INDEX IF NOT EXISTS idx_contact_accounts_contact_id ON public.contact_accounts(contact_id);