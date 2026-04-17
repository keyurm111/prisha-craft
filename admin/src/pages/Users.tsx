import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { User as UserIcon, Mail, Calendar, ShieldCheck, Phone, MapPin, X, ExternalLink, Info, Loader2 } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  googleId?: string;
  role: string;
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      // Filter out admin details - keep only customers
      const filteredUsers = response.data.data.users.filter((u: User) => u.role !== "admin" && u.role !== "Admin");
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in py-2 md:py-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tighter mb-1">Users</h1>
          <p className="text-muted-foreground text-sm font-medium italic">Manage and view your registered user base.</p>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-border/40 luxury-shadow overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/30">
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">User Profile</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Contact</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <p className="text-muted-foreground italic font-medium">No users found in the system yet.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="group hover:bg-secondary/20 transition-colors">
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary font-black border border-primary/10 shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-foreground mb-1 truncate">{user.name}</p>
                          <div className="flex items-center gap-2 text-[9px] text-muted-foreground/60 font-black uppercase tracking-wider bg-secondary/80 px-2 py-0.5 rounded w-fit whitespace-nowrap">
                            <ShieldCheck size={10} />
                            {user.googleId ? "Google Account" : "Direct Account"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-bold whitespace-nowrap">
                          <Phone size={12} className="text-primary" />
                          {user.phone || "Not provided"}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60 font-medium truncate">
                          <Mail size={12} />
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-black transition-all bg-primary/5 px-4 py-2 rounded-full border border-primary/10 hover:border-primary/30 whitespace-nowrap"
                      >
                        <Info size={14} strokeWidth={3} />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">Info</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="bg-white w-full max-w-lg rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden luxury-shadow border border-border/40 animate-zoom-in max-h-[95vh] overflow-y-auto no-scrollbar">
            <div className="relative p-6 sm:p-10">
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-6 sm:top-8 right-6 sm:right-8 p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center mb-8 sm:mb-10 text-center">
                <div className="w-16 h-16 sm:w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl sm:text-2xl font-black mb-4 luxury-shadow">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl sm:text-2xl font-heading font-black tracking-tighter truncate w-full px-4">{selectedUser.name}</h2>
                <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Active User</span>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-secondary/30 rounded-xl sm:rounded-2xl border border-border/10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 md:mb-2">Security</p>
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                      <ShieldCheck size={16} className="text-primary" />
                      {selectedUser.role.toUpperCase()}
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 bg-secondary/30 rounded-xl sm:rounded-2xl border border-border/10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 md:mb-2">Joined</p>
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                      <Calendar size={16} className="text-primary" />
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 bg-secondary/30 rounded-xl sm:rounded-2xl border border-border/10 space-y-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Contact Info</p>
                    <div className="space-y-2">
                       <div className="flex items-center gap-3 text-sm font-bold truncate">
                        <Mail size={16} className="text-primary shrink-0" />
                        <span className="truncate">{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold">
                        <Phone size={16} className="text-primary shrink-0" />
                        {selectedUser.phone || "No registry found"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Address</p>
                    <div className="flex gap-3 text-sm font-bold items-start">
                      <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                      <span className="leading-tight">{selectedUser.address || "No address on file"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button className="flex-1 h-12 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black/90 transition-colors">
                  Update Details
                </button>
                <button className="flex-1 h-12 bg-white text-destructive border border-destructive/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-destructive/5 transition-colors">
                  Suspend Account
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
