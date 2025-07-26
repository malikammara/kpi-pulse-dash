import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, TrendingUp, Target } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: BarChart3,
      title: "KPI Dashboard",
      description: "Monitor daily, weekly, and monthly performance metrics",
      href: "/dashboard"
    },
    {
      icon: Users,
      title: "Employee Management",
      description: "Add and manage employees in the system",
      href: "/manage"
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Track progress and identify improvement areas",
      href: "/dashboard"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and monitor KPI targets for your team",
      href: "/manage"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                KPI Monitoring System
              </h1>
              <p className="text-lg leading-8 mb-8">
                Track, manage, and optimize your team's performance with comprehensive KPI monitoring
              </p>
              <div className="flex justify-center space-x-4">
                <Link to="/dashboard">
                  <Button variant="secondary" size="lg">
                    View Dashboard
                  </Button>
                </Link>
                <Link to="/manage">
                  <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Manage KPIs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Comprehensive Performance Management
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our KPI monitoring system helps you track essential metrics including margin, calls, leads, 
              meetings, and team performance indicators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} to={feature.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <Icon className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* KPI Overview */}
        <div className="bg-muted/border border-border rounded-lg p-6 mb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Key Performance Indicators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {/* 1 */}
              <div className="bg-card p-6 rounded-lg">
                <h3 className="font-semibold text-foreground">Margin</h3>
                <p className="text-2xl font-bold text-primary">3M PKR</p>
                <p className="text-sm text-muted-foreground">Weight: 30%</p>
              </div>
              {/* 2 */}
              <div className="bg-card p-6 rounded-lg">
                <h3 className="font-semibold text-foreground">Calls</h3>
                <p className="text-2xl font-bold text-primary">1,540</p>
                <p className="text-sm text-muted-foreground">Weight: 20%</p>
              </div>
              {/* 3 */}
              <div className="bg-card p-6 rounded-lg">
                <h3 className="font-semibold text-foreground">Leads Generated</h3>
                <p className="text-2xl font-bold text-primary">1,100</p>
                <p className="text-sm text-muted-foreground">Weight: 5%</p>
              </div>
              {/* 4 */}
              <div className="bg-card p-6 rounded-lg">
                <h3 className="font-semibold text-foreground">Solo Closing</h3>
                <p className="text-2xl font-bold text-primary">1</p>
                <p className="text-sm text-muted-foreground">Weight: 10%</p>
              </div>
              {/* 5 */}
              <div className="bg-card p-6 rounded-lg">
                <h3 className="font-semibold text-foreground">Out-House Meetings</h3>
                <p className="text-2xl font-bold text-primary">44</p>
                <p className="text-sm text-muted-foreground">Weight: 10%</p>
              </div>
              {/* 6 */}
              <div className="bg-card p-6 rounded-lg">
                <h3 className="font-semibold text-foreground">In-House Meetings</h3>
                <p className="text-2xl font-bold text-primary">22</p>
                <p className="text-sm text-muted-foreground">Weight: 15%</p>
              </div>
              {/* 7 */}
              <div className="bg-card p-6 rounded-lg">
                <h3 className="font-semibold text-foreground">Product Knowledge</h3>
                <p className="text-2xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground">Weight: 5%</p>
              </div>
              {/* 8 */}
              <div className="bg-card p-6 rounded-lg">
                <h3 className="font-semibold text-foreground">SMD</h3>
                <p className="text-2xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground">Weight: 5%</p>
              </div>
            </div>
          </div>
        </div>

      </div>
      {/* --- Footer starts here --- */}
      <footer className="bg-white rounded-lg shadow-sm m-4 dark:bg-gray-800">
        <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © {new Date().getFullYear()}{" "}
            <a
              href="https://taha-khadim.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-semibold"
            >
              Made with ❤️ by Taha Khadim
            </a>. All Rights Reserved.
          </span>
          <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
            <li>
              <a
                href="https://taha-khadim.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline me-4 md:me-6"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="https://taha-khadim.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline me-4 md:me-6"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="https://taha-khadim.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline me-4 md:me-6"
              >
                Licensing
              </a>
            </li>
            <li>
              <a
                href="https://taha-khadim.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </footer>


    </Layout>
  );
};

export default Index;
