import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { Plus, Trash2, Loader2, X, Send, Pencil, Scale, IndianRupee } from "lucide-react";
import { toast } from "sonner";

interface ShippingRange {
  _id: string;
  minWeight: number; // in grams
  maxWeight: number; // in grams
  cost: number;
}

export default function ShippingCosts() {
  const [ranges, setRanges] = useState<ShippingRange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newRange, setNewRange] = useState({
    minWeight: 0,
    maxWeight: 0,
    cost: 0
  });

  useEffect(() => {
    fetchRanges();
  }, []);

  const fetchRanges = async () => {
    try {
      const response = await api.get("/shipping/ranges");
      setRanges(response.data.data.ranges);
    } catch (error) {
      console.error("Failed to fetch shipping ranges", error);
      toast.error("Failed to load shipping costs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newRange.minWeight >= newRange.maxWeight) {
      return toast.error("Minimum weight must be less than maximum weight.");
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/shipping/ranges/${editingId}`, newRange);
        toast.success("Shipping range updated successfully");
      } else {
        await api.post("/shipping/ranges", newRange);
        toast.success("Shipping range created successfully");
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchRanges();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (range: ShippingRange) => {
    setEditingId(range._id);
    setNewRange({
      minWeight: range.minWeight,
      maxWeight: range.maxWeight,
      cost: range.cost
    });
    setIsModalOpen(true);
  };

  const deleteRange = async (id: string) => {
    if (!window.confirm("Delete this weight range?")) return;
    try {
      await api.delete(`/shipping/ranges/${id}`);
      setRanges(ranges.filter(r => r._id !== id));
      toast.success("Shipping range deleted");
    } catch (error) {
      toast.error("Failed to delete shipping range");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNewRange({
      minWeight: 0,
      maxWeight: 0,
      cost: 0
    });
  };

  const formatWeightLabel = (grams: number) => {
    if (grams >= 1000) {
      return `${grams / 1000} kg (${grams}g)`;
    }
    return `${grams} g`;
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
          <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tighter mb-1 uppercase">Shipping Costs</h1>
          <p className="text-muted-foreground text-sm font-medium italic">Define custom shipping ranges based on total package weight.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="h-10 md:h-12 px-5 md:px-6 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all font-heading"
        >
          <Plus size={16} />
          Add Weight Range
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-border/40 luxury-shadow overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/30">
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Weight Interval</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Minimum Weight</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Maximum Weight</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Shipping Cost</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {ranges.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground italic font-medium">
                    No custom shipping ranges configured. Flat free shipping (₹0) will apply.
                  </td>
                </tr>
              ) : (
                ranges.map((range) => (
                  <tr key={range._id} className="group hover:bg-secondary/10 transition-colors">
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Scale size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground mb-0.5">
                            {range.minWeight}g to {range.maxWeight}g
                          </p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase">
                            Interval Range
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <span className="text-sm font-bold text-foreground">
                        {formatWeightLabel(range.minWeight)}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <span className="text-sm font-bold text-foreground">
                        {formatWeightLabel(range.maxWeight)}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <span className="text-sm font-black text-primary">
                        ₹{range.cost.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                       <div className="flex justify-end gap-2">
                         <button 
                          onClick={() => handleEdit(range)}
                          className="p-2 hover:bg-primary/5 text-primary rounded-lg transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => deleteRange(range._id)}
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

      {/* Range Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="bg-white w-full max-w-lg rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/40 animate-zoom-in">
            <div className="p-6 sm:p-10 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl sm:text-2xl font-heading font-black tracking-tighter uppercase">
                  {editingId ? "Edit Range" : "New Range"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Min Weight (g)</label>
                    <div className="relative">
                      <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                      <input
                        type="number"
                        required
                        min="0"
                        value={newRange.minWeight}
                        onChange={(e) => setNewRange({ ...newRange, minWeight: Number(e.target.value) })}
                        className="w-full h-12 sm:h-14 pl-12 pr-4 bg-secondary/30 border-none rounded-xl sm:rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Max Weight (g)</label>
                    <div className="relative">
                      <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                      <input
                        type="number"
                        required
                        min="0"
                        value={newRange.maxWeight}
                        onChange={(e) => setNewRange({ ...newRange, maxWeight: Number(e.target.value) })}
                        className="w-full h-12 sm:h-14 pl-12 pr-4 bg-secondary/30 border-none rounded-xl sm:rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Shipping Cost (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                    <input
                      type="number"
                      required
                      min="0"
                      value={newRange.cost}
                      onChange={(e) => setNewRange({ ...newRange, cost: Number(e.target.value) })}
                      className="w-full h-12 sm:h-14 pl-12 pr-4 bg-secondary/30 border-none rounded-xl sm:rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="bg-secondary/20 p-4 rounded-xl text-[11px] font-bold text-muted-foreground leading-relaxed flex flex-col gap-1">
                  <span>💡 Weight conversions:</span>
                  <span>• {newRange.minWeight} g = {(newRange.minWeight / 1000).toFixed(3)} kg</span>
                  <span>• {newRange.maxWeight} g = {(newRange.maxWeight / 1000).toFixed(3)} kg</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 sm:h-16 bg-primary text-white font-black uppercase tracking-widest text-[11px] sm:text-[13px] rounded-xl sm:rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 font-heading shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  {editingId ? "Update Range" : "Create Range"}
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
