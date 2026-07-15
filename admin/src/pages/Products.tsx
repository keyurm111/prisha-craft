import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { Plus, Trash2, Package, Loader2, X, Send, Image as ImageIcon, Pencil, Upload, ChevronDown, ChevronUp } from "lucide-react";
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
  specifications?: Record<string, string>;
  variants?: Array<{
    _id?: string;
    sku?: string;
    options: Record<string, string>;
    price?: number;
    mrp?: number;
    stock?: number;
    image?: string;
    images?: string[];
    rawImagesInput?: string;
  }>;
  variantOptions?: Array<{
    name: string;
    values: string[];
  }>;
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
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState("");
  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({});
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);
  const [localStocks, setLocalStocks] = useState<Record<string, number>>({});
  
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
    weight: 0,
    specifications: [] as { key: string; value: string }[],
    hasVariants: false,
    variantOptions: [] as Array<{ name: string; values: string[]; rawInput?: string }>,
    variants: [] as Array<{
      sku: string;
      options: Record<string, string>;
      price: number;
      mrp: number;
      stock: number;
      image: string;
      images: string[];
      rawImagesInput?: string;
    }>
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

  const generateCombinations = (optionsList: Array<{ name: string; values: string[] }>) => {
    if (optionsList.length === 0) return [];
    const result: Array<Record<string, string>> = [];
    const helper = (index: number, current: Record<string, string>) => {
      if (index === optionsList.length) {
        result.push({ ...current });
        return;
      }
      const option = optionsList[index];
      if (!option.values || option.values.length === 0) {
        helper(index + 1, current);
        return;
      }
      for (const val of option.values) {
        current[option.name] = val;
        helper(index + 1, current);
      }
    };
    helper(0, {});
    return result;
  };

  const syncCombinations = () => {
    const combinations = generateCombinations(newProduct.variantOptions);
    const newVariants = combinations.map(combo => {
      const existing = newProduct.variants.find(v => {
        return Object.keys(combo).every(key => v.options?.[key] === combo[key]);
      });
      return {
        sku: existing?.sku || "",
        options: combo,
        price: existing?.price || newProduct.price || 0,
        mrp: existing?.mrp || newProduct.mrp || 0,
        stock: existing?.stock || 0,
        image: existing?.image || "",
        images: existing?.images || [],
        rawImagesInput: existing?.rawImagesInput !== undefined ? existing.rawImagesInput : (existing?.images || []).join(", ")
      };
    });
    setNewProduct(prev => ({
      ...prev,
      variants: newVariants
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const specObject = newProduct.specifications.reduce((acc, curr) => {
        if (curr.key.trim()) {
          acc[curr.key.trim()] = curr.value.trim();
        }
        return acc;
      }, {} as Record<string, string>);

      const cleanVariantOptions = newProduct.hasVariants
        ? newProduct.variantOptions.map(opt => ({
            name: opt.name,
            values: opt.values
          }))
        : [];

      const cleanVariants = newProduct.hasVariants
        ? newProduct.variants.map(v => ({
            sku: v.sku,
            options: v.options,
            price: v.price,
            mrp: v.mrp,
            stock: v.stock,
            image: v.image,
            images: v.images
          }))
        : [];

      const payload = {
        ...newProduct,
        specifications: specObject,
        slug: newProduct.name.toLowerCase().replace(/ /g, "-"),
        variantOptions: cleanVariantOptions,
        variants: cleanVariants,
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
    const mappedSpecs = product.specifications
      ? Object.entries(product.specifications).map(([key, value]) => ({ key, value }))
      : [];

    const mappedVariants = product.variants
      ? product.variants.map(v => ({
          sku: v.sku || "",
          options: v.options || {},
          price: v.price || 0,
          mrp: v.mrp || 0,
          stock: v.stock || 0,
          image: v.image || "",
          images: v.images || [],
          rawImagesInput: (v.images || []).join(", ")
        }))
      : [];

    const mappedOptions = product.variantOptions
      ? product.variantOptions.map(opt => ({
          name: opt.name || "",
          values: opt.values || [],
          rawInput: (opt.values || []).join(", ")
        }))
      : [];

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
      weight: product.shippingDimensions?.weight || 0,
      specifications: mappedSpecs,
      hasVariants: product.variants && product.variants.length > 0 ? true : false,
      variantOptions: mappedOptions,
      variants: mappedVariants
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
      weight: 0,
      specifications: [],
      hasVariants: false,
      variantOptions: [],
      variants: []
    });
    setImageUrlInput("");
    setHighlightInput("");
  };

  const openStockModal = () => {
    const initialStocks: Record<string, number> = {};
    products.forEach(p => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v, idx) => {
          initialStocks[`${p._id}-variant-${idx}`] = v.stock || 0;
        });
      } else {
        initialStocks[p._id] = p.stock || 0;
      }
    });
    setLocalStocks(initialStocks);
    setIsStockModalOpen(true);
  };

  const handleUpdateBaseStock = async (productId: string) => {
    const newStock = localStocks[productId];
    if (newStock === undefined || isNaN(newStock) || newStock < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }
    setUpdatingStockId(productId);
    try {
      await api.patch(`/products/${productId}`, { stock: newStock });
      toast.success("Stock updated successfully");
      await fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update stock");
    } finally {
      setUpdatingStockId(null);
    }
  };

  const handleUpdateVariantStock = async (productId: string, variantIndex: number) => {
    const product = products.find(p => p._id === productId);
    if (!product || !product.variants) return;

    const newStock = localStocks[`${productId}-variant-${variantIndex}`];
    if (newStock === undefined || isNaN(newStock) || newStock < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    setUpdatingStockId(`${productId}-variant-${variantIndex}`);
    try {
      const updatedVariants = product.variants.map((v, idx) => {
        if (idx === variantIndex) {
          return {
            ...v,
            stock: newStock
          };
        }
        return v;
      });

      await api.patch(`/products/${productId}`, { variants: updatedVariants });
      toast.success("Variant stock updated successfully");
      await fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update variant stock");
    } finally {
      setUpdatingStockId(null);
    }
  };

  const toggleProductExpand = (productId: string) => {
    setExpandedProductIds(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
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

  const suggestedKeys = Array.from(
    new Set(
      products.flatMap(p => p.specifications ? Object.keys(p.specifications) : [])
    )
  ).sort();

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
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button 
            onClick={openStockModal}
            className="h-12 md:h-14 px-5 md:px-8 bg-secondary border border-border/40 text-foreground rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-secondary/80 transition-all luxury-shadow w-full sm:w-auto justify-center"
          >
            <Package size={18} />
            Check Stock
          </button>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="h-12 md:h-14 px-5 md:px-8 bg-black text-white rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-primary transition-all luxury-shadow w-full sm:w-auto justify-center"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
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
                products.map((product) => {
                  const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
                  const displayPrice = firstVariant && firstVariant.price !== undefined ? firstVariant.price : product.price;
                  const displayImage = firstVariant && firstVariant.image ? firstVariant.image : product.mainImage;

                  return (
                    <tr key={product._id} className="group hover:bg-secondary/10 transition-colors">
                      <td className="px-6 md:px-8 py-5 md:py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary/40 border border-primary/10 overflow-hidden shrink-0">
                            {displayImage ? <img src={displayImage} className="w-full h-full object-cover" /> : <ImageIcon size={20} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-foreground uppercase tracking-tight truncate">{product.name}</p>
                            <p className="admin-number text-[10px] text-muted-foreground font-black uppercase">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-5 md:py-6">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 md:px-3 py-1 rounded-full border border-primary/10 whitespace-nowrap">
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="admin-number px-6 md:px-8 py-5 md:py-6 text-sm font-black">
                        ₹{displayPrice.toLocaleString()}
                      </td>
                      <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button onClick={() => handleEdit(product)} className="p-2.5 hover:bg-primary/5 text-primary rounded-xl"><Pencil size={18} /></button>
                           <button onClick={() => deleteProduct(product._id)} className="p-2.5 hover:bg-destructive/5 text-destructive rounded-xl"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

                {/* Shipping Details */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Shipping Dimensions & Weight</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-secondary/20 rounded-2xl border border-border/10">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Length (cm)</label>
                      <input 
                        type="number" 
                        step="any"
                        required 
                        value={newProduct.length} 
                        onChange={(e) => setNewProduct({ ...newProduct, length: Number(e.target.value) })} 
                        className="w-full h-11 px-4 bg-white border border-border/40 rounded-xl font-bold text-xs" 
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Width (cm)</label>
                      <input 
                        type="number" 
                        step="any"
                        required 
                        value={newProduct.width} 
                        onChange={(e) => setNewProduct({ ...newProduct, width: Number(e.target.value) })} 
                        className="w-full h-11 px-4 bg-white border border-border/40 rounded-xl font-bold text-xs" 
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Height (cm)</label>
                      <input 
                        type="number" 
                        step="any"
                        required 
                        value={newProduct.height} 
                        onChange={(e) => setNewProduct({ ...newProduct, height: Number(e.target.value) })} 
                        className="w-full h-11 px-4 bg-white border border-border/40 rounded-xl font-bold text-xs" 
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Weight (kg)</label>
                      <input 
                        type="number" 
                        step="any"
                        required 
                        value={newProduct.weight} 
                        onChange={(e) => setNewProduct({ ...newProduct, weight: Number(e.target.value) })} 
                        className="w-full h-11 px-4 bg-white border border-border/40 rounded-xl font-bold text-xs" 
                        placeholder="0.0"
                      />
                    </div>
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
                        <input type="file" className="hidden" accept="image/*,image/jpeg,image/jpg,image/png,image/webp" onChange={handleGalleryUpload} />
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

                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Specifications</label>
                    <button
                      type="button"
                      onClick={() => setNewProduct({
                        ...newProduct,
                        specifications: [...newProduct.specifications, { key: "", value: "" }]
                      })}
                      className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1"
                    >
                      <Plus size={10} /> Add Specification
                    </button>
                  </div>
                  
                  {newProduct.specifications.length === 0 ? (
                    <div className="p-4 bg-secondary/10 rounded-2xl border border-dashed border-border/60 text-center">
                      <p className="text-xs text-muted-foreground italic font-medium">No specifications added yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {newProduct.specifications.map((spec, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <input
                            type="text"
                            required
                            list="specification-keys"
                            placeholder="Specification Name (e.g. Weight)"
                            value={spec.key}
                            onChange={(e) => {
                              const updatedSpecs = [...newProduct.specifications];
                              updatedSpecs[idx].key = e.target.value;
                              setNewProduct({ ...newProduct, specifications: updatedSpecs });
                            }}
                            className="flex-1 h-12 px-5 bg-secondary/30 border-none rounded-xl font-bold placeholder:opacity-50 text-xs"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Value (e.g. 250g)"
                            value={spec.value}
                            onChange={(e) => {
                              const updatedSpecs = [...newProduct.specifications];
                              updatedSpecs[idx].value = e.target.value;
                              setNewProduct({ ...newProduct, specifications: updatedSpecs });
                            }}
                            className="flex-1 h-12 px-5 bg-secondary/30 border-none rounded-xl font-bold placeholder:opacity-50 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setNewProduct({
                                ...newProduct,
                                specifications: newProduct.specifications.filter((_, i) => i !== idx)
                              });
                            }}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dynamic suggestions datalist for specification keys */}
                  <datalist id="specification-keys">
                    {suggestedKeys.map(key => (
                      <option key={key} value={key} />
                    ))}
                  </datalist>
                </div>

                {/* Variants Management Switch */}
                <div className="flex items-center gap-3 p-4 bg-secondary/15 rounded-2xl border border-border/20">
                  <input
                    type="checkbox"
                    id="hasVariants"
                    checked={newProduct.hasVariants}
                    onChange={(e) => setNewProduct({ ...newProduct, hasVariants: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded border-border"
                  />
                  <label htmlFor="hasVariants" className="text-xs font-black uppercase tracking-wider text-foreground cursor-pointer select-none">
                    This product has variants (e.g. options like color, size, etc.)
                  </label>
                </div>

                {newProduct.hasVariants && (
                  <div className="space-y-6 p-5 bg-secondary/10 rounded-2xl border border-border/25">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Configure Option Types</label>
                      <button
                        type="button"
                        onClick={() => setNewProduct({
                          ...newProduct,
                          variantOptions: [...newProduct.variantOptions, { name: "", values: [], rawInput: "" }]
                        })}
                        className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1"
                      >
                        <Plus size={10} /> Add Option Row
                      </button>
                    </div>

                    {newProduct.variantOptions.length === 0 ? (
                      <div className="p-4 bg-white/50 rounded-xl border border-dashed text-center">
                        <p className="text-xs text-muted-foreground italic">No option categories added yet. Add "Color", "Size", etc.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {newProduct.variantOptions.map((opt, optIdx) => (
                          <div key={optIdx} className="flex gap-3 items-end bg-white/70 p-3 rounded-xl border border-border/20">
                            <div className="flex-1">
                              <label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Option Category Name</label>
                              <input
                                type="text"
                                required
                                value={opt.name}
                                placeholder="e.g. Color or Size"
                                onChange={(e) => {
                                  const updated = [...newProduct.variantOptions];
                                  updated[optIdx].name = e.target.value;
                                  setNewProduct({ ...newProduct, variantOptions: updated });
                                }}
                                className="w-full h-10 px-3 bg-white border border-border/40 rounded-lg text-xs font-bold"
                              />
                            </div>
                            <div className="flex-[2]">
                              <label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Sub-Options / Values (comma separated)</label>
                              <input
                                type="text"
                                required
                                value={opt.rawInput !== undefined ? opt.rawInput : opt.values.join(", ")}
                                placeholder="e.g. Red, Blue, Green"
                                onChange={(e) => {
                                  const text = e.target.value;
                                  const updated = [...newProduct.variantOptions];
                                  updated[optIdx].rawInput = text;
                                  updated[optIdx].values = text.split(",").map(s => s.trim()).filter(Boolean);
                                  setNewProduct({ ...newProduct, variantOptions: updated });
                                }}
                                className="w-full h-10 px-3 bg-white border border-border/40 rounded-lg text-xs font-bold"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = newProduct.variantOptions.filter((_, i) => i !== optIdx);
                                setNewProduct({ ...newProduct, variantOptions: updated });
                              }}
                              className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={syncCombinations}
                          className="w-full py-2 bg-black text-white hover:bg-primary text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                        >
                          Generate / Sync Combinations Grid
                        </button>
                      </div>
                    )}

                    {/* Bulk Actions Panel */}
                    {newProduct.variants.length > 0 && (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 ml-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary">Bulk Edit Variants</label>
                          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">Update price, mrp, or stock for all variants</span>
                        </div>
                        
                        <div className="flex gap-2 bg-white p-2 rounded-xl border border-border/40">
                          <select
                            id="bulk-type"
                            className="px-3 h-9 bg-secondary/40 rounded-lg text-xs font-bold border-none outline-none appearance-none cursor-pointer"
                          >
                            <option value="price">Price (₹)</option>
                            <option value="mrp">MRP (₹)</option>
                            <option value="stock">Stock</option>
                          </select>
                          
                          <input
                            type="number"
                            id="bulk-value"
                            placeholder="Enter value..."
                            className="flex-1 h-9 px-3 bg-secondary/20 border-none rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          
                          <button
                            type="button"
                            onClick={() => {
                              const type = (document.getElementById("bulk-type") as HTMLSelectElement)?.value;
                              const valInput = document.getElementById("bulk-value") as HTMLInputElement;
                              const val = Number(valInput?.value);
                              if (valInput?.value === "" || isNaN(val) || val < 0) {
                                toast.error("Please enter a valid positive number");
                                return;
                              }
                              const updated = newProduct.variants.map(v => {
                                const copy = { ...v };
                                if (type === "price") copy.price = val;
                                else if (type === "mrp") copy.mrp = val;
                                else if (type === "stock") copy.stock = val;
                                return copy;
                              });
                              setNewProduct({ ...newProduct, variants: updated });
                              toast.success(`Applied ${type} = ${val} to all variants!`);
                              if (valInput) valInput.value = "";
                            }}
                            className="h-9 px-5 bg-black text-white hover:bg-primary rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shrink-0"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Generated combinations list */}
                    {newProduct.variants.length > 0 && (
                      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 no-scrollbar">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Generated Combinations <span className="admin-number">({newProduct.variants.length})</span></label>
                        {newProduct.variants.map((variant, idx) => {
                          const optionDesc = Object.entries(variant.options || {})
                            .map(([key, val]) => `${key}: ${val}`)
                            .join(" / ");
                          return (
                            <div key={idx} className="p-4 bg-white rounded-xl border border-border/40 space-y-3 relative">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-wider text-foreground">
                                  {optionDesc || `Variant #${idx + 1}`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewProduct({
                                      ...newProduct,
                                      variants: newProduct.variants.filter((_, i) => i !== idx)
                                    });
                                  }}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-all"
                                  title="Remove this combination"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-4 gap-2">
                                <div>
                                  <label className="text-[8px] font-black uppercase text-muted-foreground">SKU</label>
                                  <input
                                    type="text"
                                    placeholder="SKU"
                                    value={variant.sku || ""}
                                    onChange={(e) => {
                                      const updated = [...newProduct.variants];
                                      updated[idx].sku = e.target.value;
                                      setNewProduct({ ...newProduct, variants: updated });
                                    }}
                                    className="w-full h-9 px-2 bg-white border border-border/40 rounded-lg text-xs font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[8px] font-black uppercase text-muted-foreground">Price (₹)</label>
                                  <input
                                    type="number"
                                    placeholder="Price"
                                    value={variant.price || ""}
                                    onChange={(e) => {
                                      const updated = [...newProduct.variants];
                                      updated[idx].price = Number(e.target.value);
                                      setNewProduct({ ...newProduct, variants: updated });
                                    }}
                                    className="w-full h-9 px-2 bg-white border border-border/40 rounded-lg text-xs font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[8px] font-black uppercase text-muted-foreground">MRP (₹)</label>
                                  <input
                                    type="number"
                                    placeholder="MRP"
                                    value={variant.mrp || ""}
                                    onChange={(e) => {
                                      const updated = [...newProduct.variants];
                                      updated[idx].mrp = Number(e.target.value);
                                      setNewProduct({ ...newProduct, variants: updated });
                                    }}
                                    className="w-full h-9 px-2 bg-white border border-border/40 rounded-lg text-xs font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[8px] font-black uppercase text-muted-foreground">Stock</label>
                                  <input
                                    type="number"
                                    placeholder="Stock"
                                    value={variant.stock || ""}
                                    onChange={(e) => {
                                      const updated = [...newProduct.variants];
                                      updated[idx].stock = Number(e.target.value);
                                      setNewProduct({ ...newProduct, variants: updated });
                                    }}
                                    className="w-full h-9 px-2 bg-white border border-border/40 rounded-lg text-xs font-bold"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-[8px] font-black uppercase text-muted-foreground">Main Image URL</label>
                                    <label className="text-[8px] font-black uppercase text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                                      <Upload size={10} /> Upload
                                      <input
                                        type="file"
                                        accept="image/*,image/jpeg,image/jpg,image/png,image/webp"
                                        className="hidden"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          const formData = new FormData();
                                          formData.append('image', file);
                                          try {
                                            toast.loading("Uploading variant image...", { id: `upload-main-${idx}` });
                                            const res = await api.post('/uploads/image', formData, {
                                              headers: { 'Content-Type': 'multipart/form-data' }
                                            });
                                            const updated = [...newProduct.variants];
                                            updated[idx].image = res.data.url;
                                            setNewProduct({ ...newProduct, variants: updated });
                                            toast.success("Main image uploaded!", { id: `upload-main-${idx}` });
                                          } catch (err) {
                                            toast.error("Upload failed", { id: `upload-main-${idx}` });
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Main Image URL"
                                    value={variant.image || ""}
                                    onChange={(e) => {
                                      const updated = [...newProduct.variants];
                                      updated[idx].image = e.target.value;
                                      setNewProduct({ ...newProduct, variants: updated });
                                    }}
                                    className="w-full h-9 px-2 bg-white border border-border/40 rounded-lg text-xs"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-[8px] font-black uppercase text-muted-foreground">Gallery Images (comma separated)</label>
                                    <label className="text-[8px] font-black uppercase text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                                      <Upload size={10} /> Add Image
                                      <input
                                        type="file"
                                        accept="image/*,image/jpeg,image/jpg,image/png,image/webp"
                                        className="hidden"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          const formData = new FormData();
                                          formData.append('image', file);
                                          try {
                                            toast.loading("Adding gallery image...", { id: `upload-gal-${idx}` });
                                            const res = await api.post('/uploads/image', formData, {
                                              headers: { 'Content-Type': 'multipart/form-data' }
                                            });
                                            const updated = [...newProduct.variants];
                                            const currentImages = updated[idx].images || [];
                                            const nextImages = [...currentImages, res.data.url];
                                            updated[idx].images = nextImages;
                                            updated[idx].rawImagesInput = nextImages.join(", ");
                                            setNewProduct({ ...newProduct, variants: updated });
                                            toast.success("Gallery image added!", { id: `upload-gal-${idx}` });
                                          } catch (err) {
                                            toast.error("Upload failed", { id: `upload-gal-${idx}` });
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="URL1, URL2, ..."
                                    value={variant.rawImagesInput !== undefined ? variant.rawImagesInput : (variant.images?.join(", ") || "")}
                                    onChange={(e) => {
                                      const updated = [...newProduct.variants];
                                      updated[idx].rawImagesInput = e.target.value;
                                      updated[idx].images = e.target.value.split(",").map(u => u.trim()).filter(Boolean);
                                      setNewProduct({ ...newProduct, variants: updated });
                                    }}
                                    className="w-full h-9 px-2 bg-white border border-border/40 rounded-lg text-xs"
                                  />
                                </div>
                              </div>

                              {/* Thumbnail preview strip */}
                              {(variant.image || (variant.images && variant.images.length > 0)) && (
                                <div className="flex gap-2 items-center p-2 bg-secondary/10 rounded-lg border border-border/20 overflow-x-auto no-scrollbar">
                                  {variant.image && (
                                    <div className="relative w-10 h-10 rounded border border-border bg-white shrink-0 group">
                                      <img src={variant.image} className="w-full h-full object-cover rounded" />
                                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[6px] text-white font-black text-center uppercase tracking-wide py-0.5 rounded-b">Main</span>
                                    </div>
                                  )}
                                  {variant.images?.map((imgUrl, galIdx) => (
                                    <div key={galIdx} className="relative w-10 h-10 rounded border border-border bg-white shrink-0 group">
                                      <img src={imgUrl} className="w-full h-full object-cover rounded" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...newProduct.variants];
                                          const nextImages = (updated[idx].images || []).filter((_, i) => i !== galIdx);
                                          updated[idx].images = nextImages;
                                          updated[idx].rawImagesInput = nextImages.join(", ");
                                          setNewProduct({ ...newProduct, variants: updated });
                                        }}
                                        className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X size={10} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

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

      {isStockModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="bg-white w-full max-w-4xl rounded-[1.5rem] md:rounded-[3rem] overflow-hidden luxury-shadow border border-white/20 animate-zoom-in">
            <div className="p-6 md:p-14 max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col h-full">
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div>
                  <h2 className="text-2xl md:text-3xl font-heading font-black tracking-tighter uppercase">Inventory & Stock</h2>
                  <p className="text-xs text-muted-foreground font-medium italic mt-1 font-bold">Review and manage your product stock levels.</p>
                </div>
                <button onClick={() => setIsStockModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-all"><X size={24} /></button>
              </div>

              {/* Search filter */}
              <div className="mb-6 shrink-0">
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={stockSearchQuery}
                  onChange={(e) => setStockSearchQuery(e.target.value)}
                  className="w-full h-12 px-5 bg-secondary/30 border-none rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none text-xs"
                />
              </div>

              {/* Scrollable list of products */}
              <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-4">
                {products
                  .filter(p => {
                    const q = stockSearchQuery.toLowerCase();
                    const matchesProduct = p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
                    const matchesVariant = p.variants?.some(v => v.sku?.toLowerCase().includes(q) || Object.values(v.options).some(val => val.toLowerCase().includes(q)));
                    return matchesProduct || matchesVariant;
                  })
                  .map(product => {
                    const hasVariants = product.variants && product.variants.length > 0;
                    const isExpanded = !!expandedProductIds[product._id];

                    return (
                      <div key={product._id} className="p-4 bg-secondary/10 rounded-2xl border border-border/20 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary/40 border border-primary/10 overflow-hidden shrink-0">
                              {product.mainImage ? <img src={product.mainImage} className="w-full h-full object-cover" /> : <ImageIcon size={16} />}
                            </div>
                            <div>
                              <h4 className="text-xs font-black uppercase text-foreground tracking-tight">{product.name}</h4>
                              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{product.sku || "No SKU"}</p>
                            </div>
                          </div>

                          {hasVariants ? (
                            <button
                              onClick={() => toggleProductExpand(product._id)}
                              className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                            >
                              <span><span className="admin-number">{product.variants?.length}</span> Variants</span>
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <label className="text-[8px] font-black uppercase text-muted-foreground mr-1 font-bold">Stock</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={localStocks[product._id] !== undefined ? localStocks[product._id] : ""}
                                  onChange={(e) => {
                                    const val = e.target.value === "" ? 0 : Number(e.target.value);
                                    setLocalStocks(prev => ({ ...prev, [product._id]: val }));
                                  }}
                                  className="w-20 h-9 px-2 bg-white border border-border/40 rounded-lg text-xs font-bold text-center"
                                />
                              </div>
                              <button
                                onClick={() => handleUpdateBaseStock(product._id)}
                                disabled={updatingStockId === product._id}
                                className="p-2 bg-black hover:bg-primary text-white disabled:opacity-50 rounded-lg transition-all flex items-center justify-center"
                                title="Save stock"
                              >
                                {updatingStockId === product._id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Send size={14} />
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Collapsible Variants Area */}
                        {hasVariants && isExpanded && (
                          <div className="mt-3 p-3 bg-white/70 rounded-xl border border-border/20 space-y-3 divide-y divide-border/10">
                            {product.variants?.map((variant, vIdx) => {
                              const variantKey = `${product._id}-variant-${vIdx}`;
                              const optionDesc = Object.entries(variant.options || {})
                                .map(([key, val]) => `${key}: ${val}`)
                                .join(" / ");

                              return (
                                <div key={vIdx} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded bg-primary/5 border border-primary/10 overflow-hidden shrink-0">
                                      {variant.image ? <img src={variant.image} className="w-full h-full object-cover" /> : <ImageIcon size={12} />}
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black uppercase text-foreground tracking-wide">{optionDesc}</p>
                                      <p className="admin-number text-[8px] text-muted-foreground font-black uppercase">{variant.sku || "No SKU"}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <div className="flex items-center gap-1">
                                      <label className="text-[8px] font-black uppercase text-muted-foreground mr-1 font-bold">Stock</label>
                                      <input
                                        type="number"
                                        min={0}
                                        value={localStocks[variantKey] !== undefined ? localStocks[variantKey] : ""}
                                        onChange={(e) => {
                                          const val = e.target.value === "" ? 0 : Number(e.target.value);
                                          setLocalStocks(prev => ({ ...prev, [variantKey]: val }));
                                        }}
                                        className="w-16 h-8 px-2 bg-white border border-border/40 rounded-lg text-xs font-bold text-center"
                                      />
                                    </div>
                                    <button
                                      onClick={() => handleUpdateVariantStock(product._id, vIdx)}
                                      disabled={updatingStockId === variantKey}
                                      className="p-1.5 bg-black hover:bg-primary text-white disabled:opacity-50 rounded-lg transition-all flex items-center justify-center"
                                      title="Save stock"
                                    >
                                      {updatingStockId === variantKey ? (
                                        <Loader2 size={12} className="animate-spin" />
                                      ) : (
                                        <Send size={12} />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
