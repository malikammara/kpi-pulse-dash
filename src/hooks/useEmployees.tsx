import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { demoStore } from "@/lib/demoStore";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/lib/types";

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => demoStore.getEmployees()
  });
};

export const useAddEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ name, email }: { name: string; email: string }) =>
      demoStore.addEmployee({ name, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Employee Added",
        description: "New employee has been successfully added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add employee.",
        variant: "destructive",
      });
    }
  });
};