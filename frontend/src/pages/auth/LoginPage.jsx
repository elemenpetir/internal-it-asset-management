import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loginWithCredentials(emailValue, passwordValue) {
    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailValue, password: passwordValue }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      localStorage.setItem("token", result.data.token);
      localStorage.setItem("name", result.data.user.name);

      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required.");
      return;
    }

    loginWithCredentials(email, password);
  }

  function handleDemoLogin(role) {
    const demoAccounts = {
      employee: { email: "budi.santoso@company.com", password: "password123" },
      admin: { email: "admin@company.com", password: "password123" },
      manager: { email: "rina.marlina@company.com", password: "password123" },
    };

    const { email: demoEmail, password: demoPassword } = demoAccounts[role];
    setEmail(demoEmail);
    setPassword(demoPassword);
    loginWithCredentials(demoEmail, demoPassword);
  }

  useEffect(() => {
    if (location.state?.successMessage) {
      toast.success(location.state.successMessage);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-100">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to AssetShield
          </p>
        </div>

        <Card className="mt-6">
          <CardContent className="space-y-4 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-slate-400">
                or try a demo account
              </span>
              <Separator className="flex-1" />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin("employee")}
                disabled={isSubmitting}
              >
                Login as Employee
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin("admin")}
                disabled={isSubmitting}
              >
                Login as Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin("manager")}
                disabled={isSubmitting}
              >
                Login as Manager
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/activate-account"
            className="font-medium text-link hover:underline"
          >
            Activate your account
          </Link>
        </p>
      </div>
    </div>
  );
}
