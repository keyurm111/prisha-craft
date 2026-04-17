import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Truck, Star, Package, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import api from "@/services/api";

interface Category {
  _id: string;
  name: string;
  description: string;
  slug: string;
  image?: string;
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
}

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


const whyChoose = [
  { icon: Shield, title: "Artisan Quality", description: "Every bag is handcrafted by experienced masters" },
  { icon: Package, title: "Bulk Manufacturing", description: "Experienced large-scale production for retailers" },
  { icon: Truck, title: "Global Shipping", description: "Reliable distribution for international clients" },
  { icon: Star, title: "Craftsmanship Focus", description: "Using premium materials for lasting durability" },
];

const testimonials = [
  { quote: "The craftsmanship of Prisha Crafts bags is exceptional. The leather quality and stitching are truly world-class.", author: "Aditya Sharma", role: "Fashion Stylist" },
  { quote: "As a boutique owner, finding a manufacturer with this level of attention to detail was a game-changer for our brand.", author: "Priya Mehta", role: "Boutique Owner" },
  { quote: "I've used their handcrafted totes for years. They aged beautifully and are still my most durable accessories.", author: "Vikram Goel", role: "Long-time Customer" },
  { quote: "Prisha Crafts handled our bulk order with incredible efficiency. The samples and final products were identical and perfect.", author: "Sanya Kapoor", role: "Retail Buyer" },
  { quote: "A masterclass in artisanal manufacturing. They understand the balance between modern design and traditional techniques.", author: "Rahul Verma", role: "Accessories Designer" },
];

