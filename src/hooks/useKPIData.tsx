// useKPIData.ts
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
  employees?: { name: string; email: string };
}

type KPIColumn =
  | "date"
  | "employee_id"
  | "margin"
  | "calls"
  | "leads_generated"
  | "solo_closing"
  | "out_house_meetings"
  | "in_house_meetings"
  | "product_knowledge"
  | "smd";

type Filters = {
  employeeId?: string;
  month?: string;   // "01"..."12"
  year?: string;    // "2025"
  columns?: KPIColumn[];        // <-- NEW: only fetch what you need
  withEmployees?: boolean;      // <-- NEW: only join when requested
};

type Options = { enabled?: boolean }; // <-- NEW: conditional fetches

export const useKPIData = (filters?: Filters, options?: Options) => {
  return useQuery({
    queryKey: ["kpi-data", filters],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const cols = (filters?.columns?.length ? filters.columns : ["*"]).join(",");
      let selectStr = cols;

      if (filters?.withEmployees) {
        selectStr += `, employees:employee_id ( name, email )`;
      }

      let query = supabase
        .from("kpi_data")
        .select(selectStr)
        .order("date", { ascending: false });

      if (filters?.employeeId) {
        query = query.eq("employee_id", filters.employeeId);
      }

      if (filters?.month && filters?.year) {
        const startDate = `${filters.year}-${filters.month.padStart(2, "0")}-01`;
        const endDate = new Date(
          parseInt(filters.year, 10),
          parseInt(filters.month, 10),
          0
        )
          .toISOString()
          .split("T")[0];

        query = query.gte("date", startDate).lte("date", endDate);
      } else if (filters?.year) {
        query = query
          .gte("date", `${filters.year}-01-01`)
          .lte("date", `${filters.year}-12-31`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Partial<KPIData>[];
    },
  });
};

// (unchanged) useAddKPIData...
export const useAddKPIData = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (kpiData: Omit<KPIData, "id" | "employees">) => {
      const { data, error } = await supabase
        .from("kpi_data")
        .upsert([kpiData], { onConflict: "employee_id,date" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpi-data"] });
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
    },
  });
};
