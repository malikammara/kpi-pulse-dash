import React, { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

// Helpers
const formatDate = (value: string) => new Date(value).toLocaleDateString();
const formatCurrency = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 0 });
const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const timeMatchesPreset = (date: string, preset: string) => {
  const now = new Date();
  const itemDate = new Date(date);
  const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);

  if (preset === "today") {
    return itemDate.toDateString() === now.toDateString();
  }
  if (preset === "last7") {
    return diffDays <= 7 && diffDays >= 0;
  }
  if (preset === "last30") {
    return diffDays <= 30 && diffDays >= 0;
  }
  if (preset === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return itemDate >= start && itemDate <= end;
  }
  if (preset === "month") {
    return itemDate.getMonth() === now.getMonth() &&
      itemDate.getFullYear() === now.getFullYear();
  }
  return true;
};

const classifyMargin = (value: number) => {
  if (value <= 500_000) return "Russell";
  if (value <= 2_000_000) return "S&P";
  if (value <= 10_000_000) return "Nasdaq";
  return "Dow";
};

type CallLog = {
  id: string;
  agent: string;
  date: string;
  clientSegment: string;
  meetingType: "Inbound" | "Outbound";
  importance: number;
  talkTime: number;
  callsMade: number;
  meetingAgreedTo: boolean;
  notes?: string;
};

type ProjectedMeeting = {
  id: string;
  prospect: string;
  meetingDate: string;
  projectedMargin: number;
  meetingType: "Inbound" | "Outbound";
  industry: string;
};

