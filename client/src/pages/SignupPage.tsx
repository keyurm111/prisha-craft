import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import api from "@/services/api";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      toast.error("Please agree to the Terms & Conditions.");
      return;
    }
    if (!name || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/signup", { name, email, password });
      toast.success("Account created successfully! Please login.");
      navigate("/login");
    } catch (error: any) {
      const message = error.response?.data?.message || "Signup failed. Please try again.";
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
            <h1 className="text-2xl font-bold tracking-tight mb-1">Create Account</h1>
            <p className="text-muted-foreground text-sm font-medium leading-normal italic">Join the Prisha Crafts family today.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
                <Input
                  type="text"
                  placeholder="Keyur Moradiya"
                  className="pl-10 h-10.5 bg-secondary/20 border-border/50 rounded-lg text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 h-10.5 bg-secondary/20 border-border/50 rounded-lg text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-10.5 bg-secondary/20 border-border/50 rounded-lg text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-1 py-0.5">
              <Checkbox
                id="terms"
                checked={agree}
                onCheckedChange={(checked) => setAgree(checked as boolean)}
                className="rounded scale-90"
              />
              <label htmlFor="terms" className="text-[10px] text-muted-foreground font-medium cursor-pointer leading-none">
                I agree to the <Link to="/terms" className="text-primary font-bold hover:underline">Terms</Link> & <Link to="/privacy" className="text-primary font-bold hover:underline">Privacy</Link>
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-10.5 rounded-lg font-bold text-sm gap-2 shadow-lg shadow-primary/5 mt-1 transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Join Now"}
              {!isLoading && <ArrowRight size={16} />}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full h-10.5 rounded-lg font-bold text-xs gap-3 border border-border/50 hover:bg-secondary/30 transition-all bg-white text-black"
              onClick={() => toast.info("Google Signup coming soon!")}
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                alt="Google" 
                className="w-4 h-4"
              />
              Google
            </Button>
          </form>

          <p className="mt-6 text-xs text-center text-muted-foreground font-medium">
            Member already?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Column: Image */}
      <div className="hidden lg:block lg:flex-1 relative bg-secondary">
        <img
          src="https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=1200"
          alt="Artisanal Handbags"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-12 left-12 right-12 p-8 bg-black/50 backdrop-blur-xl rounded-3xl border border-white/10">
          <p className="text-white text-lg font-heading font-light tracking-wide leading-relaxed italic">
            "The perfect bag is not just an accessory; it carries your world with handcrafted grace."
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-[1px] w-8 bg-primary shadow-sm shadow-primary/50" />
            <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">Crafted Excellence</span>
          </div>
        </div>
      </div>
    </div>

  );
}

