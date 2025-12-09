export interface Employee {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface KPIData {
  id: string;
  employee_id: string;
  date: string;
  margin: number;
  calls: number;
  leads_generated: number;
  solo_closing: number;
  out_house_meetings: number;
  in_house_meetings: number;
  product_knowledge: number;
  smd: number;
  employees?: { name: string; email: string };
}

export interface Contact {
  id: string;
  employee_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  category: 'new' | 'interested' | 'not_interested' | 'sent_details' | 'in_followup' | 'will_show_meeting' | 'meeting_done' | 'account_opened';
  notes?: string;
  source?: string;
  created_at: string;
  updated_at: string;
  employees?: {
    name: string;
    email: string;
  };
}

export interface ContactFollowup {
  id: string;
  contact_id: string;
  employee_id: string;
  followup_date: string;
  completed: boolean;
  comments?: string;
  next_followup_date?: string;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
  contacts?: {
    name: string;
  };
}

export interface ContactMeeting {
  id: string;
  contact_id: string;
  employee_id: string;
  meeting_date: string;
  meeting_type: 'in_person' | 'video_call' | 'phone_call';
  duration_minutes?: number;
  outcome?: string;
  notes?: string;
  next_steps?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
  contacts?: {
    name: string;
  };
}

export interface ContactAccount {
  id: string;
  contact_id: string;
  employee_id: string;
  account_opening_date: string;
  account_number?: string;
  initial_margin: number;
  current_margin: number;
  margin_history: any[];
  account_status: 'active' | 'inactive' | 'closed';
  notes?: string;
  created_at: string;
  updated_at: string;
  contacts?: {
    name: string;
  };
}

export interface KPIMonthlyRow {
  month: string;
  month_key: string;
  value: number;
}
