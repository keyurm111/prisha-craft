import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, data } = response.data;
      
      login(token, data.user);
      
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate("/");
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] xl:h-[calc(100vh-80px)] flex items-stretch overflow-hidden">
      {/* Left Column: Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center p-6 lg:p-12 bg-background border-r border-border/50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="mb-6">
            <Link to="/" className="inline-block mb-4">
              <img 
                src="/images/logo.png" 
                alt="Prisha Crafts" 
                className="h-12 w-auto object-contain"
              />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Welcome Back</h1>
            <p className="text-muted-foreground text-sm font-medium leading-normal italic">Access your global bag boutique.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-9 h-11 bg-secondary/30 border-none rounded-lg text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                <button type="button" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 h-11 bg-secondary/30 border-none rounded-lg text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 rounded-lg font-bold text-sm gap-2 mt-2 transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
              {!isLoading && <ArrowRight size={16} />}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-background px-3 text-muted-foreground font-bold tracking-widest">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-lg font-bold text-sm gap-3 border-border hover:bg-secondary/20 bg-white text-black transition-all"
              onClick={() => toast.info("Google Login coming soon!")}
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                alt="Google" 
                className="w-4 h-4"
              />
              Google
            </Button>
          </form>

          <p className="mt-8 text-xs text-center text-muted-foreground font-medium">
            New to Prisha Crafts?{" "}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Column: Image */}
      <div className="hidden lg:block lg:flex-1 relative">
        <img
          src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=1200"
          alt="Artisan Workshop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-12 bottom-12 p-10 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 ring-1 ring-white/20">
          <p className="text-white text-2xl font-heading font-medium leading-relaxed italic max-w-lg">
            "The beauty of handcrafted bags lies in the story of every stitch and the passion of the maker."
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="h-px w-10 bg-primary shadow-sm shadow-primary/50" />
            <span className="text-white/70 text-[10px] font-black uppercase tracking-[0.25em]">Est. 2008</span>
          </div>
        </div>
      </div>
    </div>

  );
}

