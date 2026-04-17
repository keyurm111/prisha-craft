import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, ArrowRight, Calendar, User, Tag } from "lucide-react";
import api from "@/services/api";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  image: string;
  author: string;
  category: string;
  publishedAt: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get("/blogs?status=Published");
        setBlogs(res.data.data.blogs);
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const categories = ["All", ...Array.from(new Set(blogs.map((b) => b.category)))];

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         blog.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || blog.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-20">
      {/* Header */}
      <div className="mb-12 lg:mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-7xl font-heading font-black tracking-tighter mb-4 md:mb-6 uppercase">The Editorial</h1>
          <p className="text-muted-foreground font-medium italic max-w-2xl mx-auto text-base md:text-lg px-4">Insights, inspiration, and the latest stories from the world of artisanal craftsmanship.</p>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search the archives..."
            className="w-full pl-16 h-16 bg-secondary/20 border border-border/10 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap border ${
                activeCategory === cat 
                  ? "bg-black text-white border-black luxury-shadow" 
                  : "bg-white text-muted-foreground border-border/40 hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
        <AnimatePresence mode="popLayout">
          {filteredBlogs.map((blog, i) => (
            <motion.article
              key={blog._id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative flex flex-col h-full bg-white rounded-[2rem] border border-border/20 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer"
            >
              <Link to={`/blog/${blog.slug}`} className="absolute inset-0 z-10" />
              
              <div className="relative h-60 overflow-hidden block">
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-primary shadow-sm">
                    {blog.category}
                  </span>
                </div>
              </div>

              <div className="flex flex-col flex-1 p-6 sm:p-8 pt-6">
                <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-primary/40" />
                    {new Date(blog.publishedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="w-1 h-1 bg-border rounded-full" />
                  <div className="flex items-center gap-1.5 text-primary">
                    <User size={12} className="opacity-40" />
                    {blog.author}
                  </div>
                </div>

                <h2 className="text-xl font-heading font-black tracking-tight mb-3 group-hover:text-primary transition-colors line-clamp-2 uppercase leading-tight">
                  {blog.title}
                </h2>

                <div className="mt-auto pt-6 border-t border-border/10">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground group/btn">
                    Read Manuscript
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform text-primary" />
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {filteredBlogs.length === 0 && (
        <div className="text-center py-40 bg-secondary/5 rounded-[4rem] border-2 border-dashed border-border/20">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center luxury-shadow mx-auto mb-8">
            <Search size={32} className="text-muted-foreground/40" />
          </div>
          <h3 className="text-2xl font-heading font-black tracking-tight mb-4 uppercase">No Manuscripts Found</h3>
          <p className="text-muted-foreground font-medium italic mb-10">We couldn't find any articles matching your search criteria.</p>
          <button 
            onClick={() => { setSearchTerm(""); setActiveCategory("All"); }}
            className="px-10 py-5 bg-black text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-primary transition-all"
          >
            Clear Search Registry
          </button>
        </div>
      )}
    </div>
  );
}
