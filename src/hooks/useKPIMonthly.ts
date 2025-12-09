import { useQuery } from "@tanstack/react-query";
import { demoStore } from "@/lib/demoStore";
import { KPIMonthlyRow } from "@/lib/types";

type KPIMetric =
  | "margin"
  | "calls"
  | "leads_generated"
  | "solo_closing"
  | "out_house_meetings"
  | "in_house_meetings"
  | "product_knowledge"
  | "smd";

export const useKPIMonthly = (params: {
  kpi: KPIMetric;
  year: number;
  employeeId?: string;
}) => {
  const { kpi, year, employeeId } = params;

  return useQuery({
    queryKey: ["kpi-monthly", { kpi, year, employeeId }],
    queryFn: async () => {
      return demoStore.getMonthlyKPI(kpi, year, employeeId);
    },
  });
};
