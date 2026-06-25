import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { Plus, Trash2, Loader2, X, Send, User, Pencil, Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/common/ImageUpload";

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  rating: number;
  content: string;
  avatar?: string;
  featured: boolean;
  order: number;
  createdAt: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    role: "Verified Buyer",
    rating: 5,
    content: "",
    avatar: "",
    featured: true,
    order: 0
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await api.get("/testimonials");
      setTestimonials(response.data.data.testimonials.sort((a: Testimonial, b: Testimonial) => a.order - b.order));
    } catch (error) {
      console.error("Failed to fetch testimonials", error);
      toast.error("Failed to load testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/testimonials/${editingId}`, newTestimonial);
        toast.success("Testimonial Updated");
      } else {
        await api.post("/testimonials", newTestimonial);
        toast.success("Testimonial Added");
      }

      setIsModalOpen(false);
      resetForm();
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save testimonial");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (t: Testimonial) => {
    setEditingId(t._id);
    setNewTestimonial({
      name: t.name,
      role: t.role,
      rating: t.rating,
      content: t.content,
      avatar: t.avatar || "",
      featured: t.featured,
      order: t.order
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setNewTestimonial({
      name: "",
      role: "Verified Buyer",
      rating: 5,
      content: "",
      avatar: "",
      featured: true,
      order: testimonials.length
    });
  };

  const deleteTestimonial = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await api.delete(`/testimonials/${id}`);
      setTestimonials(testimonials.filter(t => t._id !== id));
      toast.success("Testimonial Deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete testimonial");
    }
  };

  const toggleFeatured = async (t: Testimonial) => {
    try {
      await api.patch(`/testimonials/${t._id}`, { featured: !t.featured });
      setTestimonials(testimonials.map(item => item._id === t._id ? { ...item, featured: !t.featured } : item));
      toast.success(t.featured ? "Removed from Featured" : "Added to Featured");
    } catch (error) {
      toast.error("Failed to update status");
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
    <div className="space-y-6 md:space-y-10 animate-fade-in py-2 md:py-6 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border/20 pb-6 md:pb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tighter mb-2 md:mb-4 uppercase">Customer Reviews</h1>
          <p className="text-muted-foreground font-medium italic text-sm md:text-lg leading-tight md:leading-none">Manage testimonials and reviews displayed on the homepage.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="h-12 md:h-14 px-5 md:px-8 bg-black text-white rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-primary transition-all luxury-shadow w-full md:w-auto justify-center shrink-0"
        >
          <Plus size={18} />
          Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {testimonials.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 p-10 md:p-20 bg-white rounded-2xl md:rounded-[3rem] border border-dashed border-border flex flex-col items-center">
             <MessageSquare size={48} className="text-muted-foreground/20 mb-4" />
             <p className="text-muted-foreground italic font-medium">No testimonials found. Fallback data will be displayed on the homepage.</p>
          </div>
        ) : (
          testimonials.map((t) => (
            <div key={t._id} className="group bg-white rounded-2xl md:rounded-[2.5rem] overflow-hidden luxury-shadow border border-border/20 flex flex-col h-full transition-transform duration-300 hover:scale-[1.01] p-6 md:p-8">
               <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                     {t.avatar ? (
                        <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-border shrink-0" />
                     ) : (
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-black text-xs text-primary shrink-0">
                           {t.name.charAt(0)}
                        </div>
                     )}
                     <div>
                        <h3 className="text-sm font-black uppercase tracking-wider line-clamp-1">{t.name}</h3>
                        <p className="text-[10px] text-muted-foreground font-semibold italic">{t.role}</p>
                     </div>
                  </div>
                  
                  <div className="flex gap-1">
                     <button
                        onClick={() => handleEdit(t)}
                        className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-foreground hover:bg-black hover:text-white transition-all"
                     >
                        <Pencil size={14} />
                     </button>
                     <button
                         onClick={() => deleteTestimonial(t._id)}
                         className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive hover:text-white transition-all"
                     >
                        <Trash2 size={14} />
                     </button>
                  </div>
               </div>

               <div className="mt-4 flex gap-0.5 text-amber-500">
                  {[...Array(t.rating)].map((_, s) => <Star key={s} size={14} fill="currentColor" />)}
               </div>

               <p className="mt-4 text-xs md:text-sm text-muted-foreground font-medium italic flex-1 leading-relaxed">
                  "{t.content}"
               </p>

               <div className="mt-6 pt-4 border-t border-border/10 flex justify-between items-center">
                  <span className="admin-number text-[9px] font-black uppercase text-muted-foreground/60">Priority: {t.order}</span>
                  <button 
                     onClick={() => toggleFeatured(t)}
                     className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border transition-all ${t.featured ? 'border-primary/20 text-primary bg-primary/5' : 'border-border text-muted-foreground bg-transparent'}`}
                  >
                     {t.featured ? 'Featured' : 'Draft'}
                  </button>
               </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="bg-white w-full max-w-2xl rounded-[1.5rem] md:rounded-[3rem] overflow-hidden luxury-shadow border border-white/20 animate-zoom-in flex flex-col max-h-[90vh]">
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-14">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl md:text-3xl font-heading font-black tracking-tighter uppercase">{editingId ? "Edit Review" : "Add Testimonial"}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-secondary rounded-full transition-all">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Customer Name</label>
                        <input type="text" required value={newTestimonial.name} onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold" placeholder="E.g. Sanya Kapoor" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subtitle / Role</label>
                        <input type="text" required value={newTestimonial.role} onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold" placeholder="E.g. Verified Buyer" />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rating Stars</label>
                        <select value={newTestimonial.rating} onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold">
                           <option value={5}>5 Stars</option>
                           <option value={4}>4 Stars</option>
                           <option value={3}>3 Stars</option>
                           <option value={2}>2 Stars</option>
                           <option value={1}>1 Star</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Display Priority Order</label>
                        <input type="number" required value={newTestimonial.order} onChange={(e) => setNewTestimonial({ ...newTestimonial, order: parseInt(e.target.value) })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold" />
                      </div>
                  </div>

                  <ImageUpload 
                      label="Customer Avatar (Optional)"
                      value={newTestimonial.avatar}
                      onChange={(url) => setNewTestimonial({ ...newTestimonial, avatar: url })}
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Testimonial Content</label>
                    <textarea rows={4} required value={newTestimonial.content} onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })} className="w-full p-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold resize-none italic" placeholder="Write testimonial content here..." />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-2xl">
                     <input type="checkbox" id="featured" checked={newTestimonial.featured} onChange={(e) => setNewTestimonial({ ...newTestimonial, featured: e.target.checked })} className="w-5 h-5 accent-primary" />
                     <label htmlFor="featured" className="text-[11px] font-black uppercase tracking-widest cursor-pointer">Featured (Visible on Homepage)</label>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full h-14 md:h-18 bg-black text-white font-black uppercase tracking-widest text-[11px] md:text-[12px] rounded-xl md:rounded-2xl hover:bg-primary transition-all flex items-center justify-center gap-3 mt-4 luxury-shadow disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    {editingId ? "Update Review" : "Save Testimonial"}
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
