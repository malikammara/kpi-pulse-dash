import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export const useContacts = (employeeId?: string) => {
  return useQuery({
    queryKey: ['contacts', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('contacts')
        .select(`
          *,
          employees:employee_id (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Contact[];
    }
  });
};

export const useAddContact = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'employees'>) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contact])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Contact Added",
        description: "New contact has been successfully added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add contact.",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Contact> & { id: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Contact Updated",
        description: "Contact has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update contact.",
        variant: "destructive",
      });
    }
  });
};

export const useContactFollowups = (contactId?: string, employeeId?: string) => {
  return useQuery({
    queryKey: ['contact-followups', contactId, employeeId],
    queryFn: async () => {
      let query = supabase
        .from('contact_followups')
        .select(`
          *,
          contacts:contact_id (
            name
          )
        `)
        .order('followup_date', { ascending: false });

      if (contactId) {
        query = query.eq('contact_id', contactId);
      }
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as ContactFollowup[];
    }
  });
};

export const useAddContactFollowup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (followup: Omit<ContactFollowup, 'id' | 'created_at' | 'updated_at' | 'contacts'>) => {
      const { data, error } = await supabase
        .from('contact_followups')
        .insert([followup])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-followups'] });
      toast({
        title: "Followup Added",
        description: "Followup has been successfully scheduled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add followup.",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateContactFollowup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContactFollowup> & { id: string }) => {
      const { data, error } = await supabase
        .from('contact_followups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-followups'] });
      toast({
        title: "Followup Updated",
        description: "Followup has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update followup.",
        variant: "destructive",
      });
    }
  });
};

export const useContactMeetings = (contactId?: string, employeeId?: string) => {
  return useQuery({
    queryKey: ['contact-meetings', contactId, employeeId],
    queryFn: async () => {
      let query = supabase
        .from('contact_meetings')
        .select(`
          *,
          contacts:contact_id (
            name
          )
        `)
        .order('meeting_date', { ascending: false });

      if (contactId) {
        query = query.eq('contact_id', contactId);
      }
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as ContactMeeting[];
    }
  });
};

export const useAddContactMeeting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (meeting: Omit<ContactMeeting, 'id' | 'created_at' | 'updated_at' | 'contacts'>) => {
      const { data, error } = await supabase
        .from('contact_meetings')
        .insert([meeting])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-meetings'] });
      toast({
        title: "Meeting Added",
        description: "Meeting has been successfully recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add meeting.",
        variant: "destructive",
      });
    }
  });
};

export const useContactAccounts = (contactId?: string, employeeId?: string) => {
  return useQuery({
    queryKey: ['contact-accounts', contactId, employeeId],
    queryFn: async () => {
      let query = supabase
        .from('contact_accounts')
        .select(`
          *,
          contacts:contact_id (
            name
          )
        `)
        .order('account_opening_date', { ascending: false });

      if (contactId) {
        query = query.eq('contact_id', contactId);
      }
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as ContactAccount[];
    }
  });
};

export const useAddContactAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (account: Omit<ContactAccount, 'id' | 'created_at' | 'updated_at' | 'contacts'>) => {
      const { data, error } = await supabase
        .from('contact_accounts')
        .insert([account])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-accounts'] });
      toast({
        title: "Account Added",
        description: "Account has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add account.",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateContactAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContactAccount> & { id: string }) => {
      const { data, error } = await supabase
        .from('contact_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-accounts'] });
      toast({
        title: "Account Updated",
        description: "Account has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update account.",
        variant: "destructive",
      });
    }
  });
};