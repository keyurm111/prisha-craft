import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { Plus, Trash2, Package, Loader2, X, Send, Image as ImageIcon, Pencil } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/common/ImageUpload";

interface Product {
  _id: string;
  name: string;
  sku: string;
  slug: string;
  price: number;
  mrp: number;
  category: { _id: string; name: string };
  stock: number;
  mainImage?: string;
  images?: string[];
  highlights?: string[];
  video?: string;
  shippingDimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  description: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    description: "",
    price: 0,
    mrp: 0,
    category: "",
    stock: 0,
    mainImage: "",
    images: [] as string[],
    highlights: [] as string[],
    video: "",
    length: 0,
    width: 0,
    height: 0,
    weight: 0
  });

  const [imageUrlInput, setImageUrlInput] = useState("");
  const [highlightInput, setHighlightInput] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories")
      ]);
      setProducts(pRes.data.data.products);
      setCategories(cRes.data.data.categories);
    } catch (error) {
      console.error("Failed to fetch product data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...newProduct,
        slug: newProduct.name.toLowerCase().replace(/ /g, "-"),
        shippingDimensions: {
          length: newProduct.length,
          width: newProduct.width,
          height: newProduct.height,
          weight: newProduct.weight
        }
      };

      if (editingId) {
        await api.patch(`/products/${editingId}`, payload);
        toast.success("Product updated successfully");
      } else {
        await api.post("/products", payload);
        toast.success("Product added successfully");
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setNewProduct({
      name: product.name,
      sku: product.sku || "",
      description: product.description || "",
      price: product.price,
      mrp: product.mrp,
      category: typeof product.category === 'object' ? product.category._id : product.category,
      stock: product.stock,
      mainImage: product.mainImage || "",
      images: product.images || [],
      highlights: product.highlights || [],
      video: product.video || "",
      length: product.shippingDimensions?.length || 0,
      width: product.shippingDimensions?.width || 0,
      height: product.shippingDimensions?.height || 0,
      weight: product.shippingDimensions?.weight || 0
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setNewProduct({
      name: "",
      sku: "",
      description: "",
      price: 0,
      mrp: 0,
      category: "",
      stock: 0,
      mainImage: "",
      images: [],
      highlights: [],
      video: "",
      length: 0,
      width: 0,
      height: 0,
      weight: 0
    });
    setImageUrlInput("");
    setHighlightInput("");
  };

  const addItem = (field: 'images' | 'highlights', value: string) => {
    if (!value.trim()) return;
    setNewProduct({
      ...newProduct,
      [field]: [...newProduct[field], value.trim()]
    });
    if (field === 'images') setImageUrlInput("");
    else setHighlightInput("");
  };

  const removeItem = (field: 'images' | 'highlights', index: number) => {
    setNewProduct({
      ...newProduct,
      [field]: newProduct[field].filter((_, i) => i !== index)
    });
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      toast.success("Product deleted");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      try {
          const res = await api.post('/uploads/image', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          addItem('images', res.data.url);
          toast.success("Gallery image added");
      } catch (error: any) {
          toast.error("Upload failed");
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
          <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tighter mb-2 md:mb-4 uppercase">Products</h1>
          <p className="text-muted-foreground font-medium italic text-sm md:text-lg leading-tight md:leading-none">Manage your e-commerce product catalog.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="h-12 md:h-14 px-5 md:px-8 bg-black text-white rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-primary transition-all luxury-shadow w-full md:w-auto justify-center"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-border/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/30">
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Product</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Category</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Price</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {products.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-muted-foreground italic font-medium text-sm">No products found.</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="group hover:bg-secondary/10 transition-colors">
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary/40 border border-primary/10 overflow-hidden shrink-0">
                          {product.mainImage ? <img src={product.mainImage} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-foreground uppercase tracking-tight truncate">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 md:px-3 py-1 rounded-full border border-primary/10 whitespace-nowrap">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-sm font-black">
                      ₹{product.price.toLocaleString()}
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button onClick={() => handleEdit(product)} className="p-2.5 hover:bg-primary/5 text-primary rounded-xl"><Pencil size={18} /></button>
                         <button onClick={() => deleteProduct(product._id)} className="p-2.5 hover:bg-destructive/5 text-destructive rounded-xl"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="bg-white w-full max-w-2xl rounded-[1.5rem] md:rounded-[3rem] overflow-hidden luxury-shadow border border-white/20 animate-zoom-in">
            <div className="p-6 md:p-14 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl md:text-3xl font-heading font-black tracking-tighter uppercase">{editingId ? "Edit Product" : "Add Product"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-all"><X size={24} /></button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product Name</label>
                    <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">SKU</label>
                    <input type="text" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                    <select required value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold appearance-none">
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Stock</label>
                    <input type="number" required value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Base Price (₹)</label>
                    <input type="number" required value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">MRP Price (₹)</label>
                    <input type="number" value={newProduct.mrp} onChange={(e) => setNewProduct({ ...newProduct, mrp: Number(e.target.value) })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold" />
                  </div>
                </div>

                <ImageUpload 
                  label="Master Image"
                  value={newProduct.mainImage}
                  onChange={(url) => setNewProduct({ ...newProduct, mainImage: url })}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Gallery</label>
                    <label className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer hover:bg-primary/20 transition-all">
                        <Plus size={10} className="inline mr-1" />
                        Quick Upload
                        <input type="file" className="hidden" accept="image/*" onChange={handleGalleryUpload} />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} className="flex-1 h-12 px-5 bg-secondary/30 border-none rounded-xl font-bold" placeholder="Paste URL here..." />
                    <button type="button" onClick={() => addItem('images', imageUrlInput)} className="px-6 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Add</button>
                  </div>
                  
                  {newProduct.images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4 bg-secondary/10 rounded-2xl border border-border/10">
                      {newProduct.images.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border/20 group">
                          <img src={url} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeItem('images', idx)} className="absolute inset-0 bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Detailed Description</label>
                  <textarea rows={4} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full p-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold resize-none" placeholder="Enter product specifics..." />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full h-14 md:h-16 bg-black text-white font-black uppercase tracking-widest text-[11px] md:text-[13px] rounded-xl md:rounded-2xl hover:bg-primary transition-all flex items-center justify-center gap-3 luxury-shadow disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  {editingId ? "Update Product" : "Save Product"}
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
