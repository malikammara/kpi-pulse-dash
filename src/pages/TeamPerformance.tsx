import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell, ReferenceLine,
} from "recharts";
import { useKPIData } from "@/hooks/useKPIData";
import { useKPIMonthly } from "@/hooks/useKPIMonthly"; // <-- new
import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Calendar, AlertTriangle } from "lucide-react";

const TeamPerformance: React.FC = () => {
  const [selectedKPI, setSelectedKPI] = useState<
    | "margin"
    | "calls"
    | "leads_generated"
    | "solo_closing"
    | "out_house_meetings"
    | "in_house_meetings"
    | "product_knowledge"
    | "smd"
  >("margin");

  const [activeTab, setActiveTab] = useState<"analytics" | "margin-target">("analytics");

  const [savedTarget] = useState<number>(100_000_000);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDate = new Date().getDate();

  // --- ANALYTICS: use RPC returning 12 rows max (month, month_key, value)
  const {
    data: monthlyRows = [],
    isLoading: isAnalyticsLoading,
  } = useKPIMonthly({ kpi: selectedKPI, year: currentYear });

  // Normalize for chart format and pad missing months with zeros
  const monthlyData = useMemo(() => {
    const map = new Map(monthlyRows.map(r => [r.month_key, r]));
    const out: any[] = [];
    for (let m = 0; m <= new Date().getMonth(); m++) {
      const d = new Date(currentYear, m, 1);
      const key = format(d, "yyyy-MM");
      const label = format(d, "MMM yyyy");
      const row = map.get(key);
      out.push({
        month: label,
        monthKey: key,
        [selectedKPI]: row ? Number(row.value) : 0,
      });
    }
    return out;
  }, [monthlyRows, selectedKPI, currentYear]);

  // Average/Total (for % metrics we already get monthly averages; we’ll average those again across months)
  const averageValue = useMemo(() => {
    if (!monthlyData.length) return 0;
    const vals = monthlyData.map((m: any) => m[selectedKPI] as number);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [monthlyData, selectedKPI]);

  const totalValue = useMemo(() => {
    if (!monthlyData.length) return 0;
    if (selectedKPI === "product_knowledge" || selectedKPI === "smd") {
      // overall average of monthly averages
      return Math.round(
        monthlyData.reduce((a: number, m: any) => a + (m[selectedKPI] as number), 0) / monthlyData.length
      );
    }
    // sum across months
    return monthlyData.reduce((a: number, m: any) => a + (m[selectedKPI] as number), 0);
  }, [monthlyData, selectedKPI]);

  const monthlyDataWithColors = useMemo(
    () =>
      monthlyData.map((m: any) => ({
        ...m,
        barColor: (m[selectedKPI] as number) > averageValue ? "green" :
                  (m[selectedKPI] as number) < averageValue ? "red" : "gray",
      })),
    [monthlyData, averageValue, selectedKPI]
  );

  // --- DAILY MARGIN TRACKER: thin query for current month (date + margin only)
  const {
    data: dailyMarginRows = [],
    isLoading: isDailyLoading,
  } = useKPIData(
    { year: String(currentYear), month: String(currentMonth), columns: ["date", "margin"] },
    { enabled: activeTab === "margin-target" }
  );

  const marginByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of dailyMarginRows as any[]) {
      map.set(r.date, (map.get(r.date) || 0) + (r.margin || 0));
    }
    return map;
  }, [dailyMarginRows]);

  // Working days (Mon–Fri)
  const workingDaysInfo = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;

    let total = 0, passed = 0, remaining = 0;
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dt = new Date(year, month - 1, day);
      const dow = dt.getDay();
      if (dow !== 0 && dow !== 6) {
        total++;
        if (day < currentDate) passed++;
        else remaining++;
      }
    }
    return { total, passed, remaining };
  }, [currentYear, currentMonth, currentDate]);

  const marginAnalysis = useMemo(() => {
    const dailyTarget = workingDaysInfo.total > 0 ? savedTarget / workingDaysInfo.total : 0;

    const year = currentYear;
    const month = currentMonth;
    const daysInMonth = new Date(year, month, 0).getDate();

    const dailyBreakdown: Array<{
      day: number; date: string; achieved: number; target: number;
      isToday: boolean; isPast: boolean; isFuture: boolean; metTarget: boolean; dayName: string;
    }> = [];

    let totalAchieved = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dow = date.getDay();
      if (dow === 0 || dow === 6) continue;

      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const achieved = marginByDate.get(dateStr) ?? 0;

      totalAchieved += achieved;

      const isToday = day === currentDate;
      const isPast = day < currentDate;
      const isFuture = day > currentDate;

      dailyBreakdown.push({
        day,
        date: dateStr,
        achieved,
        target: dailyTarget,
        isToday,
        isPast,
        isFuture,
        metTarget: achieved >= dailyTarget,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }

    const expectedByNow = dailyTarget * workingDaysInfo.passed;
    const remaining = Math.max(0, savedTarget - totalAchieved);
    const dailyRequiredForRemaining =
      workingDaysInfo.remaining > 0 ? remaining / workingDaysInfo.remaining : 0;

    return {
      totalAchieved,
      dailyTarget,
      expectedByNow,
      remaining,
      dailyRequiredForRemaining,
      onTrack: totalAchieved >= expectedByNow,
      dailyBreakdown,
    };
  }, [marginByDate, workingDaysInfo, savedTarget, currentYear, currentMonth, currentDate]);

  const kpiOptions = [
    { value: "margin", label: "Margin (PKR)", unit: " PKR" },
    { value: "calls", label: "Calls", unit: "" },
    { value: "leads_generated", label: "Leads Generated", unit: "" },
    { value: "solo_closing", label: "Solo Closing", unit: "" },
    { value: "out_house_meetings", label: "Out-House Meetings", unit: "" },
    { value: "in_house_meetings", label: "In-House Meetings", unit: "" },
    { value: "product_knowledge", label: "Product Knowledge", unit: "%" },
    { value: "smd", label: "SMD", unit: "%" },
  ];

  const selectedKPIInfo = kpiOptions.find((k) => k.value === selectedKPI);

  const formatValue = (value: number) =>
    selectedKPI === "margin" ? (value / 1_000_000).toFixed(1) + "M" : value.toLocaleString();

  const formatTooltipValue = (value: number) =>
    selectedKPI === "margin" ? `${value.toLocaleString()} PKR` : `${value.toLocaleString()}${selectedKPIInfo?.unit ?? ""}`;

  const AvgLabel: React.FC<{ x: number; y: number; value: string }> = ({ x, y, value }) => (
    <foreignObject x={x + 5} y={y - 20} width={120} height={30}>
      <div
        style={{
          backgroundColor: "white",
          padding: "2px 6px",
          borderRadius: 4,
          fontWeight: "bold",
          color: "blue",
          fontSize: 12,
          boxShadow: "0 0 4px rgba(0,0,0,0.1)",
        }}
      >
        {value}
      </div>
    </foreignObject>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="analytics" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
            <TabsTrigger value="margin-target">Daily Margin Tracker</TabsTrigger>
          </TabsList>

          {/* Analytics (Monthly, RPC) */}
          <TabsContent value="analytics" className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Team Performance Analytics</h1>
              <p className="text-muted-foreground mt-2">Monthly performance overview from {currentYear}</p>
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Select KPI Metric</CardTitle>
                <CardDescription>Choose a KPI to view team performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 max-w-xs">
                    <Label className="text-sm text-muted-foreground mb-2 block">KPI Metric</Label>
                    <Select value={selectedKPI} onValueChange={(v) => setSelectedKPI(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {kpiOptions.map((kpi) => (
                          <SelectItem key={kpi.value} value={kpi.value}>{kpi.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      {(selectedKPI === "product_knowledge" || selectedKPI === "smd" ? "Average " : "Total ")
                        + (selectedKPIInfo?.label ?? "")}
                    </Label>
                    <div className="text-3xl font-bold text-primary">
                      {formatValue(totalValue)}{selectedKPIInfo?.unit}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Monthly {selectedKPIInfo?.label} Performance</CardTitle>
                <CardDescription>Team performance from January {currentYear} to present</CardDescription>
              </CardHeader>
              <CardContent>
                {isAnalyticsLoading ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : monthlyData.length === 0 ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground text-lg">No data available</p>
                      <p className="text-muted-foreground text-sm mt-2">Add some KPI data to see team performance charts</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyDataWithColors} margin={{ top: 20, right: 40, left: 30, bottom: 90 }}>
                        <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={90} interval={0} />
                        <YAxis tickFormatter={formatValue} tick={{ fontSize: 12, fill: "#555" }} width={60} />
                        <Tooltip
                          formatter={(value: number) => [formatTooltipValue(value), selectedKPIInfo?.label]}
                          labelFormatter={(label) => `Month: ${label}`}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            padding: "10px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <ReferenceLine
                          y={averageValue}
                          stroke="blue"
                          strokeDasharray="3 3"
                          label={<AvgLabel value={`Average ${formatValue(averageValue)}`} />}
                        />
                        <Bar dataKey={selectedKPI} radius={[6, 6, 0, 0]} maxBarSize={40}>
                          {monthlyDataWithColors.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.barColor} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {monthlyData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Best Month</p>
                      <p className="text-2xl font-bold text-primary mt-2">
                        {monthlyData.reduce((best: any, current: any) =>
                          current[selectedKPI] > best[selectedKPI] ? current : best
                        ).month}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatTooltipValue(Math.max(...monthlyData.map((m: any) => m[selectedKPI])))}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Months Tracked</p>
                      <p className="text-2xl font-bold text-primary mt-2">{monthlyData.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">Since Jan {currentYear}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {selectedKPI === "product_knowledge" || selectedKPI === "smd" ? "Average" : "Monthly Average"}
                      </p>
                      <p className="text-2xl font-bold text-primary mt-2">
                        {formatValue(Math.round((totalValue as number) / (monthlyData.length || 1)))}
                        {selectedKPIInfo?.unit}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Per month</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Daily Margin Tracker (current month only) */}
          <TabsContent value="margin-target" className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Daily Margin Target Tracker</h1>
              <p className="text-muted-foreground mt-2">
                Tracking for {format(new Date(currentYear, currentMonth - 1), "MMMM yyyy")} — default monthly target is{" "}
                {(savedTarget / 1_000_000).toFixed(0)}M PKR
              </p>
            </div>

            {isDailyLoading ? (
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="h-10 flex items-center justify-center">
                    <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Working Days</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">{workingDaysInfo.total}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {workingDaysInfo.passed} passed, {workingDaysInfo.remaining} remaining
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Daily Target</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {(marginAnalysis.dailyTarget / 1_000_000).toFixed(2)}M
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PKR per working day</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Achieved</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {(marginAnalysis.totalAchieved / 1_000_000).toFixed(2)}M
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {((marginAnalysis.totalAchieved / savedTarget) * 100).toFixed(1)}% of target
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Status</p>
                      </div>
                      <Badge variant={marginAnalysis.onTrack ? "default" : "destructive"} className="text-sm">
                        {marginAnalysis.onTrack ? "On Track" : "Behind Target"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {marginAnalysis.onTrack ? "Meeting expectations" : "Needs improvement"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {marginAnalysis.remaining > 0 && (
                  <Card className="shadow-sm border-orange-200 bg-orange-50">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-orange-800 mb-2">Remaining Target Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm text-orange-600">Remaining Amount</p>
                            <p className="text-3xl font-bold text-orange-800">
                              {(marginAnalysis.remaining / 1_000_000).toFixed(2)}M PKR
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-orange-600">Required Daily (Remaining Days)</p>
                            <p className="text-3xl font-bold text-orange-800">
                              {(marginAnalysis.dailyRequiredForRemaining / 1_000_000).toFixed(2)}M PKR
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              For next {workingDaysInfo.remaining} working days
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Daily Margin Breakdown</CardTitle>
                    <CardDescription>
                      Daily performance vs target for {format(new Date(currentYear, currentMonth - 1), "MMMM yyyy")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Day</th>
                            <th className="text-left p-3">Date</th>
                            <th className="text-right p-3">Target (PKR)</th>
                            <th className="text-right p-3">Achieved (PKR)</th>
                            <th className="text-right p-3">Difference</th>
                            <th className="text-center p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {marginAnalysis.dailyBreakdown.map((day) => {
                            const difference = day.achieved - day.target;
                            return (
                              <tr
                                key={day.day}
                                className={`border-b ${
                                  day.isToday
                                    ? "bg-blue-50"
                                    : day.isPast
                                    ? day.metTarget
                                      ? "bg-green-50"
                                      : "bg-red-50"
                                    : "bg-gray-50"
                                }`}
                              >
                                <td className="p-3 font-medium">
                                  {day.dayName} {day.day}
                                  {day.isToday && <Badge variant="outline" className="ml-2 text-xs">Today</Badge>}
                                </td>
                                <td className="p-3 text-muted-foreground">{format(new Date(day.date), "MMM dd")}</td>
                                <td className="p-3 text-right font-medium">{day.target.toLocaleString()}</td>
                                <td className="p-3 text-right font-bold">{day.achieved.toLocaleString()}</td>
                                <td
                                  className={`p-3 text-right font-medium ${
                                    difference >= 0 ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {difference >= 0 ? "+" : ""}{difference.toLocaleString()}
                                </td>
                                <td className="p-3 text-center">
                                  {day.isFuture ? (
                                    <Badge variant="outline">Upcoming</Badge>
                                  ) : day.metTarget ? (
                                    <Badge variant="default" className="bg-green-600">✓ Met</Badge>
                                  ) : (
                                    <Badge variant="destructive">✗ Missed</Badge>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TeamPerformance;
