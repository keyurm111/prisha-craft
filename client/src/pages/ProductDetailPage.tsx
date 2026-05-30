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
  Play,
  Facebook,
  Share2,
  Copy
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
  specifications?: Record<string, string>;
  variants?: Array<{
    _id: string;
    sku?: string;
    options: Record<string, string>;
    price?: number;
    mrp?: number;
    stock?: number;
    image?: string;
    images?: string[];
  }>;
  variantOptions?: Array<{
    name: string;
    values: string[];
  }>;
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
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

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
        
        if (productData.variants && productData.variants.length > 0) {
          const firstVariant = productData.variants[0];
          setSelectedOptions(firstVariant.options || {});
          if (firstVariant.image) {
            setActiveImage(firstVariant.image);
          }
        }
        
        // Fetch related products with fallback for single-product categories
        const relatedRes = await api.get(`/products?category=${productData.category._id}&limit=5`);
        let filteredRelated = relatedRes.data.data.products.filter((p: any) => p._id !== id).slice(0, 4);
        
        if (filteredRelated.length === 0) {
          const fallbackRes = await api.get(`/products?limit=5`);
          filteredRelated = fallbackRes.data.data.products.filter((p: any) => p._id !== id).slice(0, 4);
        }
        
        setRelatedProducts(filteredRelated);
      } catch (error) {
        console.error("Failed to fetch product details", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const selectedVariant = product?.variants?.find(v => {
    if (!v.options || !product.variantOptions) return false;
    return product.variantOptions.every(opt => {
      return v.options[opt.name] === selectedOptions[opt.name];
    });
  });

  useEffect(() => {
    if (selectedVariant && selectedVariant.image) {
      setActiveImage(selectedVariant.image);
    }
  }, [selectedVariant]);

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

  const hasVariants = product.variants && product.variants.length > 0;
  const isOutOfStock = hasVariants
    ? (selectedVariant 
        ? selectedVariant.stock === 0 
        : product.variants.every(v => v.stock === undefined || v.stock === 0))
    : product.stock === 0;

  const specsList: Array<{ label: string; value: string }> = [];
  if (product.specifications) {
    Object.entries(product.specifications).forEach(([key, val]) => {
      specsList.push({ label: key, value: val });
    });
  }
  if (product.variantOptions) {
    product.variantOptions.forEach(opt => {
      specsList.push({ label: opt.name, value: selectedOptions[opt.name] || "-" });
    });
  }

  const allImages = (() => {
    if (selectedVariant) {
      const variantGallery = selectedVariant.images || [];
      if (selectedVariant.image) {
        const baseList = variantGallery.includes(selectedVariant.image)
          ? variantGallery
          : [selectedVariant.image, ...variantGallery];
        return baseList;
      }
      if (variantGallery.length > 0) {
        return variantGallery;
      }
    }
    return [product.mainImage, ...(product.images || [])];
  })();

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast.error("Please select a valid variant combination");
      return;
    }
    const variantData = selectedVariant ? {
      id: selectedVariant._id,
      name: Object.entries(selectedVariant.options).map(([k, v]) => `${k}: ${v}`).join(" / "),
      options: selectedVariant.options
    } : undefined;

    addToCart(product._id, quantity, variantData);
    toast.success(`${product.name}${variantData ? ` (${variantData.name})` : ''} added to cart!`);
  };

  const handleBuyNow = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast.error("Please select a valid variant combination");
      return;
    }
    const variantData = selectedVariant ? {
      id: selectedVariant._id,
      name: Object.entries(selectedVariant.options).map(([k, v]) => `${k}: ${v}`).join(" / "),
      options: selectedVariant.options
    } : undefined;

    addToCart(product._id, quantity, variantData);
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
          <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-6 lg:sticky lg:top-28 self-start">
            {/* Thumbnails Sidebar / Row */}
            <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto p-1 pb-4 lg:pb-1 lg:pr-2 no-scrollbar lg:max-h-[calc(100vh-260px)] shrink-0 w-full lg:w-24">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 lg:w-full lg:h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${activeImage === img ? "border-primary shadow-md scale-[1.02]" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Image Viewport */}
            <div 
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              className="flex-1 relative group aspect-[4/5] max-h-[55vh] sm:max-h-[65vh] lg:max-h-[calc(100vh-260px)] w-full rounded-3xl overflow-hidden bg-secondary/30 ring-1 ring-border/50 cursor-zoom-in"
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={activeImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-100 ease-out" 
                  style={{
                    transform: isZoomed ? "scale(2.2)" : "scale(1)",
                    transformOrigin: isZoomed ? `${zoomPos.x}% ${zoomPos.y}%` : "center center"
                  }}
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
              
              {(() => {
                const displayPrice = selectedVariant && selectedVariant.price ? selectedVariant.price : product.price;
                const displayMrp = selectedVariant && selectedVariant.mrp ? selectedVariant.mrp : product.mrp;
                const displayStock = selectedVariant && selectedVariant.stock !== undefined ? selectedVariant.stock : product.stock;

                return (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex flex-col">
                        <span className="text-4xl font-heading font-black text-black">₹{displayPrice.toLocaleString()}</span>
                        {displayMrp > displayPrice && (
                          <div className="flex items-center gap-2">
                             <span className="text-muted-foreground line-through text-sm font-bold tracking-wider">₹{displayMrp.toLocaleString()}</span>
                             <span className="text-green-600 text-xs font-black uppercase">You Save ₹{(displayMrp - displayPrice).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className={`flex items-center gap-2 mb-8 ${displayStock < 10 ? "text-red-600 animate-pulse" : "text-green-600"}`}>
                      <Zap size={16} fill="currentColor" />
                      <span className="text-xs font-black uppercase tracking-widest">
                        {displayStock === 0 ? "Out of Stock" : displayStock < 10 ? `Hurry! Only ${displayStock} left in stock` : "In Stock"}
                      </span>
                    </div>
                  </>
                );
              })()}

              {/* Specifications Card */}
              {specsList.length > 0 && (
                <div className="mb-10">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-2 mb-4">Specifications</h4>
                   <div className="bg-[#fcfcfc] rounded-3xl border border-border p-6 space-y-1 bg-secondary/5">
                      {specsList.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-3 px-4 border-b border-border/40 last:border-0">
                           <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
                           <span className="text-xs font-bold text-foreground text-right">{item.value}</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}

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

              {/* Product Variants Selectors */}
              {product.variants && product.variants.length > 0 && product.variantOptions && product.variantOptions.length > 0 && (
                <div className="space-y-6 mb-8 p-6 bg-[#fcfcfc] border border-border/80 rounded-3xl">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-2 mb-4">Select Options</h4>
                  
                  {product.variantOptions.map((opt) => (
                    <div key={opt.name} className="space-y-2 last:mb-0 mb-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{opt.name}</label>
                      <div className="flex flex-wrap gap-2">
                        {opt.values.map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition-all ${selectedOptions[opt.name] === val ? "bg-black text-white border-black" : "bg-white border-border hover:bg-secondary"}`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
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
                    disabled={isOutOfStock}
                    className="h-14 md:h-16 bg-white text-black border-2 border-black hover:bg-black hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-xl shadow-black/5 p-2 overflow-hidden"
                  >
                    <ShoppingBag size={14} className="sm:size-5 shrink-0" />
                    <span className="truncate">Add to Cart</span>
                  </Button>
                  <Button 
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="h-14 md:h-16 bg-primary text-white hover:opacity-90 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-xl shadow-primary/20 p-2 overflow-hidden"
                  >
                    <span className="truncate">Buy It Now</span>
                  </Button>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="mb-8 p-6 bg-[#fcfcfc] rounded-3xl border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Share this craft</span>
                <div className="flex items-center gap-2">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Check out this beautiful handcrafted piece from Prisha Crafts: ${product.name} - ${window.location.href}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                    title="Share on WhatsApp"
                  >
                    <svg className="w-8 h-8" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="12" fill="#25D366" />
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="white" />
                    </svg>
                  </a>
                  
                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                    title="Share on Facebook"
                  >
                    <svg className="w-8 h-8" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="white" />
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
                    </svg>
                  </a>

                  {/* Pinterest */}
                  <a
                    href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(product.mainImage)}&description=${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                    title="Pin on Pinterest"
                  >
                    <svg className="w-8 h-8" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="white" />
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.41 7.61 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.204 0 1.031.397 2.138.893 2.738.1.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.621 0 11.988-5.367 11.988-11.987C23.971 5.367 18.605 0 12.017 0z" fill="#BD081C" />
                    </svg>
                  </a>

                  {/* Copy Link */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopied(true);
                      toast.success("Product link copied!");
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="w-8 h-8 rounded-full bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0f172a] border border-[#e2e8f0] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                    title="Copy Link"
                  >
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
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

              {/* Detailed Description */}
              <div className="mt-10 pt-10 border-t border-border/50">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-2 mb-4">Detailed Description</h4>
                 <div className="prose prose-slate max-w-none text-muted-foreground font-medium italic leading-loose text-sm">
                   {product.description.split('\n').map((para, i) => (
                     <p key={i} className="mb-4">{para}</p>
                   ))}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-16 border-t border-border/50">
            <div className="flex flex-col mb-12">
              <h3 className="text-3xl sm:text-4xl font-heading font-black uppercase tracking-tighter mb-2 leading-none">
                You May Also Like
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Handpicked premium crafts chosen just for you
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
