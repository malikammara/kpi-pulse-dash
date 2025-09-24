import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type KPIMetric =
  | "margin"
  | "calls"
  | "leads_generated"
  | "solo_closing"
  | "out_house_meetings"
  | "in_house_meetings"
  | "product_knowledge"
  | "smd";

export interface KPIMonthlyRow {
  month: string;     // 'Jan 2025'
  month_key: string; // '2025-01'
  value: number;     // sum or avg from RPC
}

export const useKPIMonthly = (params: {
  kpi: KPIMetric;
  year: number;
  employeeId?: string;
}) => {
  const { kpi, year, employeeId } = params;

  return useQuery({
    queryKey: ["kpi-monthly", { kpi, year, employeeId }],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("kpi_monthly", {
        _kpi: kpi,
        _year: year,
        _employee: employeeId ?? null,
      });

      if (error) throw error;
      return (data ?? []) as KPIMonthlyRow[];
    },
  });
};
