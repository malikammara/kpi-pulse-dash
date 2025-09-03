import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { useEmployees } from "@/hooks/useEmployees";
import { useKPIData } from "@/hooks/useKPIData";
import { useAuth } from "@/hooks/useAuth";
import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";

// -- Helpers --
function formatNumber(num: number | null | undefined): string {
  if (num == null) return "-";
  return num.toLocaleString();
}

function getEmployeeLabel(
  selectedEmployee: string,
  employees: { id: string; name: string }[]
): string {
  if (selectedEmployee === "all") return "All Employees";
  const emp = employees.find((e) => e.id === selectedEmployee);
  return emp ? emp.name : selectedEmployee;
}

function getWorkingDaysInMonth(year: number, month: number) {
  let count = 0;
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) count++;
    date.setDate(date.getDate() + 1);
  }
  return count;
}

function getISOWeek(date: string | Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getWorkingDaysInWeek(year: number, week: number, month: number) {
  let count = 0;
  const date = new Date(year, 0, 1 + (week - 1) * 7);
  // Move to Monday of ISO week
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  for (let i = 0; i < 7; i++) {
    const thisDate = new Date(date);
    thisDate.setDate(date.getDate() + i);
    if (
      thisDate.getFullYear() === year &&
      thisDate.getMonth() + 1 === Number(month) &&
      thisDate.getDay() !== 0 &&
      thisDate.getDay() !== 6
    ) {
      count++;
    }
  }
  return count;
}

const ProgressBar = ({ value }: { value: number }) => (
  <div className="h-2 w-full bg-gray-200 rounded">
    <div
      className="h-2 rounded"
      style={{
        width: `${Math.min(value, 100)}%`,
        background:
          value >= 100
            ? "#22c55e"
            : value >= 50
            ? "#f59e42"
            : "#f87171",
        transition: "width 0.4s",
      }}
    ></div>
  </div>
);

// -- Main Component --
const Dashboard: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(() => {
  const currentMonth = new Date().getMonth() + 1;
    return currentMonth.toString();
  });

  const [selectedViewType, setSelectedViewType] = useState("Monthly");
  const [selectedWeek, setSelectedWeek] = useState("1");
  const [selectedDay, setSelectedDay] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const currentYear = new Date().getFullYear();
  const [selectedYear] = useState(String(currentYear));

  const { user, isAdmin } = useAuth();
  const { data: employees = [] } = useEmployees();
  const myEmployee = useMemo(
    () => employees.find((e) => e.email === user?.email),
    [employees, user]
  );

  // Ensure non-admins cannot select other employees
  useEffect(() => {
    if (!isAdmin && selectedEmployee !== 'all' && selectedEmployee !== myEmployee?.id) {
      setSelectedEmployee('all');
    }
  }, [isAdmin, selectedEmployee, myEmployee]);
  const { data: kpiData = [], isLoading } = useKPIData({
    employeeId: selectedEmployee === "all" ? undefined : selectedEmployee,
    month: selectedMonth,
    year: selectedYear,
  });

  // Set week options for selected month/year
  const weekSet = new Set<number>();
  kpiData.forEach((rec: any) => {
    if (rec.date) weekSet.add(getISOWeek(rec.date));
  });
  const weeksInData = Array.from(weekSet).sort((a, b) => a - b);
  const weekOptions =
    weeksInData.length > 0
      ? weeksInData
      : [1, 2, 3, 4, 5]; // fallback

  // KPI targets & weights
  const kpiTargets = {
    margin: 3000000,
    calls: 1540,
    leads_generated: 1100,
    solo_closing: 1,
    out_house_meetings: 44,
    in_house_meetings: 22,
    product_knowledge: 100,
    smd: 100,
  };

  const kpiWeights = {
    margin: 30,
    calls: 20,
    leads_generated: 5,
    solo_closing: 10,
    out_house_meetings: 10,
    in_house_meetings: 15,
    product_knowledge: 5,
    smd: 5,
  };

  // Working Days Calculation
  const year = Number(selectedYear);
  const month = Number(selectedMonth);
  const workingDaysInMonth = getWorkingDaysInMonth(year, month);
  let workingDaysInPeriod = workingDaysInMonth;

  if (selectedViewType === "Weekly") {
    workingDaysInPeriod = getWorkingDaysInWeek(year, Number(selectedWeek), month);
  } else if (selectedViewType === "Daily") {
    const dayDate = new Date(selectedDay);
    workingDaysInPeriod =
      dayDate.getDay() !== 0 && dayDate.getDay() !== 6 ? 1 : 0;
  }

  const periodMultiplier = workingDaysInMonth
    ? workingDaysInPeriod / workingDaysInMonth
    : 1;
    const employeeMultiplier =
  selectedEmployee === "all" ? employees.length-2 : 1;

  const adjustedKpiTargets = Object.fromEntries(
    Object.entries(kpiTargets).map(([k, v]) => {
      const monthlyOnly = k === "product_knowledge" || k === "smd";
      const multiplier = (monthlyOnly ? 1 : periodMultiplier) * employeeMultiplier;
      return [k, Math.round(v * multiplier)];
    })
  );


  // FILTER KPI DATA
  const filteredKpiData = useMemo(() => {
    if (!kpiData.length) return [];
    if (selectedViewType === "Monthly") {
      return kpiData.filter(
        (rec: any) =>
          new Date(rec.date).getMonth() + 1 === Number(selectedMonth) &&
          new Date(rec.date).getFullYear() === Number(selectedYear)
      );
    } else if (selectedViewType === "Weekly") {
      return kpiData.filter(
        (rec: any) =>
          getISOWeek(rec.date) === Number(selectedWeek) &&
          new Date(rec.date).getFullYear() === Number(selectedYear) &&
          new Date(rec.date).getMonth() + 1 === Number(selectedMonth)
      );
    } else if (selectedViewType === "Daily") {
      return kpiData.filter(
        (rec: any) =>
          rec.date &&
          rec.date.slice(0, 10) === selectedDay &&
          new Date(rec.date).getFullYear() === Number(selectedYear)
      );
    }
    return kpiData;
  }, [kpiData, selectedMonth, selectedWeek, selectedDay, selectedViewType, selectedYear]);
  // Always-Monthly slice (ignore selectedViewType)
  const monthlyKpiData = useMemo(() => {
    if (!kpiData.length) return [];
    return kpiData.filter(
      (rec: any) =>
        new Date(rec.date).getMonth() + 1 === Number(selectedMonth) &&
        new Date(rec.date).getFullYear() === Number(selectedYear)
    );
  }, [kpiData, selectedMonth, selectedYear]);

  // AGGREGATE KPI DATA
  const aggregatedKPIs = useMemo(() => {
    // Sums for count KPIs (respect Weekly/Daily/Monthly selection)
    const totals = {
      margin: 0,
      calls: 0,
      leads_generated: 0,
      solo_closing: 0,
      out_house_meetings: 0,
      in_house_meetings: 0,
    };

    // --- 3a) Count KPIs from filteredKpiData (unchanged behavior) ---
    filteredKpiData.forEach((record: any) => {
      totals.margin += record.margin || 0;
      totals.calls += record.calls || 0;
      totals.leads_generated += record.leads_generated || 0;
      totals.solo_closing += record.solo_closing || 0;
      totals.out_house_meetings += record.out_house_meetings || 0;
      totals.in_house_meetings += record.in_house_meetings || 0;
    });

    // --- 3b) % KPIs (Knowledge, SMD) from MONTHLY data regardless of view ---
    const knowledgeByEmp = new Map<string, number>();
    const smdByEmp = new Map<string, number>();

    monthlyKpiData.forEach((record: any) => {
      const empId =
        record.employeeId ??
        record.employee_id ??
        record.empId ??
        record.emp_id ??
        "unknown";

      if (record.product_knowledge != null) {
        const prev = knowledgeByEmp.get(empId) ?? 0;
        knowledgeByEmp.set(empId, Math.max(prev, Number(record.product_knowledge)));
      }
      if (record.smd != null) {
        const prev = smdByEmp.get(empId) ?? 0;
        smdByEmp.set(empId, Math.max(prev, Number(record.smd)));
      }
    });

    const sumValues = (m: Map<string, number>) =>
      Array.from(m.values()).reduce((a, b) => a + b, 0);

    const product_knowledge = sumValues(knowledgeByEmp);
    const smd = sumValues(smdByEmp);

    return [
      { key: "margin",             title: "Margin",  achieved: totals.margin,              target: adjustedKpiTargets.margin,             weight: kpiWeights.margin,             unit: ""  },
      { key: "calls",              title: "Calls",   achieved: totals.calls,               target: adjustedKpiTargets.calls,              weight: kpiWeights.calls,              unit: ""  },
      { key: "leads_generated",    title: "Leads",   achieved: totals.leads_generated,     target: adjustedKpiTargets.leads_generated,    weight: kpiWeights.leads_generated,    unit: ""  },
      { key: "solo_closing",       title: "Solo",    achieved: totals.solo_closing,        target: adjustedKpiTargets.solo_closing,       weight: kpiWeights.solo_closing,       unit: ""  },
      { key: "out_house_meetings", title: "OH",      achieved: totals.out_house_meetings,  target: adjustedKpiTargets.out_house_meetings, weight: kpiWeights.out_house_meetings, unit: ""  },
      { key: "in_house_meetings",  title: "IH",      achieved: totals.in_house_meetings,   target: adjustedKpiTargets.in_house_meetings,  weight: kpiWeights.in_house_meetings,  unit: ""  },
      // % KPIs use monthly-only achieved + monthly-only target (no period scaling)
      { key: "product_knowledge",  title: "Knowledge", achieved: product_knowledge, target: adjustedKpiTargets.product_knowledge, weight: kpiWeights.product_knowledge, unit: "%" },
      { key: "smd",                title: "SMD",       achieved: smd,              target: adjustedKpiTargets.smd,              weight: kpiWeights.smd,              unit: "%" },
    ];
  }, [filteredKpiData, monthlyKpiData, adjustedKpiTargets, kpiWeights]);

  // Weighted score
  const overallScore = useMemo(() => {
    const weightedSum = aggregatedKPIs.reduce((sum, kpi) => {
      const pct = Math.min(kpi.achieved / (kpi.target || 1), 1); // Cap at 100%
      return sum + pct * kpi.weight;
    }, 0);
    return Math.round(weightedSum);
  }, [aggregatedKPIs]);

  // Chart data
  const chartData = aggregatedKPIs.map((kpi) => {
    const pct = (kpi.achieved / (kpi.target || 1)) * 100;
    let color = "#f87171";
    if (pct >= 100) color = "#22c55e";
    else if (pct >= 50) color = "#f59e42";
    return {
      name: kpi.title,
      Performance: Math.min(pct, 100),
      fill: color,
    };
  });

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const viewTypes = [
    { value: "Monthly", label: "Monthly" },
    { value: "Weekly", label: "Weekly" },
    { value: "Daily", label: "Daily" },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-foreground">KPI Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor employee performance with real-time KPI analytics
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 items-end bg-white p-4 rounded-lg shadow-sm">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Select Employee
            </Label>
            <Select
              value={selectedEmployee}
              onValueChange={setSelectedEmployee}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {isAdmin
                  ? employees.map((employee: any) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))
                  : myEmployee && (
                      <SelectItem value={myEmployee.id}>{myEmployee.name}</SelectItem>
                    )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              Month
            </Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              View Type
            </Label>
            <Select
              value={selectedViewType}
              onValueChange={setSelectedViewType}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {viewTypes.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedViewType === "Weekly" && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Week
              </Label>
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weekOptions.map((w) => (
                    <SelectItem key={w} value={w.toString()}>
                      Week {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {selectedViewType === "Daily" && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Day
              </Label>
              <input
                type="date"
                className="border rounded px-2 py-1 w-36 text-sm"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
          )}
        </div>

        {/* Score + Chart section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Score Card */}
          <Card className="flex flex-col items-center justify-center h-56 shadow-md" style={{ height: "auto" }}>
            <div className="text-xs text-muted-foreground mb-2">
              Weighted performance score for {getEmployeeLabel(selectedEmployee, employees)} ({selectedViewType.toLowerCase()} view)
            </div>
            <div className="text-6xl font-bold mb-2">{overallScore}%</div>
            <div className="text-lg text-muted-foreground">
              {selectedViewType} performance
            </div>
          </Card>
          {/* KPI Performance Chart */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>KPI Performance</CardTitle>
              <CardDescription>
                Achieved vs Target KPIs for the {selectedViewType.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      formatter={(value) => `${Number(value).toFixed(2)}%`}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar dataKey="Performance">
                      {chartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin-only Employee Performance Link */}
        {isAdmin && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Employee Performance Analysis
                    </h3>
                    <p className="text-blue-700 text-sm">
                      Compare individual employee performance, sort by KPIs, and identify top performers
                    </p>
                  </div>
                  <Link to="/employee-performance">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      View Employee Analysis →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-100 rounded-lg"></div>
                </div>
              ))
            : aggregatedKPIs.map((kpi, idx) => {
                const percent = Math.min(
                  (kpi.achieved / (kpi.target || 1)) * 100,
                  100
                );
                return (
                  <Card
                    key={idx}
                    className="flex flex-col h-32 justify-between p-4 shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">{kpi.title}</div>
                      <div className="text-xs text-gray-400">
                        Weight: {kpi.weight}%
                      </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold flex items-end">
                      {formatNumber(kpi.achieved)}
                      {kpi.unit && (
                        <span className="ml-1 text-base font-normal">
                          {kpi.unit}
                        </span>
                      )}
                      <span className="ml-2 text-xs text-gray-400 font-normal">
                        / {formatNumber(kpi.target)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={percent} />
                      <div className="text-xs text-gray-500 mt-1">
                        {percent.toFixed(1)}%
                      </div>
                    </div>
                  </Card>
                );
              })}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