const ProjectedMeetingsSection: React.FC<{
  title: string;
  data: ProjectedMeeting[];
}> = ({ title, data }) => {
  const [quickRange, setQuickRange] = useState<"" | "today" | "week" | "month">("");
  const [rangeMode, setRangeMode] = useState<"" | "quick" | "custom">("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [meetingTypeFilter, setMeetingTypeFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  type SortableKey = keyof ProjectedMeeting | "classification";

  const [sortKey, setSortKey] = useState<SortableKey>("meetingDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const formattedData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        classification: classifyMargin(item.projectedMargin),
      })),
    [data]
  );

  const filteredRows = useMemo(() => {
    const fromDate = customFrom ? new Date(customFrom) : null;
    const toDate = customTo ? new Date(customTo) : null;

    return formattedData
      .filter((row) => {
        const matchesClassification =
          classificationFilter === "all" || row.classification === classificationFilter;
        const matchesMeetingType = meetingTypeFilter === "all" || row.meetingType === meetingTypeFilter;
        const matchesIndustry = industryFilter === "all" || row.industry === industryFilter;

        if (!matchesClassification || !matchesMeetingType || !matchesIndustry) return false;

        if (rangeMode === "quick" && quickRange) {
          return timeMatchesPreset(row.meetingDate, quickRange);
        }
        if (rangeMode === "custom" && (fromDate || toDate)) {
          const current = new Date(row.meetingDate);
          if (fromDate && current < fromDate) return false;
          if (toDate && current > toDate) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dir = sortDirection === "asc" ? 1 : -1;

        const getValue = (row: ProjectedMeeting & { classification: string }) => {
          switch (sortKey) {
            case "classification":
              return row.classification;
            case "meetingDate":
              return row.meetingDate;
            case "projectedMargin":
              return row.projectedMargin;
            case "industry":
              return row.industry;
            case "meetingType":
              return row.meetingType;
            case "prospect":
            default:
              return row.prospect;
          }
        };

        const valueA = getValue(a);
        const valueB = getValue(b);

        if (sortKey === "meetingDate") {
          return (new Date(valueA as string).getTime() - new Date(valueB as string).getTime()) * dir;
        }
        if (sortKey === "projectedMargin") {
          return ((valueA as number) - (valueB as number)) * dir;
        }
        return String(valueA).localeCompare(String(valueB)) * dir;
      });
  }, [classificationFilter, meetingTypeFilter, industryFilter, quickRange, rangeMode, customFrom, customTo, formattedData, sortDirection, sortKey]);

  const totalProjectedMargin = useMemo(
    () => filteredRows.reduce((sum, row) => sum + row.projectedMargin, 0),
    [filteredRows]
  );

  const toggleSort = (key: SortableKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const resetFilters = () => {
    setQuickRange("");
    setRangeMode("");
    setCustomFrom("");
    setCustomTo("");
    setClassificationFilter("all");
    setMeetingTypeFilter("all");
    setIndustryFilter("all");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Time filters are mutually exclusive. Sorting works on every column with a clear arrow indicator.
          </CardDescription>
        </div>
        <Badge variant="outline" className="text-base font-semibold">
          Total Projected Margin: PKR {formatCurrency(totalProjectedMargin)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Quick View</Label>
              <Select
                disabled={rangeMode === "custom"}
                value={rangeMode === "quick" ? quickRange : ""}
                onValueChange={(value: "today" | "week" | "month" | "") => {
                  setQuickRange(value);
                  setRangeMode("quick");
                  setCustomFrom("");
                  setCustomTo("");
                }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select quick range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>From date</Label>
            <input
              type="date"
              className="w-full rounded border px-3 py-2 text-sm"
              disabled={rangeMode === "quick"}
              value={customFrom}
              onChange={(e) => {
                setRangeMode("custom");
                setQuickRange("");
                setCustomFrom(e.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>To date</Label>
            <input
              type="date"
              className="w-full rounded border px-3 py-2 text-sm"
              disabled={rangeMode === "quick"}
              value={customTo}
              onChange={(e) => {
                setRangeMode("custom");
                setQuickRange("");
                setCustomTo(e.target.value);
              }}
            />
          </div>
          <div className="space-y-2 flex items-end">
            <Button variant="outline" className="w-full" onClick={resetFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Classification</Label>
            <Select value={classificationFilter} onValueChange={setClassificationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Russell">Russell (≤ 500k)</SelectItem>
                <SelectItem value="S&P">S&P (500,001 – 2,000,000)</SelectItem>
                <SelectItem value="Nasdaq">Nasdaq (2,000,001 – 10,000,000)</SelectItem>
                <SelectItem value="Dow">Dow (&gt; 10,000,000)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Meeting Type</Label>
            <Select value={meetingTypeFilter} onValueChange={setMeetingTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Inbound">Inbound</SelectItem>
                <SelectItem value="Outbound">Outbound</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {[...new Set(data.map((d) => d.industry))].map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  { key: "prospect", label: "Prospect" },
                  { key: "meetingDate", label: "Meeting Date" },
                  { key: "meetingType", label: "Meeting Type" },
                  { key: "industry", label: "Industry" },
                  { key: "classification", label: "Classification" },
                  { key: "projectedMargin", label: "Projected Margin" },
                ].map((col) => (
                  <TableHead
                    key={col.key}
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort(col.key as SortableKey)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key ? (
                        <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
                      ) : (
                        <span className="text-muted-foreground">▲</span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-semibold">{row.prospect}</TableCell>
                  <TableCell>{formatDate(row.meetingDate)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{row.meetingType}</Badge>
                  </TableCell>
                  <TableCell>{row.industry}</TableCell>
                  <TableCell>{row.classification}</TableCell>
                  <TableCell className="text-right">
                    PKR {formatCurrency(row.projectedMargin)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const callLogs: CallLog[] = useMemo(
    () => [
      {
        id: "1",
        agent: "Aisha Khan",
        date: new Date().toISOString(),
        clientSegment: "SME",
        meetingType: "Inbound",
        importance: 5,
        talkTime: 12,
        callsMade: 1,
        meetingAgreedTo: true,
        notes: "Requested follow-up deck",
      },
      {
        id: "2",
        agent: "Aisha Khan",
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        clientSegment: "Enterprise",
        meetingType: "Outbound",
        importance: 4,
        talkTime: 9,
        callsMade: 1,
        meetingAgreedTo: false,
        notes: "Needs budget approval",
      },
      {
        id: "3",
        agent: "Bilal Sheikh",
        date: new Date(Date.now() - 6 * 86400000).toISOString(),
        clientSegment: "Retail",
        meetingType: "Outbound",
        importance: 3,
        talkTime: 6,
        callsMade: 1,
        meetingAgreedTo: true,
        notes: "Converted to trial",
      },
      {
        id: "4",
        agent: "Bilal Sheikh",
        date: new Date(Date.now() - 15 * 86400000).toISOString(),
        clientSegment: "SME",
        meetingType: "Inbound",
        importance: 2,
        talkTime: 4,
        callsMade: 1,
        meetingAgreedTo: false,
      },
      {
        id: "5",
        agent: "Maria Ahmed",
        date: new Date(Date.now() - 20 * 86400000).toISOString(),
        clientSegment: "Enterprise",
        meetingType: "Outbound",
        importance: 5,
        talkTime: 15,
        callsMade: 1,
        meetingAgreedTo: true,
        notes: "High potential account",
      },
      {
        id: "6",
        agent: "Maria Ahmed",
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        clientSegment: "Retail",
        meetingType: "Inbound",
        importance: 1,
        talkTime: 3,
        callsMade: 1,
        meetingAgreedTo: false,
      },
      {
        id: "7",
        agent: "Sunil Kumar",
        date: new Date(Date.now() - 9 * 86400000).toISOString(),
        clientSegment: "SME",
        meetingType: "Outbound",
        importance: 4,
        talkTime: 8,
        callsMade: 1,
        meetingAgreedTo: true,
      },
      {
        id: "8",
        agent: "Sunil Kumar",
        date: new Date(Date.now() - 25 * 86400000).toISOString(),
        clientSegment: "Enterprise",
        meetingType: "Inbound",
        importance: 5,
        talkTime: 14,
        callsMade: 1,
        meetingAgreedTo: true,
        notes: "Interested in premium tier",
      },
    ],
    []
  );

  const prospectMeetings: ProjectedMeeting[] = useMemo(
    () => [
      {
        id: "p1",
        prospect: "Alpha Textiles",
        meetingDate: new Date().toISOString(),
        meetingType: "Inbound",
        industry: "Manufacturing",
        projectedMargin: 450_000,
      },
      {
        id: "p2",
        prospect: "Blue Fin Securities",
        meetingDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        meetingType: "Outbound",
        industry: "Financial Services",
        projectedMargin: 5_750_000,
      },
      {
        id: "p3",
        prospect: "Civic Builders",
        meetingDate: new Date(Date.now() + 6 * 86400000).toISOString(),
        meetingType: "Outbound",
        industry: "Construction",
        projectedMargin: 1_200_000,
      },
      {
        id: "p4",
        prospect: "Dynamic Labs",
        meetingDate: new Date(Date.now() + 12 * 86400000).toISOString(),
        meetingType: "Inbound",
        industry: "Technology",
        projectedMargin: 11_000_000,
      },
    ],
    []
  );

  const closingCases: ProjectedMeeting[] = useMemo(
    () => [
      {
        id: "c1",
        prospect: "Emerald Motors",
        meetingDate: new Date(Date.now() - 1 * 86400000).toISOString(),
        meetingType: "Inbound",
        industry: "Automotive",
        projectedMargin: 800_000,
      },
      {
        id: "c2",
        prospect: "Frontier Foods",
        meetingDate: new Date(Date.now() + 3 * 86400000).toISOString(),
        meetingType: "Outbound",
        industry: "Consumer Goods",
        projectedMargin: 2_400_000,
      },
      {
        id: "c3",
        prospect: "Grand Hotels",
        meetingDate: new Date(Date.now() + 10 * 86400000).toISOString(),
        meetingType: "Inbound",
        industry: "Hospitality",
        projectedMargin: 9_200_000,
      },
      {
        id: "c4",
        prospect: "Harbor Logistics",
        meetingDate: new Date(Date.now() + 16 * 86400000).toISOString(),
        meetingType: "Outbound",
        industry: "Logistics",
        projectedMargin: 12_500_000,
      },
    ],
    []
  );

  const [callTimePreset, setCallTimePreset] = useState<"today" | "last7" | "last30" | "custom">("last7");
  const [callCustomFrom, setCallCustomFrom] = useState("");
  const [callCustomTo, setCallCustomTo] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [callMeetingType, setCallMeetingType] = useState("all");
  const [importanceFilter, setImportanceFilter] = useState("all");
  const [talkTimeFilter, setTalkTimeFilter] = useState("all");
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const filteredCalls = useMemo(() => {
    const fromDate = callCustomFrom ? new Date(callCustomFrom) : null;
    const toDate = callCustomTo ? new Date(callCustomTo) : null;
    const preset = callTimePreset;

    return callLogs.filter((log) => {
      const matchesPreset =
        preset === "custom"
          ? (() => {
              const current = new Date(log.date);
              if (fromDate && current < fromDate) return false;
              if (toDate && current > toDate) return false;
              return true;
            })()
          : timeMatchesPreset(log.date, preset);

      const matchesSegment = segmentFilter === "all" || log.clientSegment === segmentFilter;
      const matchesMeetingType = callMeetingType === "all" || log.meetingType === callMeetingType;
      const matchesImportance =
        importanceFilter === "all" || log.importance >= Number(importanceFilter);

      const matchesTalkTime = (() => {
        if (talkTimeFilter === "all") return true;
        if (talkTimeFilter === "short") return log.talkTime < 5;
        if (talkTimeFilter === "medium") return log.talkTime >= 5 && log.talkTime <= 10;
        if (talkTimeFilter === "long") return log.talkTime > 10;
        return true;
      })();

      return matchesPreset && matchesSegment && matchesMeetingType && matchesImportance && matchesTalkTime;
    });
  }, [callLogs, callTimePreset, callCustomFrom, callCustomTo, segmentFilter, callMeetingType, importanceFilter, talkTimeFilter]);

  const agentSummaries = useMemo(() => {
    const map = new Map<string, { calls: number; meetings: number; talkTime: number }>();

    filteredCalls.forEach((log) => {
      const existing = map.get(log.agent) || { calls: 0, meetings: 0, talkTime: 0 };
      existing.calls += log.callsMade;
      existing.meetings += log.meetingAgreedTo ? 1 : 0;
      existing.talkTime += log.talkTime;
      map.set(log.agent, existing);
    });

    return Array.from(map.entries()).map(([agent, stats]) => {
      const conversion = stats.calls > 0 ? (stats.meetings / stats.calls) * 100 : 0;
      const averageTalk = stats.calls > 0 ? stats.talkTime / stats.calls : 0;
      return {
        agent,
        totalCalls: stats.calls,
        meetings: stats.meetings,
        conversion,
        averageTalk,
      };
    });
  }, [filteredCalls]);

  const holisticTotals = useMemo(() => {
    const calls = filteredCalls.reduce((sum, log) => sum + log.callsMade, 0);
    const meetings = filteredCalls.filter((log) => log.meetingAgreedTo).length;
    const conversion = calls > 0 ? (meetings / calls) * 100 : 0;
    const topSegment = (() => {
      const counts = new Map<string, number>();
      filteredCalls.forEach((log) => counts.set(log.clientSegment, (counts.get(log.clientSegment) || 0) + 1));
      const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
      return sorted[0]?.[0] ?? "-";
    })();
    return {
      calls,
      meetings,
      conversion,
      topSegment,
    };
  }, [filteredCalls]);

  const agentDetailLogs = useMemo(
    () =>
      filteredCalls.filter((log) =>
        activeAgent ? log.agent === activeAgent : true
      ),
    [filteredCalls, activeAgent]
  );

  const kpiTargets = [
    { key: "initial_margin_deposit", label: "Initial Margin Deposit", target: 3_000_000, weight: 30, unit: "PKR", value: 2_450_000 },
    { key: "calls", label: "Calls", target: 70, weight: 20, unit: "Calls", value: holisticTotals.calls },
    { key: "in_house_meetings", label: "In-House Meetings", target: 1, weight: 15, unit: "Meetings", value: holisticTotals.meetings },
    { key: "out_house_meetings", label: "Out-House Meetings", target: 2, weight: 10, unit: "Meetings", value: 3 },
    { key: "independent_closures", label: "Independent Closures", target: 10, weight: 10, unit: "%", value: 8 },
    { key: "sales_management_discipline", label: "Sales Management Discipline", target: 5, weight: 5, unit: "%", value: 4 },
    { key: "product_knowledge", label: "Product Knowledge", target: 5, weight: 5, unit: "%", value: 3.5 },
    { key: "crm_dashboard_compliance", label: "CRM Dashboard Compliance", target: 100, weight: 5, unit: "%", value: 92 },
    { key: "solo_accounts_closure", label: "Solo Accounts Closure", target: 1, weight: 5, unit: "Closures", value: 1 },
    { key: "lead_generation", label: "Lead Generation", target: 50, weight: 5, unit: "Leads", value: 37 },
  ];

  const kpiChartData = kpiTargets.map((kpi) => {
    const progress = Math.min((kpi.value / kpi.target) * 100, 120);
    return {
      name: kpi.label,
      progress,
      value: kpi.value,
      target: kpi.target,
      weight: kpi.weight,
      unit: kpi.unit,
    };
  });

  const weightedScore = useMemo(() => {
    const total = kpiChartData.reduce((sum, kpi) => sum + (Math.min(kpi.progress, 100) / 100) * kpi.weight, 0);
    return total.toFixed(1);
  }, [kpiChartData]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Performance Dashboards</h1>
          <p className="text-muted-foreground">
            Enhanced visibility across telesales, projected meetings, and KPI progress with real-time filtering, sorting, and drill-downs.
          </p>
        </div>

        {/* Calls & Telesales Dashboard */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Calls &amp; Telesales Dashboard</CardTitle>
            <CardDescription>
              Holistic view auto-calculates from call logs. Click an agent to drill into the detailed call-by-call view.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-1">
                <Label>Time Period</Label>
                <Select value={callTimePreset} onValueChange={(value: "today" | "last7" | "last30" | "custom") => setCallTimePreset(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="last7">Last 7 Days</SelectItem>
                    <SelectItem value="last30">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {callTimePreset === "custom" && (
                <>
                  <div className="space-y-1">
                    <Label>From</Label>
                    <input
                      type="date"
                      className="w-full rounded border px-3 py-2 text-sm"
                      value={callCustomFrom}
                      onChange={(e) => setCallCustomFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>To</Label>
                    <input
                      type="date"
                      className="w-full rounded border px-3 py-2 text-sm"
                      value={callCustomTo}
                      onChange={(e) => setCallCustomTo(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className="space-y-1">
                <Label>Client Segment</Label>
                <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {[...new Set(callLogs.map((log) => log.clientSegment))].map((segment) => (
                      <SelectItem key={segment} value={segment}>
                        {segment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Meeting Type</Label>
                <Select value={callMeetingType} onValueChange={setCallMeetingType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Inbound">Inbound</SelectItem>
                    <SelectItem value="Outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Importance (min stars)</Label>
                <Select value={importanceFilter} onValueChange={setImportanceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        {"★".repeat(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Average Talk Time</Label>
                <Select value={talkTimeFilter} onValueChange={setTalkTimeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="short">Under 5 mins</SelectItem>
                    <SelectItem value="medium">5 - 10 mins</SelectItem>
                    <SelectItem value="long">Over 10 mins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Calls</p>
                  <p className="text-3xl font-bold">{holisticTotals.calls}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Meetings Agreed</p>
                  <p className="text-3xl font-bold">{holisticTotals.meetings}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-amber-50 to-amber-100">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Conversion Ratio</p>
                  <p className="text-3xl font-bold">{holisticTotals.conversion.toFixed(1)}%</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Top Client Segment</p>
                  <p className="text-3xl font-bold">{holisticTotals.topSegment}</p>
                </CardContent>
              </Card>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Total Calls</TableHead>
                    <TableHead>Meetings</TableHead>
                    <TableHead>Conversion Ratio</TableHead>
                    <TableHead>Avg Talk Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentSummaries.map((agent) => (
                    <TableRow
                      key={agent.agent}
                      className={cn("cursor-pointer", activeAgent === agent.agent && "bg-muted")}
                      onClick={() => setActiveAgent(agent.agent)}
                    >
                      <TableCell className="font-semibold text-primary underline">
                        {agent.agent}
                      </TableCell>
                      <TableCell>{agent.totalCalls}</TableCell>
                      <TableCell>{agent.meetings}</TableCell>
                      <TableCell>{agent.conversion.toFixed(1)}%</TableCell>
                      <TableCell>{agent.averageTalk.toFixed(1)} mins</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Call-by-Call Detail</h3>
                {activeAgent && (
                  <Button variant="ghost" size="sm" onClick={() => setActiveAgent(null)}>
                    Clear agent selection
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Client Segment</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Importance</TableHead>
                      <TableHead>Talk Time</TableHead>
                      <TableHead>Meeting?</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agentDetailLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.agent}</TableCell>
                        <TableCell>{formatDate(log.date)}</TableCell>
                        <TableCell>{log.clientSegment}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{log.meetingType}</Badge>
                        </TableCell>
                        <TableCell>{"★".repeat(log.importance)}</TableCell>
                        <TableCell>{log.talkTime} mins</TableCell>
                        <TableCell>{log.meetingAgreedTo ? "Yes" : "No"}</TableCell>
                        <TableCell className="max-w-xs truncate" title={log.notes}>
                          {log.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProjectedMeetingsSection title="Projected Meetings – Prospects" data={prospectMeetings} />
          <ProjectedMeetingsSection title="Projected Meetings – Closing Cases" data={closingCases} />
        </div>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>KPI Overview Dashboard</CardTitle>
              <CardDescription>
                Weighted KPIs with normalized progress, interactive tooltips, and an aggregated weighted score.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-base">
              Overall Weighted Score: {weightedScore}%
            </Badge>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiChartData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={80} />
                  <YAxis domain={[0, 120]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    formatter={(value: number, _name, payload) => {
                      const { target, value: current, unit } = payload?.payload || {};
                      return [
                        `${formatPercent(value as number)} | ${current} ${unit}`,
                        "Progress",
                      ];
                    }}
                    labelFormatter={(label) => label}
                  />
                  <Bar dataKey="progress" radius={[4, 4, 0, 0]} fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {kpiChartData.map((kpi) => {
                const normalized = Math.min(kpi.progress, 100);
                return (
                  <div key={kpi.name} className="p-3 border rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{kpi.name}</span>
                      <span className="text-muted-foreground">Weight {kpi.weight}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {kpi.value} / {kpi.target} {kpi.unit}
                    </div>
                    <div className="h-2 bg-muted rounded">
                      <div
                        className="h-2 rounded bg-primary"
                        style={{ width: `${normalized}%` }}
                      />
                    </div>
                    <div className="text-xs font-semibold">{formatPercent(normalized)}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
