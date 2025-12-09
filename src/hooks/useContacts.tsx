import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { demoStore } from "@/lib/demoStore";
import { useToast } from "@/hooks/use-toast";
import {
  Contact,
  ContactAccount,
  ContactFollowup,
  ContactMeeting,
} from "@/lib/types";

export const useContacts = (employeeId?: string) => {
  return useQuery({
    queryKey: ['contacts', employeeId],
    queryFn: async () => {
      const data = await demoStore.getContacts();
      return data
        .filter((contact) => !employeeId || contact.employee_id === employeeId)
        .map((contact) => ({
          ...contact,
          employees: contact.employee_id
            ? { name: contact.employees?.name ?? "", email: contact.employees?.email ?? "" }
            : undefined,
        }));
    }
  });
};

export const useAddContact = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'employees'>) =>
      demoStore.addContact(contact),
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
      return demoStore.updateContact(id, updates);
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
      const data = await demoStore.getFollowups();
      return data.filter((followup) => {
        if (contactId && followup.contact_id !== contactId) return false;
        if (employeeId && followup.employee_id !== employeeId) return false;
        return true;
      });
    }
  });
};

export const useAddContactFollowup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (followup: Omit<ContactFollowup, 'id' | 'created_at' | 'updated_at' | 'contacts'>) =>
      demoStore.addFollowup(followup),
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
      return demoStore.updateFollowup(id, updates);
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
      const data = await demoStore.getMeetings();
      return data.filter((meeting) => {
        if (contactId && meeting.contact_id !== contactId) return false;
        if (employeeId && meeting.employee_id !== employeeId) return false;
        return true;
      });
    }
  });
};

export const useAddContactMeeting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (meeting: Omit<ContactMeeting, 'id' | 'created_at' | 'updated_at' | 'contacts'>) =>
      demoStore.addMeeting(meeting),
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
      const data = await demoStore.getAccounts();
      return data.filter((account) => {
        if (contactId && account.contact_id !== contactId) return false;
        if (employeeId && account.employee_id !== employeeId) return false;
        return true;
      });
    }
  });
};

export const useAddContactAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (account: Omit<ContactAccount, 'id' | 'created_at' | 'updated_at' | 'contacts'>) =>
      demoStore.addAccount(account),
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
      return demoStore.updateAccount(id, updates);
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