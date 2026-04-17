import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { Plus, Trash2, Ticket, Search, Loader2, X, Send, Calendar, Percent, IndianRupee, Pencil } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase: number;
  expiryDate: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
}

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    minPurchase: 0,
    expiryDate: "",
    usageLimit: "" as any,
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await api.get("/coupons");
      setCoupons(response.data.data.coupons);
    } catch (error) {
      console.error("Failed to fetch coupons", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...newCoupon,
        usageLimit: newCoupon.usageLimit === "" ? null : Number(newCoupon.usageLimit)
      };

      if (editingId) {
        await api.patch(`/coupons/${editingId}`, payload);
        toast.success("Coupon updated successfully");
      } else {
        await api.post("/coupons", payload);
        toast.success("Coupon created successfully");
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon._id);
    setNewCoupon({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase,
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || "",
      isActive: coupon.isActive
    });
    setIsModalOpen(true);
  };

  const deleteCoupon = async (id: string) => {
    if (!window.confirm("Delete this coupon code?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      setCoupons(coupons.filter(c => c._id !== id));
      toast.success("Coupon deleted");
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNewCoupon({
      code: "",
      discountType: "percentage",
      discountValue: 0,
      minPurchase: 0,
      expiryDate: "",
      usageLimit: "",
      isActive: true
    });
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
          <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tighter mb-1 uppercase">Coupons</h1>
          <p className="text-muted-foreground text-sm font-medium italic">Create and manage discount codes for your customers.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="h-10 md:h-12 px-5 md:px-6 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all font-heading"
        >
          <Plus size={16} />
          Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-border/40 luxury-shadow overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/30">
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Coupon Details</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Discount</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Condition</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Expiry</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground italic font-medium">
                    No active coupons found.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon._id} className="group hover:bg-secondary/10 transition-colors">
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Ticket size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground mb-0.5">{coupon.code}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">Used: {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "times"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-foreground">
                          {coupon.discountValue}{coupon.discountType === "percentage" ? "%" : " ₹"}
                        </span>
                        <span className="text-[9px] font-black uppercase text-muted-foreground/60">{coupon.discountType} discount</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <p className="text-xs font-bold text-foreground">Min. Purchase: ₹{coupon.minPurchase}</p>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-[11px] font-bold text-muted-foreground">
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                       <div className="flex justify-end gap-2">
                         <button 
                          onClick={() => handleEdit(coupon)}
                          className="p-2 hover:bg-primary/5 text-primary rounded-lg transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => deleteCoupon(coupon._id)}
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

      {/* Coupon Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="bg-white w-full max-w-xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/40 animate-zoom-in">
            <div className="p-6 sm:p-10 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl sm:text-2xl font-heading font-black tracking-tighter uppercase">{editingId ? "Edit Coupon" : "New Coupon"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                    className="w-full h-12 sm:h-14 px-5 sm:px-6 bg-secondary/30 border-none rounded-xl sm:rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none uppercase"
                    placeholder="e.g. WELCOME50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Discount Type</label>
                    <select
                      value={newCoupon.discountType}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as any })}
                      className="w-full h-12 sm:h-14 px-4 bg-secondary/30 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Value</label>
                    <div className="relative">
                      {newCoupon.discountType === 'percentage' ? <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} /> : <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />}
                      <input
                        type="number"
                        required
                        value={newCoupon.discountValue}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                        className="w-full h-12 sm:h-14 pl-12 pr-6 bg-secondary/30 border-none rounded-xl sm:rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Min Purchase (₹)</label>
                    <input
                      type="number"
                      value={newCoupon.minPurchase}
                      onChange={(e) => setNewCoupon({ ...newCoupon, minPurchase: Number(e.target.value) })}
                      className="w-full h-12 sm:h-14 px-5 bg-secondary/30 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={newCoupon.expiryDate}
                      onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                      className="w-full h-12 sm:h-14 px-5 bg-secondary/30 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Usage Limit (Optional)</label>
                  <input
                    type="number"
                    value={newCoupon.usageLimit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                    className="w-full h-12 sm:h-14 px-5 bg-secondary/30 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Unlimited if empty"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 sm:h-16 bg-primary text-white font-black uppercase tracking-widest text-[11px] sm:text-[13px] rounded-xl sm:rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 font-heading shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  {editingId ? "Update Coupon" : "Create Coupon"}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
