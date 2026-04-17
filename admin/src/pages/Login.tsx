import { useState } from "react";
import api from "@/services/api";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      
      // Store token for admin origin (localStorage)
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      
      toast.success("Login Successful");
      navigate("/");
      window.location.reload(); // Refresh to ensure api interceptor has the token
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid Credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Design */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/3 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-white rounded-[3rem] luxury-shadow border border-border/40 p-12 relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-heading font-black tracking-tighter mb-2 uppercase">Admin Login</h1>
          <p className="text-muted-foreground font-medium italic text-sm">Please sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 pl-14 pr-6 bg-secondary/30 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-14 pr-6 bg-secondary/30 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-16 bg-black text-white font-black uppercase tracking-widest text-[13px] rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 mt-10"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : null}
            Sign In
          </button>
        </form>

        <div className="mt-12 text-center">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
            Secure Access
           </p>
        </div>
      </div>
    </div>
  );
}
