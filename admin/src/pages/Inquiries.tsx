import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { Mail, Calendar, MessageSquare, Trash2, CheckCircle2, Clock, X, Info, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'resolved';
  createdAt: string;
}

export default function Inquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await api.get("/inquiries");
      setInquiries(response.data.data.inquiries);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      setInquiries(inquiries.filter(i => i._id !== id));
      toast.success("Message deleted successfully");
    } catch (error) {
      toast.error("Failed to delete message");
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
          <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tighter mb-1 uppercase">Customer Messages</h1>
          <p className="text-muted-foreground text-sm font-medium italic">Monitor and respond to your customer questions.</p>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-border/40 luxury-shadow overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/30">
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">Customer</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">Subject</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">Status</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">Received Date</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-muted-foreground italic font-medium">No messages found in the database.</p>
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr key={inquiry._id} className="group hover:bg-secondary/10 transition-colors">
                    <td className="px-6 md:px-8 py-5 md:py-6 whitespace-nowrap">
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-black text-foreground">{inquiry.name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold truncate max-w-[150px]">{inquiry.email}</p>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <p className="text-xs font-bold text-foreground max-w-[200px] truncate">{inquiry.subject}</p>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit border whitespace-nowrap ${
                        inquiry.status === 'resolved' 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {inquiry.status === 'resolved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        <span className="text-[9px] font-black uppercase tracking-widest">{inquiry.status}</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-muted-foreground text-[10px] font-bold whitespace-nowrap">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <div className="flex justify-end gap-2 md:gap-3 whitespace-nowrap">
                        <button 
                          onClick={() => setSelectedInquiry(inquiry)}
                          className="p-2 hover:bg-primary/5 text-primary rounded-lg transition-colors"
                        >
                          <Info size={18} />
                        </button>
                        <button 
                          onClick={() => deleteInquiry(inquiry._id)}
                          className="p-2 hover:bg-destructive/5 text-destructive rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="bg-white w-full max-w-xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden luxury-shadow border border-border/40 animate-zoom-in max-h-[95vh] overflow-y-auto no-scrollbar">
            <div className="relative p-6 sm:p-10">
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="absolute top-6 sm:top-8 right-6 sm:right-8 p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-6 md:mb-8">
                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                  <MessageSquare size={14} />
                  Message Details
                </div>
                <h2 className="text-xl md:text-3xl font-heading font-black tracking-tighter leading-tight">{selectedInquiry.subject}</h2>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-secondary/30 rounded-xl md:rounded-2xl border border-border/10">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-base md:text-lg font-black shrink-0">
                    {selectedInquiry.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-foreground truncate">{selectedInquiry.name}</p>
                    <p className="text-xs text-muted-foreground font-bold truncate">{selectedInquiry.email}</p>
                  </div>
                </div>

                <div className="p-5 md:p-6 bg-secondary/20 rounded-xl md:rounded-2xl min-h-[120px] md:min-h-[150px]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">Message Content</p>
                  <p className="text-sm text-foreground leading-relaxed font-medium">
                    {selectedInquiry.message}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-[10px] font-bold text-muted-foreground px-1">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="uppercase tracking-widest opacity-60">
                    Ref: #{selectedInquiry._id.slice(-6)}
                  </div>
                </div>
              </div>

              <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 md:gap-4">
                <button className="flex-1 h-12 md:h-14 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black/90 transition-colors">
                  Mark as Solved
                </button>
                <button className="h-12 md:h-14 px-5 md:px-6 bg-secondary text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary/80 transition-colors">
                  Reply via Email
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
