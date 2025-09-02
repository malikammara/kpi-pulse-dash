import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from "recharts";
import { useKPIData } from "@/hooks/useKPIData";
import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Calendar, AlertTriangle } from "lucide-react";

const TeamPerformance: React.FC = () => {
  const [selectedKPI, setSelectedKPI] = useState("margin");
  const [monthlyTarget, setMonthlyTarget] = useState("");
  const [savedTarget, setSavedTarget] = useState(0);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDate = new Date().getDate();

  const { data: kpiData = [], isLoading } = useKPIData({
    year: currentYear.toString(),
  });

  // Get current month's margin data
  const currentMonthMarginData = useMemo(() => {
    return kpiData.filter((record: any) => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() + 1 === currentMonth && 
             recordDate.getFullYear() === currentYear;
    });
  }, [kpiData, currentMonth, currentYear]);

  // Calculate working days
  const workingDaysInfo = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;
    setMonthlyTarget(100000000);
    // Total working days in month
    let totalWorkingDays = 0;
    let passedWorkingDays = 0;
    let remainingWorkingDays = 0;
    
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalWorkingDays++;
        
        if (day < currentDate) {
          passedWorkingDays++;
        } else if (day >= currentDate) {
          remainingWorkingDays++;
        }
      }
    }
    
    return {
      total: totalWorkingDays,
      passed: passedWorkingDays,
      remaining: remainingWorkingDays
    };
  }, [currentYear, currentMonth, currentDate]);

  // Calculate margin achievements
  const marginAnalysis = useMemo(() => {
    const totalAchieved = currentMonthMarginData.reduce((sum, record: any) => 
      sum + (record.margin || 0), 0
    );
    
    const dailyTarget = savedTarget > 0 ? savedTarget / workingDaysInfo.total : 0;
    const expectedByNow = dailyTarget * workingDaysInfo.passed;
    const remaining = Math.max(0, savedTarget - totalAchieved);
    const dailyRequiredForRemaining = workingDaysInfo.remaining > 0 ? 
      remaining / workingDaysInfo.remaining : 0;
    
    // Daily breakdown
    const dailyBreakdown = [];
    const year = currentYear;
    const month = currentMonth;
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      
      // Skip weekends
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dayData = currentMonthMarginData.find((record: any) => record.date === dateStr);
        const achieved = dayData?.margin || 0;
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
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
        });
      }
    }
    
    return {
      totalAchieved,
      dailyTarget,
      expectedByNow,
      remaining,
      dailyRequiredForRemaining,
      onTrack: totalAchieved >= expectedByNow,
      dailyBreakdown
    };
  }, [currentMonthMarginData, savedTarget, workingDaysInfo, currentYear, currentMonth, currentDate]);

  const handleSaveTarget = () => {
    const target = parseFloat(monthlyTarget.replace(/,/g, '')) || 0;
    setSavedTarget(target);
    setMonthlyTarget("");
  };
  const kpiOptions = [
    { value: "margin", label: "Margin (PKR)", unit: "PKR" },
    { value: "calls", label: "Calls", unit: "" },
    { value: "leads_generated", label: "Leads Generated", unit: "" },
    { value: "solo_closing", label: "Solo Closing", unit: "" },
    { value: "out_house_meetings", label: "Out-House Meetings", unit: "" },
    { value: "in_house_meetings", label: "In-House Meetings", unit: "" },
    { value: "product_knowledge", label: "Product Knowledge", unit: "%" },
    { value: "smd", label: "SMD", unit: "%" },
  ];

  const selectedKPIInfo = kpiOptions.find(kpi => kpi.value === selectedKPI);

  // Aggregate monthly data and fill missing months with zeros
  const monthlyData = useMemo(() => {
    if (!kpiData.length) return [];

    const monthlyAggregation: Record<string, any> = {};

    kpiData.forEach((record: any) => {
      const date = new Date(record.date);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy');

      if (!monthlyAggregation[monthKey]) {
        monthlyAggregation[monthKey] = {
          month: monthLabel,
          monthKey,
          margin: 0,
          calls: 0,
          leads_generated: 0,
          solo_closing: 0,
          out_house_meetings: 0,
          in_house_meetings: 0,
          product_knowledge: 0,
          smd: 0,
          recordCount: 0,
        };
      }

      monthlyAggregation[monthKey].margin += record.margin || 0;
      monthlyAggregation[monthKey].calls += record.calls || 0;
      monthlyAggregation[monthKey].leads_generated += record.leads_generated || 0;
      monthlyAggregation[monthKey].solo_closing += record.solo_closing || 0;
      monthlyAggregation[monthKey].out_house_meetings += record.out_house_meetings || 0;
      monthlyAggregation[monthKey].in_house_meetings += record.in_house_meetings || 0;

      monthlyAggregation[monthKey].product_knowledge += record.product_knowledge || 0;
      monthlyAggregation[monthKey].smd += record.smd || 0;
      monthlyAggregation[monthKey].recordCount += 1;
    });

    const allMonths = [];
    const now = new Date();
    const currentMonth = now.getMonth();

    for (let m = 0; m <= currentMonth; m++) {
      const date = new Date(currentYear, m, 1);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy');
      allMonths.push({ monthKey, monthLabel });
    }

    const result = allMonths.map(({ monthKey, monthLabel }) => {
      if (monthlyAggregation[monthKey]) {
        const month = monthlyAggregation[monthKey];
        return {
          ...month,
          product_knowledge: month.recordCount > 0 ? Math.round(month.product_knowledge / month.recordCount) : 0,
          smd: month.recordCount > 0 ? Math.round(month.smd / month.recordCount) : 0,
        };
      } else {
        return {
          month: monthLabel,
          monthKey,
          margin: 0,
          calls: 0,
          leads_generated: 0,
          solo_closing: 0,
          out_house_meetings: 0,
          in_house_meetings: 0,
          product_knowledge: 0,
          smd: 0,
          recordCount: 0,
        };
      }
    });

    return result;
  }, [kpiData, currentYear]);

  // Calculate average per month for selected KPI
  const averageValue = useMemo(() => {
    if (!monthlyData.length) return 0;

    if (selectedKPI === 'product_knowledge' || selectedKPI === 'smd') {
      const sum = monthlyData.reduce((acc, month) => acc + month[selectedKPI], 0);
      return sum / monthlyData.length;
    } else {
      return monthlyData.reduce((acc, month) => acc + month[selectedKPI], 0) / monthlyData.length;
    }
  }, [monthlyData, selectedKPI]);

  // Calculate total value for display (slightly different than averageValue for some KPIs)
  const totalValue = useMemo(() => {
    if (!monthlyData.length) return 0;

    if (selectedKPI === 'product_knowledge' || selectedKPI === 'smd') {
      const sum = monthlyData.reduce((acc, month) => acc + month[selectedKPI], 0);
      return Math.round(sum / monthlyData.length);
    } else {
      return monthlyData.reduce((acc, month) => acc + month[selectedKPI], 0);
    }
  }, [monthlyData, selectedKPI]);

  // Add barColor property to each month based on comparison with averageValue
  const monthlyDataWithColors = useMemo(() => {
    return monthlyData.map(month => {
      let barColor = 'gray';
      if (month[selectedKPI] > averageValue) barColor = 'green';
      else if (month[selectedKPI] < averageValue) barColor = 'red';

      return { ...month, barColor };
    });
  }, [monthlyData, averageValue, selectedKPI]);

  const formatValue = (value: number) => {
    if (selectedKPI === 'margin') {
      return (value / 1000000).toFixed(1) + 'M';
    }
    return value.toLocaleString();
  };

  const formatTooltipValue = (value: number) => {
    if (selectedKPI === 'margin') {
      return `${value.toLocaleString()} PKR`;
    }
    return `${value.toLocaleString()}${selectedKPIInfo?.unit || ''}`;
  };

  const AvgLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <foreignObject x={x + 5} y={y - 20} width={100} height={30}>
        <div style={{
          backgroundColor: 'white',
          padding: '2px 6px',
          borderRadius: 4,
          fontWeight: 'bold',
          color: 'blue',
          fontSize: 12,
          boxShadow: '0 0 4px rgba(0,0,0,0.1)'
        }}>
          {value}
        </div>
      </foreignObject>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
            <TabsTrigger value="margin-target">Daily Margin Tracker</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Team Performance Analytics</h1>
              <p className="text-muted-foreground mt-2">
                Monthly performance overview for the entire team from {currentYear}
              </p>
            </div>

            {/* KPI Selector */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Select KPI Metric</CardTitle>
                <CardDescription>Choose a KPI to view team performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 max-w-xs">
                    <Label className="text-sm text-muted-foreground mb-2 block">KPI Metric</Label>
                    <Select value={selectedKPI} onValueChange={setSelectedKPI}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {kpiOptions.map(kpi => (
                          <SelectItem key={kpi.value} value={kpi.value}>
                            {kpi.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      {selectedKPI === 'product_knowledge' || selectedKPI === 'smd' ? 'Average' : 'Total'} {selectedKPIInfo?.label}
                    </Label>
                    <div className="text-3xl font-bold text-primary">
                      {formatValue(totalValue)}{selectedKPIInfo?.unit}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Monthly {selectedKPIInfo?.label} Performance</CardTitle>
                <CardDescription>
                  Team performance from January {currentYear} to present
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : monthlyDataWithColors.length === 0 ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground text-lg">No data available</p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Add some KPI data to see team performance charts
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyDataWithColors}
                        margin={{ top: 20, right: 40, left: 30, bottom: 90 }}
                      >
                        <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={90}
                          interval={0}
                        />
                        <YAxis
                          tickFormatter={formatValue}
                          tick={{ fontSize: 12, fill: '#555' }}
                          width={60}
                        />
                        <Tooltip
                          formatter={(value: number) => [formatTooltipValue(value), selectedKPIInfo?.label]}
                          labelFormatter={label => `Month: ${label}`}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            padding: '10px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
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
                          {monthlyDataWithColors.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.barColor} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Stats */}
            {monthlyData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Best Month</p>
                      <p className="text-2xl font-bold text-primary mt-2">
                        {monthlyData.reduce((best, current) =>
                          current[selectedKPI] > best[selectedKPI] ? current : best
                        ).month}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatTooltipValue(Math.max(...monthlyData.map(m => m[selectedKPI])))}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Months Tracked</p>
                      <p className="text-2xl font-bold text-primary mt-2">
                        {monthlyData.length}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Since Jan {currentYear}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {selectedKPI === 'product_knowledge' || selectedKPI === 'smd' ? 'Average' : 'Monthly Average'}
                      </p>
                      <p className="text-2xl font-bold text-primary mt-2">
                        {formatValue(Math.round(totalValue / (monthlyData.length || 1)))}{selectedKPIInfo?.unit}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Per month
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="margin-target" className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Daily Margin Target Tracker</h1>
              <p className="text-muted-foreground mt-2">
                Set monthly targets and track daily progress for {format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy')}
              </p>
            </div>

            {/* Target Setting */}
            <Card className="shadow-sm ">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Monthly Target Setting</span>
                </CardTitle>
                <CardDescription>
                  Set the margin target for {format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end space-x-4">
                  <div className="flex-1 max-w-xs">
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Monthly Target (PKR)
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g., 5,000,000"
                      value={monthlyTarget}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, '').replace(/[^0-9.]/g, '');
                        const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        setMonthlyTarget(formattedValue);
                      }}
                    />
                  </div>
                  <Button onClick={handleSaveTarget} disabled={!monthlyTarget.trim()}>
                    Set Target
                  </Button>
                </div>
                {savedTarget > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">
                      ✓ Current Target: {savedTarget.toLocaleString()} PKR for {format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {savedTarget > 0 && (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Working Days</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {workingDaysInfo.total}
                      </p>
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
                        {(marginAnalysis.dailyTarget / 1000000).toFixed(2)}M
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PKR per working day
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Achieved</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {(marginAnalysis.totalAchieved / 1000000).toFixed(2)}M
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
                      <Badge 
                        variant={marginAnalysis.onTrack ? "default" : "destructive"}
                        className="text-sm"
                      >
                        {marginAnalysis.onTrack ? "On Track" : "Behind Target"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {marginAnalysis.onTrack ? "Meeting expectations" : "Needs improvement"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Remaining Target Info */}
                {marginAnalysis.remaining > 0 && (
                  <Card className="shadow-sm border-orange-200 bg-orange-50">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-orange-800 mb-2">
                          Remaining Target Breakdown
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm text-orange-600">Remaining Amount</p>
                            <p className="text-3xl font-bold text-orange-800">
                              {(marginAnalysis.remaining / 1000000).toFixed(2)}M PKR
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-orange-600">Required Daily (Remaining Days)</p>
                            <p className="text-3xl font-bold text-orange-800">
                              {(marginAnalysis.dailyRequiredForRemaining / 1000000).toFixed(2)}M PKR
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

                {/* Daily Breakdown Table */}
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Daily Margin Breakdown</CardTitle>
                    <CardDescription>
                      Daily performance vs target for {format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy')}
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
                          {marginAnalysis.dailyBreakdown.map((day, index) => {
                            const difference = day.achieved - day.target;
                            return (
                              <tr 
                                key={day.day} 
                                className={`border-b ${
                                  day.isToday ? 'bg-blue-50' : 
                                  day.isPast ? (day.metTarget ? 'bg-green-50' : 'bg-red-50') : 
                                  'bg-gray-50'
                                }`}
                              >
                                <td className="p-3 font-medium">
                                  {day.dayName} {day.day}
                                  {day.isToday && <Badge variant="outline" className="ml-2 text-xs">Today</Badge>}
                                </td>
                                <td className="p-3 text-muted-foreground">
                                  {format(new Date(day.date), 'MMM dd')}
                                </td>
                                <td className="p-3 text-right font-medium">
                                  {day.target.toLocaleString()}
                                </td>
                                <td className="p-3 text-right font-bold">
                                  {day.achieved.toLocaleString()}
                                </td>
                                <td className={`p-3 text-right font-medium ${
                                  difference >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {difference >= 0 ? '+' : ''}{difference.toLocaleString()}
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
