import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { Plus, Trash2, Loader2, X, Send, Image as ImageIcon, Pencil, Globe, ArrowRight, Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/common/ImageUpload";

interface Slider {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  mobileImage?: string;
  ctaText: string;
  ctaLink: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function Sliders() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newSlider, setNewSlider] = useState({ 
    title: "", 
    subtitle: "", 
    image: "",
    mobileImage: "",
    ctaText: "Explore Collections",
    ctaLink: "/shop",
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const response = await api.get("/sliders");
      setSliders(response.data.data.sliders.sort((a: Slider, b: Slider) => a.order - b.order));
    } catch (error) {
      console.error("Failed to fetch hero sliders", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/sliders/${editingId}`, newSlider);
        toast.success("Slider Updated");
      } else {
        await api.post("/sliders", newSlider);
        toast.success("Slider Added to List");
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchSliders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save slider");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (slider: Slider) => {
    setEditingId(slider._id);
    setNewSlider({
      title: slider.title,
      subtitle: slider.subtitle,
      image: slider.image,
      mobileImage: slider.mobileImage || "",
      ctaText: slider.ctaText,
      ctaLink: slider.ctaLink,
      order: slider.order,
      isActive: slider.isActive
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setNewSlider({ 
        title: "", 
        subtitle: "", 
        image: "",
        mobileImage: "",
        ctaText: "Explore Collections",
        ctaLink: "/shop",
        order: sliders.length,
        isActive: true
    });
  };

  const deleteSlider = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this slider?")) return;
    try {
      await api.delete(`/sliders/${id}`);
      setSliders(sliders.filter(s => s._id !== id));
      toast.success("Slider Deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete slider");
    }
  };

  const toggleStatus = async (slider: Slider) => {
    try {
      await api.patch(`/sliders/${slider._id}`, { isActive: !slider.isActive });
      setSliders(sliders.map(s => s._id === slider._id ? { ...s, isActive: !slider.isActive } : s));
      toast.success(slider.isActive ? "Slider Hidden" : "Slider Activated");
    } catch (error) {
      toast.error("Status update failed");
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
          <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tighter mb-2 md:mb-4 uppercase">Home Sliders</h1>
          <p className="text-muted-foreground font-medium italic text-sm md:text-lg leading-tight md:leading-none">Manage the images and banners on your homepage.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="h-12 md:h-14 px-5 md:px-8 bg-black text-white rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-primary transition-all luxury-shadow w-full md:w-auto justify-center shrink-0"
        >
          <Plus size={18} />
          Add New Slide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {sliders.length === 0 ? (
          <div className="md:col-span-2 p-10 md:p-20 bg-white rounded-2xl md:rounded-[3rem] border border-dashed border-border flex flex-col items-center">
             <ImageIcon size={48} className="text-muted-foreground/20 mb-4" />
             <p className="text-muted-foreground italic font-medium">No sliders found in the database.</p>
          </div>
        ) : (
          sliders.map((slider) => (
            <div key={slider._id} className="group bg-white rounded-2xl md:rounded-[3rem] overflow-hidden luxury-shadow border border-border/20 flex flex-col h-full transition-transform duration-300 hover:scale-[1.01]">
               <div className="relative h-48 md:h-64 overflow-hidden">
                  <img 
                    src={slider.image} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/800x400?text=${encodeURIComponent(slider.title)}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute top-4 left-6 flex items-center gap-2">
                     <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-widest">{slider.isActive ? 'Active' : 'Hidden'}</span>
                  </div>
                  <div className="absolute bottom-4 left-6 right-6 md:bottom-6 md:left-8 md:right-8">
                     <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">Slide {slider.order + 1}</p>
                     <h3 className="text-xl md:text-2xl font-heading font-black text-white uppercase tracking-tight line-clamp-1">{slider.title}</h3>
                  </div>
                  <div className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-2">
                     <button 
                        onClick={() => handleEdit(slider)}
                        className="w-8 h-8 md:w-10 md:h-10 bg-white/10 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                     >
                        <Pencil size={18} />
                     </button>
                     <button 
                         onClick={() => deleteSlider(slider._id)}
                         className="w-8 h-8 md:w-10 md:h-10 bg-destructive/10 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center text-destructive-foreground hover:bg-destructive hover:text-white transition-all"
                     >
                        <Trash2 size={18} />
                     </button>
                  </div>
               </div>
               
               <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <p className="text-xs md:text-sm text-muted-foreground font-medium italic mb-6 line-clamp-2">"{slider.subtitle}"</p>
                  
                  <div className="mt-auto pt-4 md:pt-6 border-t border-border/10 flex items-center justify-between">
                     <div className="flex items-center gap-2 md:gap-3">
                        <div className="h-8 md:h-10 px-3 md:px-4 bg-secondary/50 rounded-full flex items-center border border-border/20 max-w-[120px] md:max-w-none">
                           <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate">{slider.ctaText}</span>
                        </div>
                        {slider.mobileImage && (
                            <div className="h-8 w-8 md:h-10 md:w-10 bg-primary/5 text-primary rounded-full flex items-center justify-center border border-primary/10 shrink-0" title="Has Mobile Image">
                                <Smartphone size={14} />
                            </div>
                        )}
                     </div>
                     <button 
                        onClick={() => toggleStatus(slider)}
                        className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border transition-all ${slider.isActive ? 'border-green-500/20 text-green-600 bg-green-50' : 'border-red-500/20 text-red-600 bg-red-50'}`}
                     >
                        {slider.isActive ? 'Live' : 'Hidden'}
                     </button>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="bg-white w-full max-w-4xl rounded-[1.5rem] md:rounded-[3rem] overflow-hidden luxury-shadow border border-white/20 animate-zoom-in flex flex-col max-h-[95vh] md:max-h-[90vh]">
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-14">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl md:text-3xl font-heading font-black tracking-tighter uppercase">{editingId ? "Edit Slider" : "Add New Slide"}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-secondary rounded-full transition-all">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-6 md:space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Main Heading</label>
                        <input type="text" required value={newSlider.title} onChange={(e) => setNewSlider({ ...newSlider, title: e.target.value })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold" placeholder="Premium Artisanal Bags" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Display Priority (Order)</label>
                        <input type="number" required value={newSlider.order} onChange={(e) => setNewSlider({ ...newSlider, order: parseInt(e.target.value) })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold" />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <ImageUpload 
                        label="Desktop Image (16:9)"
                        value={newSlider.image}
                        onChange={(url) => setNewSlider({ ...newSlider, image: url })}
                    />
                    <ImageUpload 
                        label="Mobile Image (Optional - 4:5)"
                        value={newSlider.mobileImage}
                        onChange={(url) => setNewSlider({ ...newSlider, mobileImage: url })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                    <textarea rows={2} required value={newSlider.subtitle} onChange={(e) => setNewSlider({ ...newSlider, subtitle: e.target.value })} className="w-full p-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold resize-none italic" placeholder="Context for this slide..." />
                  </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Button Text</label>
                        <input type="text" required value={newSlider.ctaText} onChange={(e) => setNewSlider({ ...newSlider, ctaText: e.target.value })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold" placeholder="Explore Now" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Button Redirect Link</label>
                        <input type="text" required value={newSlider.ctaLink} onChange={(e) => setNewSlider({ ...newSlider, ctaLink: e.target.value })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold" placeholder="/shop" />
                      </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-2xl">
                     <input type="checkbox" id="isActive" checked={newSlider.isActive} onChange={(e) => setNewSlider({ ...newSlider, isActive: e.target.checked })} className="w-5 h-5 accent-primary" />
                     <label htmlFor="isActive" className="text-[11px] font-black uppercase tracking-widest cursor-pointer">Published & Visible on Homepage</label>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full h-14 md:h-20 bg-black text-white font-black uppercase tracking-widest text-[11px] md:text-[13px] rounded-xl md:rounded-[1.5rem] hover:bg-primary transition-all flex items-center justify-center gap-3 mt-4 luxury-shadow disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    {editingId ? "Update Slide" : "Save Slide"}
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
