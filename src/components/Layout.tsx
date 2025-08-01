import { Link, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Home, Settings, Users, LogOut, User, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { toast } = useToast();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "KPI Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "CRM", href: "/crm", icon: UserCheck },
    { name: "Manage KPIs", href: "/manage", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-xl font-bold text-foreground">KPI Monitor</h1>
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
                      className="flex items-center space-x-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="text-muted-foreground">{user.email}</span>
                  {isAdmin && (
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">Admin</span>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    try {
                      await signOut();
                      navigate('/auth');
                      toast({
                        title: "Signed out",
                        description: "You have been successfully signed out.",
                      });
                    } catch (error) {
                      toast({
                        title: "Sign out failed",
                        description: "Failed to sign out. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
};

export default Layout;