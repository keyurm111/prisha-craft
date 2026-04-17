import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import api from "@/services/api";
import { Product } from "@/data/products";

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        const response = await api.get("/products");
        const allProducts = response.data.data.products;
        setProducts(allProducts.filter((p: Product) => wishlist.includes(p._id)));
      } catch (error) {
        console.error("Failed to fetch wishlist products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWishlistProducts();
  }, [wishlist]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <div className="flex items-center gap-4 mb-4">
          <Heart size={36} className="text-red-500" fill="currentColor" />
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tighter uppercase">My Wishlist</h1>
        </div>
        <p className="text-muted-foreground font-medium italic">{products.length} executive piece{products.length !== 1 ? "s" : ""} saved</p>
      </motion.div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-secondary/20 rounded-[3rem] border border-border/20">
          <Heart size={64} className="mx-auto mb-6 text-muted-foreground/20" />
          <p className="text-xl font-medium italic text-muted-foreground mb-8">Your wishlist selection is currently vacant.</p>
          <Link
            to="/shop"
            className="inline-flex items-center px-10 py-4 bg-primary text-white font-black text-[11px] tracking-widest uppercase rounded-full hover:opacity-90 transition-all luxury-shadow"
          >
            Explore Showroom
          </Link>
        </div>
      )}
    </div>
  );
}
