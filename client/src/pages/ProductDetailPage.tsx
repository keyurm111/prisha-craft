import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  ArrowLeft, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Loader2, 
  Check, 
  Zap, 
  ShieldCheck, 
  Truck, 
  Lock,
  Play
} from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/services/api";
import ProductCard from "@/components/ProductCard";

interface Product {
  _id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  mrp: number;
  discount: number;
  highlights: string[];
  mainImage: string;
  images: string[];
  video?: string;
  category: { _id: string; name: string };
  stock: number;
  slug: string;
  shippingDimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || id === "undefined") {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get(`/products/${id}`);
        const productData = response.data.data.product;
        setProduct(productData);
        setActiveImage(productData.mainImage);
        
        // Fetch related products
        const relatedRes = await api.get(`/products?category=${productData.category._id}&limit=4`);
        setRelatedProducts(relatedRes.data.data.products.filter((p: any) => p._id !== id));
      } catch (error) {
        console.error("Failed to fetch product details", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-heading font-black mb-4">Product Not Found</h1>
        <Link to="/shop" className="text-primary font-bold hover:underline uppercase tracking-widest text-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product._id);
  const allImages = [product.mainImage, ...(product.images || [])];

  const handleAddToCart = () => {
    addToCart(product._id, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product._id, quantity);
    navigate("/cart");
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 pt-16 pb-20">
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground mb-8 hover:text-black transition-all group">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Shop
        </Link>

        {/* Mobile-only Heading Section */}
        <div className="lg:hidden mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-4 py-1.5 rounded-full">
              {product.category?.name || "Premium Craft"}
            </span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest">SKU: {product.sku || product._id.slice(-8)}</span>
          </div>
          <h1 className="text-3xl font-heading font-black tracking-tighter leading-none uppercase">
            {product.name}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-28 self-start">
            <div className="relative group aspect-[4/5] max-h-[60vh] sm:max-h-[75vh] w-full rounded-3xl overflow-hidden bg-secondary/30 ring-1 ring-border/50">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={activeImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                />
              </AnimatePresence>
              
              {product.video && (
                <button 
                  onClick={() => setShowVideo(true)}
                  className="absolute bottom-6 right-6 w-14 h-14 bg-white/90 backdrop-blur shadow-xl rounded-full flex items-center justify-center text-primary hover:scale-110 transition-transform"
                >
                  <Play size={24} fill="currentColor" />
                </button>
              )}

              {product.discount > 0 && (
                <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1.5 rounded-full text-[13px] font-black uppercase tracking-wider shadow-lg">
                  {product.discount}% OFF
                </div>
              )}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shrink-0 ring-2 transition-all ${activeImage === img ? "ring-primary" : "ring-transparent opacity-60 hover:opacity-100"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-6">
              {/* Desktop-only Heading Section */}
              <div className="hidden lg:block">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/5 px-4 py-1 rounded-full">
                    {product.category?.name || "Premium Craft"}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">SKU: {product.sku || product._id.slice(-8)}</span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tighter leading-none mb-4 uppercase">
                  {product.name}
                </h1>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-4xl font-heading font-black text-black">₹{product.price.toLocaleString()}</span>
                  {product.mrp > product.price && (
                    <div className="flex items-center gap-2">
                       <span className="text-muted-foreground line-through text-sm font-bold tracking-wider">₹{product.mrp.toLocaleString()}</span>
                       <span className="text-green-600 text-xs font-black uppercase">You Save ₹{(product.mrp - product.price).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className={`flex items-center gap-2 mb-8 ${product.stock < 10 ? "text-red-600 animate-pulse" : "text-green-600"}`}>
                <Zap size={16} fill="currentColor" />
                <span className="text-xs font-black uppercase tracking-widest">
                  {product.stock === 0 ? "Out of Stock" : product.stock < 10 ? `Hurry! Only ${product.stock} left in stock` : "In Stock - Ready to Ship"}
                </span>
              </div>

              {/* Highlights */}
              {product.highlights && product.highlights.length > 0 && (
                <div className="space-y-3 mb-10">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-2">Key Highlights</h4>
                  <ul className="grid grid-cols-1 gap-2">
                    {product.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                        <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity & CTAs */}
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-secondary/50 rounded-2xl border border-border p-1 w-fit">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-white rounded-xl transition-all">
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-bold">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-white rounded-xl transition-all">
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => toggleWishlist(product._id)}
                    className={`p-4 rounded-2xl border transition-all ${wishlisted ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-border hover:bg-secondary"}`}
                  >
                    <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <Button 
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="h-14 md:h-16 bg-white text-black border-2 border-black hover:bg-black hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-xl shadow-black/5 p-2 overflow-hidden"
                  >
                    <ShoppingBag size={14} className="sm:size-5 shrink-0" />
                    <span className="truncate">Add to Cart</span>
                  </Button>
                  <Button 
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="h-14 md:h-16 bg-primary text-white hover:opacity-90 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-xl shadow-primary/20 p-2 overflow-hidden"
                  >
                    <span className="truncate">Buy It Now</span>
                  </Button>
                </div>
              </div>


              {/* Trust signals */}
              <div className="p-6 bg-[#fcfcfc] rounded-3xl border border-border/80 space-y-4">
                <div className="flex items-center gap-4">
                   <ShieldCheck size={20} className="text-primary" />
                   <div>
                      <p className="text-[11px] font-black uppercase tracking-wider">Quality Guaranteed</p>
                      <p className="text-[10px] text-muted-foreground font-medium italic">Inspected for executive perfection.</p>
                   </div>
                </div>
                <div className="border-t border-border/50 pt-4 flex items-center gap-4">
                   <Lock size={20} className="text-primary" />
                   <div>
                      <p className="text-[11px] font-black uppercase tracking-wider">Secure Checkout</p>
                      <p className="text-[10px] text-muted-foreground font-medium italic">Encrypted financial transactions.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="mt-20 pt-20 border-t border-border/50">
           <div className="max-w-4xl">
              <h3 className="text-2xl font-heading font-black uppercase tracking-tighter mb-8">Detailed Description</h3>
              <div className="prose prose-slate max-w-none text-muted-foreground font-medium italic leading-loose text-[17px]">
                {product.description.split('\n').map((para, i) => (
                  <p key={i} className="mb-6">{para}</p>
                ))}
              </div>
           </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32">
            <h3 className="text-3xl font-heading font-black uppercase tracking-tighter mb-12">You may also like</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p._id} product={p as any} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>



      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
           <button onClick={() => setShowVideo(false)} className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full transition-all">
             <Plus size={32} className="rotate-45" />
           </button>
           <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
              <iframe 
                src={product.video} 
                className="w-full h-full" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
           </div>
        </div>
      )}
    </div>
  );
}
