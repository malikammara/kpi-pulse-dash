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

const TeamPerformance: React.FC = () => {
  const [selectedKPI, setSelectedKPI] = useState("margin");
  const currentYear = new Date().getFullYear();

  const { data: kpiData = [], isLoading } = useKPIData({
    year: currentYear.toString(),
  });

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Team Performance Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Monthly performance overview for the entire team from {currentYear}
          </p>
        </div>

        {/* KPI Selector */}
        <div className="mb-8">
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
        </div>

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
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
    </Layout>
  );
};

export default TeamPerformance;
