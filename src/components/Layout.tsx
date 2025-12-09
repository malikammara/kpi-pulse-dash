import { Link, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Home, Settings, Users, UserCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "KPI Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Team Performance", href: "/team-performance", icon: TrendingUp },
    { name: "Manage KPIs", href: "/manage", icon: Settings },
  ];

  return (
    <div className="min-h-screen text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-sky-400/10 via-sky-500/5 to-slate-900/60" />
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-primary mr-2 drop-shadow" />
              <h1 className="text-xl font-bold text-white tracking-tight">KPI Monitor</h1>
            </div>

            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.name} to={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "flex items-center space-x-2 transition-all", 
                        isActive
                          ? "shadow-md shadow-primary/30"
                          : "hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm text-sky-50">
                <Users className="h-4 w-4" />
                <span className="text-sky-100/90">{user?.email ?? "Demo User"}</span>
                {isAdmin && (
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs">Demo Admin</span>
                )}
              </div>
              <Button variant="secondary" size="sm" className="bg-white/10 text-white border border-white/20">
                Demo Mode
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>
    </div>
  );
};

export default Layout;