import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdminEmail {
  id: string;
  email: string;
  created_at: string;
}

export const useAdminEmails = () => {
  return useQuery({
    queryKey: ['admin-emails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_emails')
        .select('*')
        .order('email');
      
      if (error) throw error;
      return data as AdminEmail[];
    }
  });
};

export const useAddAdminEmail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { data, error } = await supabase
        .from('admin_emails')
        .insert([{ email }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-emails'] });
      toast({
        title: "Admin Added",
        description: "New admin email has been successfully added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add admin email.",
        variant: "destructive",
      });
    }
  });
};