import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import api from "@/services/api";
import { toast } from "sonner";
import { Ticket, X, CheckCircle2 } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  mainImage: string;
  category: { name: string };
}

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data.data.products);
      } catch (error) {
        console.error("Failed to fetch products for cart", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const cartItems = cart.map((item) => {
    const product = products.find((p) => p._id === item.id);
    return product ? {
      ...product,
      quantity: item.quantity,
    } : null;
  }).filter(Boolean) as any[];

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * item.quantity,
    0
  );

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplying(true);
    try {
      const response = await api.post("/coupons/validate", {
        code: couponCode,
        amount: subtotal
      });
      setAppliedCoupon(response.data.data);
      localStorage.setItem("appliedCouponCode", couponCode);
      toast.success("Coupon applied successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
      localStorage.removeItem("appliedCouponCode");
    } finally {
      setIsApplying(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    localStorage.removeItem("appliedCouponCode");
  };

  const finalTotal = appliedCoupon ? appliedCoupon.finalAmount : subtotal;

  useEffect(() => {
    const savedCouponCode = localStorage.getItem("appliedCouponCode");
    if (savedCouponCode && subtotal > 0) {
      setCouponCode(savedCouponCode);
      // Auto-validate if subtotal is available
      const validateSaved = async () => {
        try {
          const response = await api.post("/coupons/validate", {
            code: savedCouponCode,
            amount: subtotal
          });
          setAppliedCoupon(response.data.data);
        } catch (error) {
          localStorage.removeItem("appliedCouponCode");
        }
      };
      if (!appliedCoupon) validateSaved();
    }
  }, [subtotal]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground font-body mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            Start Shopping
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground font-body">
          You have {cartCount} item{cartCount !== 1 ? "s" : ""} in your cart
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-secondary/30 rounded-2xl border border-border/50"
            >
              <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-secondary">
                <img src={item.mainImage} alt={item.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <Link to={`/product/${item._id}`} className="hover:text-primary transition-colors">
                  <h3 className="font-body font-bold text-lg mb-1">{item.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                  {item.category?.name || "Uncategorized"}
                </p>
                <p className="font-heading font-bold text-lg">
                  ₹{item.price.toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col sm:items-end justify-between gap-4">
                <div className="flex items-center gap-1 bg-background rounded-lg border border-border p-1">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="p-1.5 hover:bg-secondary rounded-md transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-body font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="p-1.5 hover:bg-secondary rounded-md transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="flex items-center gap-2 text-sm font-medium text-destructive hover:opacity-80 transition-opacity"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 sm:p-8 bg-secondary/50 rounded-3xl border border-border/50">
            <h2 className="text-xl font-heading font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-100 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Ticket size={14} />
                    <span>Discount ({appliedCoupon.code})</span>
                  </div>
                  <span>- ₹{appliedCoupon.discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-4 border-t border-border flex justify-between items-end">
                <span className="font-body font-bold">Total Amount</span>
                <span className="text-2xl font-heading font-bold text-primary">
                  ₹{finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Coupon Input */}
            <div className="mb-8 p-4 bg-background/50 rounded-2xl border border-border/50">
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1">Have a coupon?</p>
               {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
                     <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-primary" />
                        <span className="font-bold text-sm text-primary">{appliedCoupon.code}</span>
                     </div>
                     <button onClick={removeCoupon} className="p-1 hover:bg-primary/10 rounded-full transition-colors">
                        <X size={16} className="text-primary" />
                     </button>
                  </div>
               ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="flex-1 h-11 px-4 bg-white border border-border rounded-xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <button 
                      onClick={applyCoupon}
                      disabled={isApplying || !couponCode}
                      className="h-11 px-4 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {isApplying ? "..." : "Apply"}
                    </button>
                  </div>
               )}
            </div>

              <Link 
                to="/checkout"
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center"
              >
                Proceed to Checkout
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
