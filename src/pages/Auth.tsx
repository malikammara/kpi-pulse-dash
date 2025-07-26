import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        title: "Sign In Error",
        description: "Failed to sign in with Google. Please try again.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Sign in to access the KPI Monitoring System dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button onClick={handleGoogleSignIn} disabled={loading}>
            {loading ? "Signing In..." : "Sign in with Google"}
          </Button>
          <Link to="/dashboard">
            <Button variant="outline" className="w-full">
              Back to Main Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;