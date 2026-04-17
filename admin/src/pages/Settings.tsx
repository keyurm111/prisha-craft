import { useState, useEffect } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { Lock, ShieldCheck, Eye, EyeOff, Loader2, Mail, Bell, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showEmailPass, setShowEmailPass] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    passwordCurrent: "",
    password: "",
    passwordConfirm: "",
  });

  const [emailData, setEmailData] = useState({
    adminEmail: "",
    emailPassword: "",
    smtpHost: "smtp.gmail.com",
    smtpPort: 465,
  });

  useEffect(() => {
    fetchEmailSettings();
  }, []);

  const fetchEmailSettings = async () => {
    try {
      const res = await api.get("/config");
      const settings = res.data.data.settings;
      if (settings) {
        setEmailData({
          adminEmail: settings.adminEmail || "",
          emailPassword: settings.emailPassword || "",
          smtpHost: settings.smtpHost || "smtp.gmail.com",
          smtpPort: settings.smtpPort || 465,
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setFetching(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.passwordConfirm) {
      return toast.error("New passwords do not match");
    }

    setLoading(true);
    try {
      await api.patch("/auth/updatePassword", {
        passwordCurrent: passwordData.passwordCurrent,
        password: passwordData.password,
      });
      toast.success("Password updated successfully");
      setPasswordData({ passwordCurrent: "", password: "", passwordConfirm: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/config", emailData);
      toast.success("Email configuration saved");
    } catch (error: any) {
      toast.error("Failed to save email settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in max-w-4xl pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tighter mb-2">System Settings</h1>
          <p className="text-muted-foreground text-sm font-medium italic">Manage administrative credentials and notification bridges.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Update Password */}
        <div className="bg-white rounded-[2.5rem] border border-border/40 luxury-shadow p-8 lg:p-10 flex flex-col">
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border/10">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Access Control</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1 flex items-center gap-1.5 focus:text-primary">
                Update Master Password
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6 flex-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Current Credentials</label>
                <div className="relative group">
                  <input
                    type={showCurrent ? "text" : "password"}
                    required
                    className="w-full bg-secondary/10 h-14 px-6 rounded-2xl border border-border/10 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={passwordData.passwordCurrent}
                    onChange={(e) => setPasswordData({ ...passwordData, passwordCurrent: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-black transition-colors"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4 text-primary">New Security Key</label>
                <div className="relative group">
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    className="w-full bg-secondary/10 h-14 px-6 rounded-2xl border border-border/10 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-bold text-sm"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-black transition-colors"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Validate New Key</label>
                <input
                  type="password"
                  required
                  className="w-full bg-secondary/10 h-14 px-6 rounded-2xl border border-border/10 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-bold text-sm"
                  value={passwordData.passwordConfirm}
                  onChange={(e) => setPasswordData({ ...passwordData, passwordConfirm: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-6">
              <Button
                disabled={loading}
                className="w-full h-14 bg-black text-white hover:bg-primary rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all luxury-shadow group"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Update Credentials"}
              </Button>
            </div>
          </form>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-[2.5rem] border border-border/40 luxury-shadow p-8 lg:p-10 flex flex-col">
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border/10">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
              <Bell size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Notifications</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1 flex items-center gap-1.5 transition-colors">
                Configure SMTP Bridge
              </p>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-6 flex-1">
             <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Administrative Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={16} />
                    <input
                      type="email"
                      required
                      placeholder="concierge@prishacrafts.com"
                      className="w-full bg-secondary/10 h-14 pl-14 pr-6 rounded-2xl border border-border/10 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-bold text-sm"
                      value={emailData.adminEmail}
                      onChange={(e) => setEmailData({ ...emailData, adminEmail: e.target.value })}
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Service Password <span className="text-[8px] opacity-40 italic lowercase tracking-normal">(SMTP App Pass)</span></label>
                  <div className="relative group">
                    <input
                      type={showEmailPass ? "text" : "password"}
                      required
                      className="w-full bg-secondary/10 h-14 px-6 rounded-2xl border border-border/10 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-bold text-sm"
                      value={emailData.emailPassword}
                      onChange={(e) => setEmailData({ ...emailData, emailPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailPass(!showEmailPass)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-black transition-colors"
                    >
                      {showEmailPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Host</label>
                    <input
                      type="text"
                      className="w-full bg-secondary/10 h-14 px-6 rounded-2xl border border-border/10 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-bold text-[11px]"
                      value={emailData.smtpHost}
                      onChange={(e) => setEmailData({ ...emailData, smtpHost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Port</label>
                    <input
                      type="number"
                      className="w-full bg-secondary/10 h-14 px-6 rounded-2xl border border-border/10 focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-bold text-[11px]"
                      value={emailData.smtpPort}
                      onChange={(e) => setEmailData({ ...emailData, smtpPort: parseInt(e.target.value) })}
                    />
                  </div>
               </div>
             </div>

             <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <Button
                   type="button"
                   onClick={async () => {
                     setLoading(true);
                     try {
                        const res = await api.post("/config/test-email", emailData);
                        toast.success(res.data.message || "Connection verified. Check your inbox.");
                     } catch (error: any) {
                        toast.error(error.response?.data?.message || "Connection failed. Check credentials.");
                     } finally {
                        setLoading(false);
                     }
                   }}
                   disabled={loading || !emailData.adminEmail || !emailData.emailPassword}
                   className="flex-1 h-14 bg-white text-black border border-black hover:bg-black hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all group"
                >
                   {loading ? <Loader2 className="animate-spin" size={18} /> : "Check Connection"}
                </Button>
                <Button
                   type="submit"
                   disabled={loading}
                   className="flex-[1.5] h-14 bg-black text-white hover:bg-primary rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all luxury-shadow group"
                >
                   {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Configuration"}
                </Button>
             </div>
          </form>
        </div>
      </div>

      <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex gap-6 items-start">
         <div className="w-12 h-12 rounded-2xl bg-amber-200/50 flex items-center justify-center text-amber-700 shrink-0">
            <ShieldCheck size={24} />
         </div>
         <div className="flex-1">
            <h4 className="text-sm font-black uppercase tracking-tight text-amber-800 mb-2">Protocol Validation</h4>
            <p className="text-xs text-amber-700 font-medium italic leading-relaxed">
              Once configured, the system will use these credentials to relay new **Inquiry Alerts** and **Order Confirmations** directly to your masterpiece concierge mailbox. If using Gmail, ensure you provide a dedicated "App Password" rather than your standard account login.
            </p>
         </div>
      </div>
    </div>
  );
}
