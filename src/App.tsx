import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ManageKPIs from "./pages/ManageKPIs";
import CRM from "./pages/CRM";
import TeamPerformance from "./pages/TeamPerformance";
import EmployeePerformance from "./pages/EmployeePerformance";
import Auth from "./pages/Auth";
import AdminGuard from "@/components/AdminGuard";
import LoginGuard from "@/components/LoginGuard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <LoginGuard>
                  <Dashboard />
                </LoginGuard>
              } 
            />
            <Route 
              path="/team-performance" 
              element={
                <LoginGuard>
                  <TeamPerformance />
                </LoginGuard>
              } 
            />
            <Route path="/manage" element={
              <AdminGuard>
                <ManageKPIs />
              </AdminGuard>
            } />
            <Route path="/crm" element={
              <LoginGuard>
                <CRM />
              </LoginGuard>
            } />
            <Route path="/employee-performance" element={
              <AdminGuard>
                <EmployeePerformance />
              </AdminGuard>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
