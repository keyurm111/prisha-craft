import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Search, Loader2, Tag, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import api from "@/services/api";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  mainImage: string;
  category: { _id: string; name: string };
  slug: string;
  featured?: boolean;
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State from URL or Defaults
  const category = searchParams.get("category") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const sortParam = searchParams.get("sort");
  const sortBy = sortParam && sortParam.trim() !== "" ? sortParam : "recommended";
  const search = searchParams.get("search") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Local state for instant UI feedback on search/price
  const [localSearch, setLocalSearch] = useState(search);
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit: 9,
        sort: sortBy,
      };

      if (category !== "all") params.category = category;
      if (search) params.search = search;
      if (minPrice) params.price = { ...params.price, gte: minPrice };
      if (maxPrice) params.price = { ...params.price, lte: maxPrice };

      // Flatten price if needed for the API
      // Our API expects ?price[gte]=...
      // We'll construct the query string manually or via axios params
      
      const queryParams = new URLSearchParams();
      queryParams.set("page", page.toString());
      queryParams.set("limit", "9");
      if (sortBy !== "recommended") queryParams.set("sort", sortBy);
      if (category !== "all") queryParams.set("category", category);
      if (search) queryParams.set("search", search);
      if (minPrice) queryParams.set("price[gte]", minPrice);
      if (maxPrice) queryParams.set("price[lte]", maxPrice);

      const [pRes, cRes] = await Promise.all([
        api.get(`/products?${queryParams.toString()}`),
        api.get("/categories")
      ]);
      
      setProducts(pRes.data.data.products);
      setTotalCount(pRes.data.totalCount || 0);
      setCategories(cRes.data.data.categories);
    } catch (error) {
      console.error("Failed to fetch shop intelligence", error);
    } finally {
      setIsLoading(false);
    }
  }, [category, page, sortBy, search, minPrice, maxPrice]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        updateParams({ search: localSearch, page: "1" });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || (key === "category" && value === "all") || (key === "sort" && value === "recommended")) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  };

  const totalPages = Math.ceil(totalCount / 9);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-16">
      <div className="mb-14 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tighter mb-4 uppercase">The Shop</h1>
          <p className="text-muted-foreground font-medium italic max-w-xl mx-auto">Explore our artisanal collection of handcrafted bags and premium accessories.</p>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        <aside className="hidden lg:block w-80 shrink-0 relative">
          <div className="sticky top-32 space-y-12 h-fit">
            <Accordion type="multiple" defaultValue={["categories", "price"]}>
              <AccordionItem value="categories" className="border-none">
                <AccordionTrigger className="hover:no-underline py-0 mb-6 group">
                  <div className="flex items-center gap-2">
                     <Tag size={16} className="text-primary" />
                     <h3 className="font-heading font-black text-[13px] uppercase tracking-[0.2em]">Categories</h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => updateParams({ category: "all", page: "1" })}
                        className={`text-[12px] font-black uppercase tracking-widest w-full text-left py-3.5 px-6 rounded-2xl transition-all border ${
                          category === "all" ? "bg-black text-white border-black luxury-shadow" : "text-muted-foreground border-transparent hover:bg-secondary/50"
                        }`}
                      >
                        All Categories
                      </button>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat._id}>
                        <button
                          onClick={() => updateParams({ category: cat._id, page: "1" })}
                          className={`text-[12px] font-black uppercase tracking-widest w-full text-left py-3.5 px-6 rounded-2xl transition-all border ${
                            category === cat._id ? "bg-black text-white border-black luxury-shadow" : "text-muted-foreground border-transparent hover:bg-secondary/50"
                          }`}
                        >
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price" className="border-none mt-12">
                <AccordionTrigger className="hover:no-underline py-0 mb-6 group">
                  <div className="flex items-center gap-2">
                     <LayoutGrid size={16} className="text-primary" />
                     <h3 className="font-heading font-black text-[13px] uppercase tracking-[0.2em]">Price Tier</h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Min</label>
                      <Input
                        type="number"
                        placeholder="0"
                        className="h-12 bg-secondary/30 border-none rounded-xl font-bold"
                        value={localMin}
                        onChange={(e) => setLocalMin(e.target.value)}
                        onBlur={() => updateParams({ minPrice: localMin, page: "1" })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Max</label>
                      <Input
                        type="number"
                        placeholder="∞"
                        className="h-12 bg-secondary/30 border-none rounded-xl font-bold"
                        value={localMax}
                        onChange={(e) => setLocalMax(e.target.value)}
                        onBlur={() => updateParams({ maxPrice: localMax, page: "1" })}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-16 p-4 bg-secondary/20 rounded-[2.5rem] border border-border/30 luxury-shadow">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
              <input
                type="text"
                placeholder="Search our product catalog..."
                className="w-full pl-14 h-14 bg-background border-none rounded-3xl text-sm font-bold outline-none"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-8 px-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order</span>
                <Select value={sortBy || "recommended"} onValueChange={(val) => updateParams({ sort: val, page: "1" })}>
                  <SelectTrigger className="w-[180px] h-14 bg-background border-none rounded-3xl font-black text-[11px] uppercase tracking-widest luxury-shadow">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="recommended" className="text-[11px] font-black uppercase">Recommended</SelectItem>
                    <SelectItem value="-createdAt" className="text-[11px] font-black uppercase">Latest Arrivals</SelectItem>
                    <SelectItem value="price" className="text-[11px] font-black uppercase">Cost: Low - High</SelectItem>
                    <SelectItem value="-price" className="text-[11px] font-black uppercase">Cost: High - Low</SelectItem>
                    <SelectItem value="name" className="text-[11px] font-black uppercase">Name: A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Loading Products...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-10 gap-y-16">
                <AnimatePresence mode="popLayout">
                  {products.map((product, i) => (
                    <motion.div key={product._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <ProductCard product={product as any} index={i} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {products.length === 0 && (
                <div className="text-center py-40 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border/40">
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-sm">No products matched your search</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-20">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => page > 1 && updateParams({ page: (page - 1).toString() })}
                          className={`cursor-pointer ${page === 1 ? 'pointer-events-none opacity-50' : ''}`}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            isActive={p === page}
                            onClick={() => updateParams({ page: p.toString() })}
                            className="cursor-pointer font-black text-[11px]"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => page < totalPages && updateParams({ page: (page + 1).toString() })}
                          className={`cursor-pointer ${page === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-[60]">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-2xl"
        >
          {showFilters ? <X size={24} /> : <Filter size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            className="lg:hidden fixed inset-0 z-50 bg-white p-8 flex flex-col pt-20"
          >
            <button onClick={() => setShowFilters(false)} className="absolute top-8 right-8 p-2 bg-secondary rounded-full"><X size={20} /></button>
            <div className="space-y-12 overflow-y-auto pb-20">
               <div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-6">Categories</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {["all", ...categories.map(c => c._id)].map(id => (
                       <button
                        key={id}
                        onClick={() => { updateParams({ category: id, page: "1" }); setShowFilters(false); }}
                        className={`py-4 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          category === id ? "bg-black text-white border-black" : "bg-secondary text-muted-foreground border-transparent"
                        }`}
                       >
                         {id === "all" ? "All Categories" : categories.find(c => c._id === id)?.name}
                       </button>
                    ))}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
