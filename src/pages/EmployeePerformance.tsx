import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown, Trophy, Target, TrendingDown, Users } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useKPIData } from "@/hooks/useKPIData";
import { useAuth } from "@/components/AuthProvider";
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

// Helper functions
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

const EmployeePerformance: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedViewType, setSelectedViewType] = useState("Monthly");
  const [selectedWeek, setSelectedWeek] = useState("1");
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().slice(0, 10));
  const [sortBy, setSortBy] = useState("overall");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterKPI, setFilterKPI] = useState("all");

  const currentYear = new Date().getFullYear();
  const { isAdmin } = useAuth();
  const { data: employees = [] } = useEmployees();
  
  // Optimize data fetching based on view type
  const { data: kpiData = [], isLoading } = useKPIData({
    ...(selectedViewType === "Monthly" && { month: selectedMonth }),
    year: currentYear.toString(),
  });

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

  // Working days calculation
  const year = Number(currentYear);
  const month = Number(selectedMonth);
  const workingDaysInMonth = getWorkingDaysInMonth(year, month);
  let workingDaysInPeriod = workingDaysInMonth;

  if (selectedViewType === "Weekly") {
    workingDaysInPeriod = getWorkingDaysInWeek(year, Number(selectedWeek), month);
  } else if (selectedViewType === "Daily") {
    const dayDate = new Date(selectedDay);
    workingDaysInPeriod = dayDate.getDay() !== 0 && dayDate.getDay() !== 6 ? 1 : 0;
  }

  const periodMultiplier = workingDaysInMonth ? workingDaysInPeriod / workingDaysInMonth : 1;

  const adjustedKpiTargets = Object.fromEntries(
    Object.entries(kpiTargets).map(([k, v]) => {
      const monthlyOnly = k === "product_knowledge" || k === "smd";
      const multiplier = monthlyOnly ? 1 : periodMultiplier;
      return [k, Math.round(v * multiplier)];
    })
  );

  // Get weeks in data for week selector
  const weekSet = new Set<number>();
  kpiData.forEach((rec: any) => {
    if (rec.date) weekSet.add(getISOWeek(rec.date));
  });
  const weeksInData = Array.from(weekSet).sort((a, b) => a - b);
  const weekOptions = weeksInData.length > 0 ? weeksInData : [1, 2, 3, 4, 5];

  // Filter KPI data based on view type
  const filteredKpiData = useMemo(() => {
    if (!kpiData.length) return [];
    if (selectedViewType === "Monthly") {
      return kpiData.filter(
        (rec: any) =>
          new Date(rec.date).getMonth() + 1 === Number(selectedMonth) &&
          new Date(rec.date).getFullYear() === Number(currentYear)
      );
    } else if (selectedViewType === "Weekly") {
      return kpiData.filter(
        (rec: any) =>
          getISOWeek(rec.date) === Number(selectedWeek) &&
          new Date(rec.date).getFullYear() === Number(currentYear) &&
          new Date(rec.date).getMonth() + 1 === Number(selectedMonth)
      );
    } else if (selectedViewType === "Daily") {
      return kpiData.filter(
        (rec: any) =>
          rec.date &&
          rec.date.slice(0, 10) === selectedDay &&
          new Date(rec.date).getFullYear() === Number(currentYear)
      );
    }
    return kpiData;
  }, [kpiData, selectedMonth, selectedWeek, selectedDay, selectedViewType, currentYear]);

  // Always-Monthly slice for percentage KPIs
  const monthlyKpiData = useMemo(() => {
    if (!kpiData.length) return [];
    return kpiData.filter(
      (rec: any) =>
        new Date(rec.date).getMonth() + 1 === Number(selectedMonth) &&
        new Date(rec.date).getFullYear() === Number(currentYear)
    );
  }, [kpiData, selectedMonth, currentYear]);

  // Calculate employee performance
  const employeePerformance = useMemo(() => {
    const performanceMap = new Map();

    // Initialize all employees
    employees.forEach((emp: any) => {
      performanceMap.set(emp.id, {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        margin: 0,
        calls: 0,
        leads_generated: 0,
        solo_closing: 0,
        out_house_meetings: 0,
        in_house_meetings: 0,
        product_knowledge: 0, // raw % value (0-100)
        smd: 0,                // raw % value (0-100)
      });
    });

    // Aggregate count KPIs from filtered data
    filteredKpiData.forEach((record: any) => {
      const empId = record.employee_id;
      if (performanceMap.has(empId)) {
        const emp = performanceMap.get(empId);
        emp.margin += record.margin ?? 0;
        emp.calls += record.calls ?? 0;
        emp.leads_generated += record.leads_generated ?? 0;
        emp.solo_closing += record.solo_closing ?? 0;
        emp.out_house_meetings += record.out_house_meetings ?? 0;
        emp.in_house_meetings += record.in_house_meetings ?? 0;
      }
    });

    // Handle percentage KPIs from monthly data (take max per month)
    const knowledgeByEmp = new Map<string, number>();
    const smdByEmp = new Map<string, number>();

    monthlyKpiData.forEach((record: any) => {
      const empId = record.employee_id;
      if (record.product_knowledge != null) {
        const prev = knowledgeByEmp.get(empId) ?? 0;
        knowledgeByEmp.set(empId, Math.max(prev, Number(record.product_knowledge)));
      }
      if (record.smd != null) {
        const prev = smdByEmp.get(empId) ?? 0;
        smdByEmp.set(empId, Math.max(prev, Number(record.smd)));
      }
    });

    // Apply percentage KPIs
    knowledgeByEmp.forEach((value, empId) => {
      if (performanceMap.has(empId)) performanceMap.get(empId).product_knowledge = value;
    });
    smdByEmp.forEach((value, empId) => {
      if (performanceMap.has(empId)) performanceMap.get(empId).smd = value;
    });

    // Calculate overall scores and percentages (store % in *Pct fields)
    const result = Array.from(performanceMap.values()).map((emp: any) => {
      const kpiPerformances = [
        { key: "margin", achieved: emp.margin, target: adjustedKpiTargets.margin, weight: kpiWeights.margin },
        { key: "calls", achieved: emp.calls, target: adjustedKpiTargets.calls, weight: kpiWeights.calls },
        { key: "leads_generated", achieved: emp.leads_generated, target: adjustedKpiTargets.leads_generated, weight: kpiWeights.leads_generated },
        { key: "solo_closing", achieved: emp.solo_closing, target: adjustedKpiTargets.solo_closing, weight: kpiWeights.solo_closing },
        { key: "out_house_meetings", achieved: emp.out_house_meetings, target: adjustedKpiTargets.out_house_meetings, weight: kpiWeights.out_house_meetings },
        { key: "in_house_meetings", achieved: emp.in_house_meetings, target: adjustedKpiTargets.in_house_meetings, weight: kpiWeights.in_house_meetings },
        { key: "product_knowledge", achieved: emp.product_knowledge, target: adjustedKpiTargets.product_knowledge, weight: kpiWeights.product_knowledge },
        { key: "smd", achieved: emp.smd, target: adjustedKpiTargets.smd, weight: kpiWeights.smd },
      ];

      const overallScore = kpiPerformances.reduce((sum, kpi) => {
        const pct = Math.min(kpi.achieved / (kpi.target || 1), 1);
        return sum + pct * kpi.weight;
      }, 0);

      const pct: Record<string, number> = {};
      kpiPerformances.forEach((kpi) => {
        pct[`${kpi.key}Pct`] = (kpi.achieved / (kpi.target || 1)) * 100;
      });

      return {
        ...emp, // raw totals preserved
        overallScore: Math.round(overallScore),
        ...pct, // e.g., marginPct, callsPct, ...
      };
    });

    return result;
  }, [employees, filteredKpiData, monthlyKpiData, adjustedKpiTargets, kpiWeights]);

  // Apply filtering (use % fields for KPI filters)
  const filteredEmployees = useMemo(() => {
    if (filterKPI === "all") return employeePerformance;

    const threshold = 50; // 50% threshold for filtering
    if (filterKPI === "overall") {
      return employeePerformance.filter((emp: any) => emp.overallScore >= threshold);
    }
    const key = `${filterKPI}Pct` as keyof (typeof employeePerformance)[number];
    return employeePerformance.filter((emp: any) => (emp[key] ?? 0) >= threshold);
  }, [employeePerformance, filterKPI]);

  // Apply sorting (keeps current behavior: sorts by raw totals or overall score/name)
  const sortedEmployees = useMemo(() => {
    const sorted = [...filteredEmployees].sort((a: any, b: any) => {
      let aValue: any, bValue: any;

      if (sortBy === "overall") {
        aValue = a.overallScore;
        bValue = b.overallScore;
      } else if (sortBy === "name") {
        aValue = a.name?.toLowerCase() ?? "";
        bValue = b.name?.toLowerCase() ?? "";
      } else {
        aValue = a[sortBy] ?? 0; // raw totals for KPI columns
        bValue = b[sortBy] ?? 0;
      }

      if (sortOrder === "asc") return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    });

    return sorted;
  }, [filteredEmployees, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-green-600">Excellent</Badge>;
    if (score >= 50) return <Badge className="bg-blue-600">Good</Badge>;
    if (score >= 30) return <Badge className="bg-yellow-600">Average</Badge>;
    return <Badge variant="destructive">Needs Improvement</Badge>;
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num == null || Number.isNaN(num)) return "-";
    return num.toLocaleString();
  };

  const formatPercentage = (num: number | null | undefined): string => {
    if (num == null || Number.isNaN(num)) return "-";
    return `${num.toFixed(1)}%`;
  };

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

  const kpiOptions = [
    { value: "all", label: "All Employees" },
    { value: "overall", label: "Overall Performance ≥50%" },
    { value: "margin", label: "Margin ≥50%" },
    { value: "calls", label: "Calls ≥50%" },
    { value: "leads_generated", label: "Leads ≥50%" },
    { value: "solo_closing", label: "Solo Closing ≥50%" },
    { value: "out_house_meetings", label: "Out-House Meetings ≥50%" },
    { value: "in_house_meetings", label: "In-House Meetings ≥50%" },
    { value: "product_knowledge", label: "Product Knowledge ≥50%" },
    { value: "smd", label: "SMD ≥50%" },
  ];

  const sortOptions = [
    { value: "overall", label: "Overall Score" },
    { value: "name", label: "Employee Name" },
    { value: "margin", label: "Margin" },
    { value: "calls", label: "Calls" },
    { value: "leads_generated", label: "Leads Generated" },
    { value: "solo_closing", label: "Solo Closing" },
    { value: "out_house_meetings", label: "Out-House Meetings" },
    { value: "in_house_meetings", label: "In-House Meetings" },
    { value: "product_knowledge", label: "Product Knowledge" },
    { value: "smd", label: "SMD" },
  ];

  // Redirect non-admins
  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
              <p className="text-muted-foreground mb-4">
                This page is only accessible to administrators.
              </p>
              <Link to="/dashboard">
                <Button>Return to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Employee Performance Analysis</h1>
              <p className="text-muted-foreground mt-2">
                Compare and analyze individual employee KPI performance
              </p>
            </div>
            <Link to="/dashboard">
              <Button variant="outline">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Performance Filters</CardTitle>
            <CardDescription>Customize the view to analyze specific performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
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
                <Label className="text-xs text-muted-foreground mb-1 block">View Type</Label>
                <Select value={selectedViewType} onValueChange={setSelectedViewType}>
                  <SelectTrigger>
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
                  <Label className="text-xs text-muted-foreground mb-1 block">Week</Label>
                  <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                    <SelectTrigger>
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
                  <Label className="text-xs text-muted-foreground mb-1 block">Day</Label>
                  <input
                    type="date"
                    className="border rounded px-2 py-1 w-full text-sm"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Filter By</Label>
                <Select value={filterKPI} onValueChange={setFilterKPI}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kpiOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Total Employees</p>
              </div>
              <p className="text-2xl font-bold text-primary">{sortedEmployees.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredEmployees.length !== employeePerformance.length 
                  ? `${filteredEmployees.length} after filtering` 
                  : "All employees shown"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Top Performer</p>
              </div>
              <p className="text-lg font-bold text-primary">
                {sortedEmployees.length > 0 ? sortedEmployees[0]?.name : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {sortedEmployees.length > 0 ? `${sortedEmployees[0]?.overallScore}% overall` : "No data"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
              <p className="text-2xl font-bold text-primary">
                {employeePerformance.length > 0 
                  ? Math.round(employeePerformance.reduce((sum: number, emp: any) => sum + emp.overallScore, 0) / employeePerformance.length)
                  : 0}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Team average</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Needs Attention</p>
              </div>
              <p className="text-2xl font-bold text-primary">
                {employeePerformance.filter((emp: any) => emp.overallScore < 40).length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Below 30% performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Employee Performance Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Employee Performance Comparison</CardTitle>
            <CardDescription>
              Detailed performance analysis for {selectedViewType.toLowerCase()} view
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : sortedEmployees.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No employees match the current filters</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Try adjusting your filter criteria or add some KPI data
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("name")}
                          className="h-auto p-0 font-semibold"
                        >
                          Employee {getSortIcon("name")}
                        </Button>
                      </TableHead>
                      <TableHead className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("overall")}
                          className="h-auto p-0 font-semibold"
                        >
                          Overall {getSortIcon("overall")}
                        </Button>
                      </TableHead>
                      <TableHead className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("margin")}
                          className="h-auto p-0 font-semibold"
                        >
                          Margin {getSortIcon("margin")}
                        </Button>
                      </TableHead>
                      <TableHead className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("calls")}
                          className="h-auto p-0 font-semibold"
                        >
                          Calls {getSortIcon("calls")}
                        </Button>
                      </TableHead>
                      <TableHead className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("leads_generated")}
                          className="h-auto p-0 font-semibold"
                        >
                          Leads {getSortIcon("leads_generated")}
                        </Button>
                      </TableHead>
                      <TableHead className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("solo_closing")}
                          className="h-auto p-0 font-semibold"
                        >
                          Solo {getSortIcon("solo_closing")}
                        </Button>
                      </TableHead>
                      <TableHead className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("out_house_meetings")}
                          className="h-auto p-0 font-semibold"
                        >
                          OH Mtgs {getSortIcon("out_house_meetings")}
                        </Button>
                      </TableHead>
                      <TableHead className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("in_house_meetings")}
                          className="h-auto p-0 font-semibold"
                        >
                          IH Mtgs {getSortIcon("in_house_meetings")}
                        </Button>
                      </TableHead>
                      <TableHead className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("product_knowledge")}
                          className="h-auto p-0 font-semibold"
                        >
                          Knowledge {getSortIcon("product_knowledge")}
                        </Button>
                      </TableHead>
                      <TableHead className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("smd")}
                          className="h-auto p-0 font-semibold"
                        >
                          SMD {getSortIcon("smd")}
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedEmployees.map((employee: any, index: number) => (
                      <TableRow key={employee.id} className={index < 3 ? "bg-green-50" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                            {index === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
                            {index === 2 && <Trophy className="h-4 w-4 text-orange-400" />}
                            <div>
                              <p className="font-semibold">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">{employee.email}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Overall */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span className="text-lg font-bold">{employee.overallScore}%</span>
                            {getPerformanceBadge(employee.overallScore)}
                          </div>
                        </TableCell>

                        {/* Margin */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{formatNumber(employee.margin)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatPercentage(employee.marginPct)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Calls */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{formatNumber(employee.calls)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatPercentage(employee.callsPct)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Leads */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{formatNumber(employee.leads_generated)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatPercentage(employee.leads_generatedPct)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Solo Closing */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{formatNumber(employee.solo_closing)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatPercentage(employee.solo_closingPct)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Out-house Meetings */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{formatNumber(employee.out_house_meetings)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatPercentage(employee.out_house_meetingsPct)}
                            </span>
                          </div>
                        </TableCell>

                        {/* In-house Meetings */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{formatNumber(employee.in_house_meetings)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatPercentage(employee.in_house_meetingsPct)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Knowledge (raw already a %) */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{formatNumber(employee.product_knowledge)}%</span>
                            <span className="text-xs text-muted-foreground">
                              {formatPercentage(employee.product_knowledgePct)}
                            </span>
                          </div>
                        </TableCell>

                        {/* SMD (raw already a %) */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{formatNumber(employee.smd)}%</span>
                            <span className="text-xs text-muted-foreground">
                              {formatPercentage(employee.smdPct)}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EmployeePerformance;
