import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { Plus, Trash2, Tag, Loader2, X, Send, Image as ImageIcon, Pencil } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/common/ImageUpload";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  ranking: number;
  createdAt: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newCategory, setNewCategory] = useState({ 
    name: "", 
    description: "", 
    image: ""
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const slug = newCategory.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
      
      const payload = { 
        ...newCategory, 
        slug 
      };

      if (editingId) {
        await api.patch(`/categories/${editingId}`, payload);
        toast.success("Category Updated");
      } else {
        await api.post("/categories", payload);
        toast.success("Category Added to List");
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category._id);
    setNewCategory({
      name: category.name,
      description: category.description || "",
      image: category.image || ""
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setNewCategory({ name: "", description: "", image: "" });
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c._id !== id));
      toast.success("Category Deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete category");
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
    <div className="space-y-6 md:space-y-10 animate-fade-in py-2 md:py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border/20 pb-6 md:pb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tighter mb-2 md:mb-4 uppercase">Product Categories</h1>
          <p className="text-muted-foreground font-medium italic text-sm md:text-lg leading-tight md:leading-none">Manage the different groupings of your products.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="h-12 md:h-14 px-5 md:px-8 bg-black text-white rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-primary transition-all luxury-shadow w-full md:w-auto justify-center"
        >
          <Plus size={18} />
          Add New Category
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-border/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/30">
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Category</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Description</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Slug</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-muted-foreground italic font-medium">No categories found in the database.</p>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className="group hover:bg-secondary/10 transition-colors">
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-primary/5 flex items-center justify-center text-primary/40 border border-primary/10 overflow-hidden shrink-0">
                          {category.image ? (
                            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={18} />
                          )}
                        </div>
                        <p className="text-sm font-black text-foreground uppercase tracking-tight truncate">{category.name}</p>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <p className="text-xs text-muted-foreground font-semibold italic line-clamp-1 max-w-[200px] md:max-w-xs transition-all">
                        {category.description || "No narrative provided."}
                      </p>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 md:px-3 py-1 rounded-full border border-primary/10 whitespace-nowrap">
                        {category.slug}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button 
                          onClick={() => handleEdit(category)}
                          className="p-2 md:p-2.5 hover:bg-primary/5 text-primary rounded-lg md:rounded-xl transition-all"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => deleteCategory(category._id)}
                          className="p-2 md:p-2.5 hover:bg-destructive/5 text-destructive rounded-lg md:rounded-xl transition-all"
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

      {/* Append/Edit Collective Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="bg-white w-full max-w-2xl rounded-[1.5rem] md:rounded-[3rem] overflow-hidden luxury-shadow border border-white/20 animate-zoom-in">
            <div className="flex flex-col md:flex-row">
               <div className="flex-1 p-6 md:p-10 lg:p-14 max-h-[90vh] overflow-y-auto no-scrollbar">
                  <div className="flex justify-between items-center mb-6 md:mb-10">
                    <h2 className="text-2xl md:text-3xl font-heading font-black tracking-tighter uppercase">{editingId ? "Edit Category" : "Add New Category"}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 md:p-3 hover:bg-secondary rounded-full transition-all">
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleCreate} className="space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 gap-6 md:gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category Name</label>
                          <input
                            type="text"
                            required
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            className="w-full h-12 md:h-14 px-5 md:px-6 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="Home Decor"
                          />
                        </div>

                        <ImageUpload 
                          label="Category Image"
                          value={newCategory.image}
                          onChange={(url) => setNewCategory({ ...newCategory, image: url })}
                        />
                     </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category Description</label>
                      <textarea
                        rows={3}
                        required
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        className="w-full p-5 md:p-6 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none resize-none italic text-sm md:text-base"
                        placeholder="Context for this collection..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 md:h-16 bg-black text-white font-black uppercase tracking-widest text-[11px] md:text-[13px] rounded-xl md:rounded-2xl hover:bg-primary transition-all flex items-center justify-center gap-3 mt-2 md:mt-4 luxury-shadow disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      {editingId ? "Update Category" : "Save Category"}
                    </button>
                  </form>
               </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
