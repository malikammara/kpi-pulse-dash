import Layout from "@/components/Layout";
import KPICard from "@/components/KPICard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  // Sample KPI data
  const kpiData = [
    { title: "Margin", achieved: 100000, target: 3000000, weight: 30, unit: " PKR" },
    { title: "Calls", achieved: 50, target: 1540, weight: 20 },
    { title: "Leads Generated", achieved: 500, target: 1100, weight: 5 },
    { title: "Solo Closing", achieved: 0, target: 1, weight: 10 },
    { title: "Out-House Meetings", achieved: 1, target: 44, weight: 10 },
    { title: "In-House Meetings", achieved: 0, target: 22, weight: 15 },
    { title: "Product Knowledge", achieved: 50, target: 100, weight: 5, unit: "%" },
    { title: "SMD", achieved: 70, target: 100, weight: 5, unit: "%" },
  ];

  // Sample chart data
  const chartData = [
    { name: "May", value: 5 },
    { name: "June", value: 8 },
    { name: "July", value: 45 },
    { name: "Aug", value: 12 },
    { name: "Sep", value: 3 },
    { name: "Oct", value: 50 },
    { name: "Nov", value: 70 },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">KPI Dashboard</h1>
          <p className="text-muted-foreground mt-2">Monitor daily, weekly, and monthly performance</p>
        </div>

        {/* Monthly Performance Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Performance trends over the past months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="value" fill="hsl(var(--accent))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <KPICard
              key={index}
              title={kpi.title}
              achieved={kpi.achieved}
              target={kpi.target}
              weight={kpi.weight}
              unit={kpi.unit}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;