function SellingOutFast({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector("div")?.offsetWidth || 300;
    scrollRef.current.scrollBy({ left: dir === "left" ? -cardWidth - 32 : cardWidth + 32, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-14"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">Selling Out Fast</h2>
            <p className="text-muted-foreground font-body text-sm sm:text-base">Grab these popular picks before they're gone</p>
          </div>
          <div className="flex gap-2">
            <button
                onClick={() => scroll("left")}
                className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
                onClick={() => scroll("right")}
                className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>

        <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory touch-pan-y no-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product, i) => (
              <div key={product._id} className="min-w-[260px] max-w-[280px] snap-start shrink-0">
                <ProductCard
                    product={product as any}
                    index={i}
                />
              </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pRes, sRes, bRes] = await Promise.all([
          api.get("/categories"),
          api.get("/products"),
          api.get("/sliders"),
          api.get("/blogs?status=Published")
        ]);
        setCategories(cRes.data.data.categories);
        setFeaturedProducts(pRes.data.data.products.slice(0, 10)); // Take first 10 for showcasing
        setSliders(sRes.data.data.sliders.filter((s: Slider) => s.isActive));
        setBlogs(bRes.data.data.blogs.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch homepage data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === sliders.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
  };

  // Auto-slide every 6 seconds
  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [sliders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

    const activeSlider = sliders.length > 0 ? sliders[currentSlide] : {
      title: "Artisanal Bags Reimagined",
      subtitle: "Experienced manufacturers of premium handcrafted bags for every lifestyle.",
      image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=1600&q=80",
      mobileImage: "",
      ctaText: "Explore Collections",
      ctaLink: "/shop"
    };
  
    const heroImage = (isMobile && activeSlider.mobileImage) ? activeSlider.mobileImage : activeSlider.image;
  
    return (
      <>
        {/* Hero Section */}
        <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden bg-black">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide + (isMobile ? '-mob' : '-desk')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[10000ms] ease-out will-change-transform"
                style={{ backgroundImage: `url('${heroImage}')` }}
              />
              <div className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]" />
            </motion.div>
          </AnimatePresence>

        <div className="relative container mx-auto px-4 lg:px-8 h-full flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="max-w-3xl"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">Artisan Handcrafted</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-black text-white leading-[1.05] mb-6 md:mb-8 tracking-tighter uppercase">
                {activeSlider.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/80 font-medium mb-8 md:mb-12 max-w-xl italic leading-relaxed">
                {activeSlider.subtitle}
              </p>
              
              <div className="flex flex-wrap gap-4 sm:gap-6 items-center">
                <Link
                  to={activeSlider.ctaLink}
                  className="group relative inline-flex items-center gap-2 sm:gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-white text-black font-black text-[10px] sm:text-[12px] tracking-[0.2em] uppercase rounded-full hover:bg-black hover:text-white transition-all luxury-shadow overflow-hidden"
                >
                  <span className="relative z-10">{activeSlider.ctaText}</span>
                  <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                {sliders.length > 1 && (
                  <div className="flex gap-2 sm:gap-3">
                     <button 
                        onClick={prevSlide}
                        className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all backdrop-blur-sm"
                     >
                        <ChevronLeft size={20} />
                     </button>
                     <button 
                        onClick={nextSlide}
                        className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all backdrop-blur-sm"
                     >
                        <ChevronRight size={20} />
                     </button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Progress Bar */}
          {sliders.length > 1 && (
            <div className="absolute bottom-16 left-4 lg:left-8 right-4 lg:right-8 flex gap-4 h-1">
              {sliders.map((_, i) => (
                <div key={i} className="flex-1 bg-white/10 rounded-full overflow-hidden">
                  {i === currentSlide && (
                    <motion.div 
                      layoutId="sliderProgress"
                      className="h-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 6, ease: "linear" }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category Showcase */}
      <section className="py-20 container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tighter mb-3 uppercase">Artisan Categories</h2>
          <p className="text-muted-foreground font-medium italic text-sm sm:text-base px-4">Discover handcrafted collections designed for your lifestyle.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.slice(0, 6).map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/shop?category=${cat._id}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] luxury-shadow border border-border/20"
              >
                <img
                  src={cat.image || "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&q=80"}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 sm:p-8 text-center">
                  <h3 className="text-2xl sm:text-3xl font-heading font-black mb-3 tracking-tighter uppercase">{cat.name}</h3>
                  <p className="text-[10px] sm:text-[11px] text-white/80 font-black uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">Explore Category</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>


      {/* Selling Out Fast */}
      <SellingOutFast products={featuredProducts} />

      {/* Infinite Testimonials Section */}
      <section className="py-24 bg-background overflow-hidden border-y border-border/10">
        <div className="container mx-auto px-4 lg:px-8 mb-16 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tighter mb-3 uppercase">Customer Reviews</h2>
                <p className="text-muted-foreground font-medium italic text-sm sm:text-base">Hear from our happy customers.</p>
            </motion.div>
        </div>

        <div className="relative flex pause-marquee">
            <div className="flex animate-marquee gap-8 whitespace-nowrap">
                {[...testimonials, ...testimonials].map((t, i) => (
                    <div 
                        key={i} 
                        className="w-[320px] sm:w-[450px] p-6 sm:p-8 bg-white rounded-3xl sm:rounded-[2.5rem] luxury-shadow border border-border/20 flex flex-col gap-4 whitespace-normal"
                    >
                        <div className="flex gap-1 text-primary">
                            {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                        </div>
                        <p className="text-sm sm:text-[15px] font-medium leading-relaxed italic text-foreground/80">"{t.quote}"</p>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-black text-[10px] text-primary">
                                {t.author.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest">{t.author}</p>
                                <p className="text-[10px] text-muted-foreground font-bold">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Blogs Section */}
      <section className="py-24 container mx-auto px-4 lg:px-8">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div className="max-w-xl">
             <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tighter mb-4 uppercase">The Craft Journal</h2>
             <p className="text-muted-foreground font-medium italic text-sm sm:text-base">Behind the scenes of our artisanal process, bag design trends, and leather care.</p>
          </div>
          <Link to="/blog" className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] px-8 py-4 bg-secondary/50 rounded-full hover:bg-black hover:text-white transition-all whitespace-nowrap w-fit">
             View All Blogs
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {blogs.map((blog, i) => (
             <motion.article
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative flex flex-col h-full bg-white rounded-3xl sm:rounded-[2rem] border border-border/10 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer"
             >
                <Link to={`/blog/${blog.slug}`} className="absolute inset-0 z-10" />
                
                <div className="relative h-48 overflow-hidden block">
                   <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   <div className="absolute top-4 left-4 z-20">
                      <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest text-primary">
                         {blog.category}
                      </span>
                   </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                   <h3 className="text-base font-heading font-black tracking-tight mb-3 group-hover:text-primary transition-colors line-clamp-2 uppercase leading-tight">
                      {blog.title}
                   </h3>
                   <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/10">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                         {new Date(blog.publishedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                      </span>
                      <ArrowRight size={14} className="text-primary group-hover:translate-x-1 transition-transform" />
                   </div>
                </div>
             </motion.article>
          ))}
        </div>
      </section>

      {/* The Prisha Standard */}
      <section className="py-24 container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-black tracking-tighter mb-3 uppercase">The Prisha Standard</h2>
          <p className="text-muted-foreground font-medium italic text-sm sm:text-base px-4">Generations of manufacturing expertise in every stitch.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {whyChoose.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-8 bg-white rounded-3xl sm:rounded-[2.5rem] border border-border/20 hover:border-primary/20 transition-all hover:translate-y-[-4px]"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white luxury-shadow mb-6 text-primary">
                <item.icon size={28} />
              </div>
              <h3 className="font-heading font-black uppercase tracking-widest text-[13px] mb-3">{item.title}</h3>
              <p className="text-[13px] text-muted-foreground font-semibold leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/cta-bg.png')" }}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black tracking-tighter mb-6 uppercase text-white">Handcrafted Bag Collection</h2>
            <p className="text-white/70 font-medium italic mb-10 max-w-xl mx-auto text-base sm:text-lg px-4">
              Explore our range of premium totes, backpacks, and accessories handcrafted by experienced manufacturers.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-10 sm:px-12 py-4 sm:py-5 bg-white text-black font-black text-[12px] sm:text-[13px] tracking-[0.2em] uppercase rounded-full hover:bg-black hover:text-white transition-all luxury-shadow"
            >
              Start Shopping
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}

function ArrowRight({ size, className }: { size: number, className: string }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
    )
}
