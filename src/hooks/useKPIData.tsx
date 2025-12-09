// useKPIData.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { demoStore } from "@/lib/demoStore";
import { useToast } from "@/hooks/use-toast";
import { KPIData } from "@/lib/types";

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
      const data = await demoStore.getKpiData();
      return data
        .filter((row) => {
          if (filters?.employeeId && row.employee_id !== filters.employeeId) return false;
          if (filters?.month && filters?.year) {
            const date = new Date(row.date);
            return (
              date.getFullYear().toString() === filters.year &&
              (date.getMonth() + 1).toString().padStart(2, "0") === filters.month.padStart(2, "0")
            );
          }
          if (filters?.year) {
            return new Date(row.date).getFullYear().toString() === filters.year;
          }
          return true;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
  });
};

// (unchanged) useAddKPIData...
export const useAddKPIData = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (kpiData: Omit<KPIData, "id" | "employees">) => {
      return demoStore.upsertKpiData(kpiData);
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
