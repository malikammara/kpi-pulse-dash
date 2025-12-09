import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { demoStore } from "@/lib/demoStore";
import { useToast } from "@/hooks/use-toast";

export const useAdminEmails = () => {
  return useQuery({
    queryKey: ['admin-emails'],
    queryFn: async () => demoStore.getAdminEmails()
  });
};

export const useAddAdminEmail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return demoStore.addAdminEmail(email);
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