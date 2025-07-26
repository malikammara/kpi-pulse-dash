import Layout from "@/components/Layout";
import KPICard from "@/components/KPICard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useEmployees } from "@/hooks/useEmployees";
import { useKPIData } from "@/hooks/useKPIData";
import { useState, useMemo } from "react";

const Dashboard = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth() + 1 + "");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear() + "");

  const { data: employees = [] } = useEmployees();
  const { data: kpiData = [], isLoading } = useKPIData({
    employeeId: selectedEmployee || undefined,
    month: selectedMonth,
    year: selectedYear,
  });

  // KPI targets as defined in requirements
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

  // Calculate aggregated KPI data for the selected period
  const aggregatedKPIs = useMemo(() => {
    const totals = kpiData.reduce((acc, record) => {
      acc.margin += record.margin || 0;
      acc.calls += record.calls || 0;
      acc.leads_generated += record.leads_generated || 0;
      acc.solo_closing += record.solo_closing || 0;
      acc.out_house_meetings += record.out_house_meetings || 0;
      acc.in_house_meetings += record.in_house_meetings || 0;
      acc.product_knowledge = Math.max(acc.product_knowledge, record.product_knowledge || 0);
      acc.smd = Math.max(acc.smd, record.smd || 0);
      return acc;
    }, {
      margin: 0,
      calls: 0,
      leads_generated: 0,
      solo_closing: 0,
      out_house_meetings: 0,
      in_house_meetings: 0,
      product_knowledge: 0,
      smd: 0,
    });

    return [
      { title: "Margin", achieved: totals.margin, target: kpiTargets.margin, weight: kpiWeights.margin, unit: " PKR" },
      { title: "Calls", achieved: totals.calls, target: kpiTargets.calls, weight: kpiWeights.calls },
      { title: "Leads Generated", achieved: totals.leads_generated, target: kpiTargets.leads_generated, weight: kpiWeights.leads_generated },
      { title: "Solo Closing", achieved: totals.solo_closing, target: kpiTargets.solo_closing, weight: kpiWeights.solo_closing },
      { title: "Out-House Meetings", achieved: totals.out_house_meetings, target: kpiTargets.out_house_meetings, weight: kpiWeights.out_house_meetings },
      { title: "In-House Meetings", achieved: totals.in_house_meetings, target: kpiTargets.in_house_meetings, weight: kpiWeights.in_house_meetings },
      { title: "Product Knowledge", achieved: totals.product_knowledge, target: kpiTargets.product_knowledge, weight: kpiWeights.product_knowledge, unit: "%" },
      { title: "SMD", achieved: totals.smd, target: kpiTargets.smd, weight: kpiWeights.smd, unit: "%" },
    ];
  }, [kpiData]);

  // Generate chart data for daily performance
  const chartData = useMemo(() => {
    const dailyData = kpiData.reduce((acc, record) => {
      const day = new Date(record.date).getDate();
      if (!acc[day]) {
        acc[day] = { name: `Day ${day}`, margin: 0, calls: 0 };
      }
      acc[day].margin += record.margin || 0;
      acc[day].calls += record.calls || 0;
      return acc;
    }, {} as Record<number, { name: string; margin: number; calls: number }>);

    return Object.values(dailyData).sort((a, b) => 
      parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1])
    );
  }, [kpiData]);

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

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">KPI Dashboard</h1>
          <p className="text-muted-foreground mt-2">Monitor daily, weekly, and monthly performance</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter data by employee, month, and year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Employees</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Month</Label>
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
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Performance Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Daily Performance</CardTitle>
            <CardDescription>
              {selectedEmployee ? 
                `Performance for ${employees.find(e => e.id === selectedEmployee)?.name || 'Selected Employee'}` : 
                'Performance for all employees'
              } in {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="margin" fill="hsl(var(--primary))" name="Margin (PKR)" />
                  <Bar dataKey="calls" fill="hsl(var(--accent))" name="Calls" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
            ))
          ) : (
            aggregatedKPIs.map((kpi, index) => (
              <KPICard
                key={index}
                title={kpi.title}
                achieved={kpi.achieved}
                target={kpi.target}
                weight={kpi.weight}
                unit={kpi.unit}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;