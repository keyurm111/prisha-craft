import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const wishlisted = isInWishlist(product._id);
  const discount = product.mrp && product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product._id, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative flex flex-col h-full touch-pan-y will-change-transform"
    >
      <div className="relative overflow-hidden rounded-2xl bg-secondary aspect-[4/5] shadow-sm group-hover:shadow-xl transition-[box-shadow] duration-500 will-change-[box-shadow]">
        <Link to={`/product/${product._id}`} className="block h-full w-full">
          <img
            src={product.mainImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
            loading="lazy"
          />
        </Link>

        {discount > 0 && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
            {discount}% OFF
          </div>
        )}

        {/* Wishlist and Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-[transform,opacity] duration-300">
          <button
            onClick={() => toggleWishlist(product._id)}
            className={`p-3 rounded-full bg-background/90 backdrop-blur-sm shadow-sm transition-transform hover:scale-110 ${
              wishlisted ? "text-destructive" : "text-foreground/60"
            }`}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleAddToCart}
            className="p-3 rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-110"
            aria-label="Add to cart"
          >
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>

      <div className="mt-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Link to={`/product/${product._id}`} className="flex-1">
            <h3 className="font-body font-bold text-base leading-snug hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <div className="flex flex-col items-end">
            <span className="font-heading font-bold text-lg text-foreground whitespace-nowrap">
              ₹{product.price.toLocaleString()}
            </span>
            {discount > 0 && (
              <span className="text-[10px] text-muted-foreground line-through">₹{product.mrp.toLocaleString()}</span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
}

