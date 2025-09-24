import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  employees?: {
    name: string;
    email: string;
  };
}

export const useKPIData = (filters?: {
  employeeId?: string;
  month?: string;
  year?: string;
}) => {
  return useQuery({
    queryKey: ['kpi-data', filters],
    queryFn: async () => {
      let query = supabase
        .from('kpi_data')
        .select(`
          *,
          employees:employee_id (
            name,
            email
          )
        `)
        .order('date', { ascending: false });

      if (filters?.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }

      if (filters?.month && filters?.year) {
        const startDate = `${filters.year}-${filters.month.padStart(2, '0')}-01`;
        const endDate = new Date(parseInt(filters.year), parseInt(filters.month), 0).toISOString().split('T')[0];
        query = query.gte('date', startDate).lte('date', endDate);
      } else if (filters?.year) {
        // If only year is provided, get data for the entire year
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as KPIData[];
    }
  });
};

export const useAddKPIData = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (kpiData: Omit<KPIData, 'id' | 'employees'>) => {
      const { data, error } = await supabase
        .from('kpi_data')
        .upsert([kpiData], { 
          onConflict: 'employee_id,date'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-data'] });
      toast({
        title: "KPI Data Saved",
        description: "Daily KPI data has been successfully saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save KPI data.",
        variant: "destructive",
      });
    }
  });
};