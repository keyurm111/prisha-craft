import { useState, useEffect } from "react";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import { 
  GripVertical, 
  Save, 
  Loader2, 
  Layers, 
  Package, 
  Filter,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Category {
  _id: string;
  name: string;
  ranking: number;
  image?: string;
}

interface Product {
  _id: string;
  name: string;
  categoryRanking: number;
  overallRanking: number;
  category: { _id: string; name: string } | string;
  mainImage: string;
  sku?: string;
}

interface RankingUpdate {
  _id: string;
  ranking?: number;
  overallRanking?: number;
  categoryRanking?: number;
}

export default function Rankings() {
  const [activeTab, setActiveTab] = useState<"categories" | "products_global" | "products_categorical">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([
        api.get("/categories"),
        api.get("/products?limit=200") 
      ]);
      const sortedCats = [...cRes.data.data.categories].sort((a, b) => (b.ranking || 0) - (a.ranking || 0));
      setCategories(sortedCats);
      setProducts(pRes.data.data.products);
      if (sortedCats.length > 0) setSelectedCategoryId(sortedCats[0]._id);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "products_global") {
      setProducts(prev => [...prev].sort((a, b) => (b.overallRanking || 0) - (a.overallRanking || 0)));
    }
  }, [activeTab]);

  const [localCategoricalProducts, setLocalCategoricalProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    if (activeTab === "products_categorical") {
      const filtered = products.filter(p => {
        const catId = typeof p.category === 'object' ? p.category._id : p.category;
        return catId === selectedCategoryId;
      }).sort((a, b) => (b.categoryRanking || 0) - (a.categoryRanking || 0));
      setLocalCategoricalProducts(filtered);
    }
  }, [selectedCategoryId, activeTab, products]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let rankings: RankingUpdate[] = [];
      let endpoint = "";

      if (activeTab === "categories") {
        endpoint = "/categories/update-rankings";
        rankings = categories.map((c, i) => ({ _id: c._id, ranking: (categories.length - i) * 10 }));
      } else if (activeTab === "products_global") {
        endpoint = "/products/update-rankings";
        rankings = products.map((p, i) => ({ _id: p._id, overallRanking: (products.length - i) * 10 }));
      } else {
        endpoint = "/products/update-rankings";
        rankings = localCategoricalProducts.map((p, i) => ({ _id: p._id, categoryRanking: (localCategoricalProducts.length - i) * 10 }));
      }

      await api.patch(endpoint, { rankings });
      toast.success("Synchronized successfully");
      
      if (activeTab === "products_categorical") {
         setProducts(prev => prev.map(p => {
             const found = rankings.find(r => r._id === p._id);
             return (found && found.categoryRanking !== undefined) ? { ...p, categoryRanking: found.categoryRanking } : p;
         }));
      }
    } catch (error) {
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const currentList = activeTab === "categories" ? categories : activeTab === "products_global" ? products : localCategoricalProducts;
  
  const handleReorder = (newItems: any[]) => {
    if (activeTab === "categories") setCategories(newItems);
    else if (activeTab === "products_global") setProducts(newItems);
    else setLocalCategoricalProducts(newItems);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-6 px-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground text-center">Loading Priorities...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 animate-fade-in pb-24 px-4 sm:px-6 lg:px-8">
      {/* Responsive Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between pt-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tighter uppercase leading-none">
            Visual <span className="text-primary italic">Ranking</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium italic">
            Drag to define the order of elements.
          </p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full md:w-auto h-14 px-8 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-black/10"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Sync Changes
        </button>
      </div>

      {/* Responsive Tabs */}
      <div className="bg-[#efefef] p-1.5 rounded-2xl md:rounded-[1.75rem] flex flex-col md:flex-row gap-1">
        <TabButton active={activeTab === "categories"} onClick={() => setActiveTab("categories")} icon={Layers} label="Categories" />
        <TabButton active={activeTab === "products_global"} onClick={() => setActiveTab("products_global")} icon={Package} label="Global Items" />
        <TabButton active={activeTab === "products_categorical"} onClick={() => setActiveTab("products_categorical")} icon={Filter} label="By Category" />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "products_categorical" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            className="p-5 md:p-8 bg-white rounded-2xl md:rounded-[2rem] border border-border/40 shadow-sm flex flex-col md:flex-row items-center gap-4 md:gap-6"
          >
            <div className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Filter size={20} />
                </div>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.1em] text-foreground">Filter Category</span>
            </div>
            <div className="hidden md:block h-8 w-[1px] bg-border/40" />
            <select 
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full bg-secondary/20 p-3 rounded-xl md:bg-transparent md:p-0 border-none font-black text-sm md:text-base outline-none cursor-pointer text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
            >
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <div className="flex items-center gap-3 px-4 md:px-6 opacity-40 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            <Info size={14} />
            <span>Drag items to reorder (Top = First)</span>
        </div>

        <Reorder.Group 
            axis="y" 
            values={currentList} 
            onReorder={handleReorder}
            className="space-y-2 md:space-y-4"
        >
            {currentList.map((item, index) => (
                <Reorder.Item 
                    key={item._id} 
                    value={item}
                    className="p-3 md:p-6 bg-white rounded-xl md:rounded-[2rem] border border-border/30 flex items-center justify-between cursor-grab active:cursor-grabbing hover:border-primary/40 transition-all group shadow-sm active:shadow-lg active:scale-[1.01]"
                >
                    <div className="flex items-center gap-3 md:gap-8 min-w-0">
                        <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-secondary/50 flex items-center justify-center text-[9px] md:text-[11px] font-black text-muted-foreground shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                            {index + 1}
                        </div>
                        
                        <div className="w-12 h-12 md:w-20 md:h-20 rounded-lg md:rounded-2xl overflow-hidden bg-secondary/30 shrink-0 border border-border/20 shadow-sm">
                            <img src={(item as any).mainImage || (item as any).image || "https://placehold.co/200"} className="w-full h-full object-cover" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h4 className="text-xs md:text-lg font-black truncate text-foreground/90 uppercase tracking-tight leading-tight">{item.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                                <span className="text-[8px] md:text-[10px] font-black text-primary/60 uppercase tracking-widest px-1.5 py-0.5 bg-primary/5 rounded-full whitespace-nowrap">
                                    {activeTab === "categories" ? "Collection" : (item as Product).category && typeof (item as Product).category === 'object' ? ((item as Product).category as any).name : "Item"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-muted-foreground/30 group-hover:text-primary transition-colors pl-4 md:pl-8">
                        <GripVertical size={20} className="md:w-6 md:h-6" />
                    </div>
                </Reorder.Item>
            ))}
        </Reorder.Group>

        {(activeTab === "products_categorical" && localCategoricalProducts.length === 0) && (
            <div className="py-20 md:py-32 text-center border-2 border-dashed border-border/40 rounded-2xl md:rounded-[3rem] bg-secondary/5 flex flex-col items-center gap-4 px-6">
                <Package size={40} className="text-muted-foreground/20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Empty selection</p>
            </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 px-4 md:px-8 py-3.5 md:py-5 rounded-xl md:rounded-[1.5rem] text-[9px] md:text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 transition-all duration-300 relative z-10",
        active 
          ? "bg-white text-primary shadow-lg md:shadow-xl scale-[1.01]" 
          : "text-muted-foreground hover:text-black hover:bg-white/40"
      )}
    >
      <Icon size={14} className="md:w-4 md:h-4" />
      <span>{label}</span>
    </button>
  );
}
