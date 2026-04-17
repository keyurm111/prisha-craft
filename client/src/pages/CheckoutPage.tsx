import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Truck, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  ShoppingBag,
  Loader2,
  Lock,
  Ticket,
  X,
  CheckCircle2
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { toast } from "sonner";

enum Step {
  Shipping = 1,
  Payment = 2,
  Confirmation = 3
}

interface Product {
  _id: string;
  name: string;
  price: number;
  mainImage: string;
}

export default function CheckoutPage() {
  const { cart, cartCount, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<Step>(Step.Shipping);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to proceed to checkout");
      navigate("/login?redirect=/checkout");
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data.data.products);
      } catch (error) {
        console.error("Failed to fetch products for checkout", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [isAuthenticated, navigate]);

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

  const totalAmount = appliedCoupon ? appliedCoupon.finalAmount : subtotal;

  useEffect(() => {
    const savedCouponCode = localStorage.getItem("appliedCouponCode");
    if (savedCouponCode && subtotal > 0 && !appliedCoupon) {
      setCouponCode(savedCouponCode);
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
      validateSaved();
    }
  }, [subtotal]);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    addressLine1: user?.shippingAddress?.addressLine1 || "",
    addressLine2: user?.shippingAddress?.addressLine2 || "",
    city: user?.shippingAddress?.city || "",
    state: user?.shippingAddress?.state || "",
    postalCode: user?.shippingAddress?.postalCode || "",
    phone: user?.phone || ""
  });

  useEffect(() => {
    if (user) {
      setShippingAddress({
        fullName: user.name || "",
        addressLine1: user.shippingAddress?.addressLine1 || "",
        addressLine2: user.shippingAddress?.addressLine2 || "",
        city: user.shippingAddress?.city || "",
        state: user.shippingAddress?.state || "",
        postalCode: user.shippingAddress?.postalCode || "",
        phone: user.phone || ""
      });
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Online">("COD");

  const handleCreateOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress,
        paymentMethod,
        totalAmount,
        couponCode: appliedCoupon?.code
      };

      await api.post("/orders", orderData);
      
      setCurrentStep(Step.Confirmation);
      clearCart();
      localStorage.removeItem("appliedCouponCode");
      toast.success("Order placed successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Order placement failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  if (cartCount === 0 && currentStep !== Step.Confirmation) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="text-3xl font-heading font-black mb-6">Your cart is empty</h2>
        <Link to="/shop" className="text-primary font-bold hover:underline">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Progress Stepper */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-border/40 -z-10" />
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary transition-all duration-700 -z-10`} style={{ width: `${(currentStep - 1) * 50}%` }} />
            
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2 lg:gap-3">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-500 luxury-shadow border-4 border-white ${currentStep >= s ? "bg-primary text-white scale-110" : "bg-white text-muted-foreground"}`}>
                  {s === 1 && (
                    <>
                      <MapPin size={16} className="lg:hidden" />
                      <MapPin size={20} className="hidden lg:block" />
                    </>
                  )}
                  {s === 2 && (
                    <>
                      <CreditCard size={16} className="lg:hidden" />
                      <CreditCard size={20} className="hidden lg:block" />
                    </>
                  )}
                  {s === 3 && (
                    <>
                      <CheckCircle size={16} className="lg:hidden" />
                      <CheckCircle size={20} className="hidden lg:block" />
                    </>
                  )}
                </div>
                <span className={`text-[8px] lg:text-[10px] font-black uppercase tracking-widest ${currentStep >= s ? "text-primary" : "text-muted-foreground"}`}>
                  {s === 1 && "Shipping"}
                  {s === 2 && "Payment"}
                  {s === 3 && "Success"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Main Form Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {currentStep === Step.Shipping && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl lg:rounded-[3rem] p-6 lg:p-12 luxury-shadow border border-border/40"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                      <Truck size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-heading font-black tracking-tighter uppercase">Shipping Address</h2>
                      <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">Where should we deliver your order?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                       <div className="relative">
                         <User className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                         <input 
                           type="text" 
                           placeholder="Enter your full name" 
                           value={shippingAddress.fullName}
                           onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                           className="w-full h-14 pl-14 pr-6 bg-secondary/30 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                         />
                       </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Street Address</label>
                       <div className="relative">
                         <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                         <input 
                           type="text" 
                           placeholder="House no., Building, Street" 
                           value={shippingAddress.addressLine1}
                           onChange={(e) => setShippingAddress({...shippingAddress, addressLine1: e.target.value})}
                           className="w-full h-14 pl-14 pr-6 bg-secondary/30 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                         />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">City</label>
                       <input 
                         type="text" 
                         placeholder="City" 
                         value={shippingAddress.city}
                         onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                         className="w-full h-14 px-6 bg-secondary/30 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">State / Province</label>
                       <input 
                         type="text" 
                         placeholder="State" 
                         value={shippingAddress.state}
                         onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                         className="w-full h-14 px-6 bg-secondary/30 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Postal Code</label>
                       <input 
                         type="text" 
                         placeholder="Pincode" 
                         value={shippingAddress.postalCode}
                         onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                         className="w-full h-14 px-6 bg-secondary/30 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                       <div className="relative">
                         <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                         <input 
                           type="text" 
                           placeholder="+91 XXXXX XXXXX" 
                           value={shippingAddress.phone}
                           onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                           className="w-full h-14 pl-14 pr-6 bg-secondary/30 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                         />
                       </div>
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col-reverse sm:flex-row justify-between gap-6">
                    <Link to="/cart" className="flex items-center justify-center sm:justify-start gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-black transition-all">
                      <ArrowLeft size={16} />
                      Back to Cart
                    </Link>
                    <button 
                      onClick={() => setCurrentStep(Step.Payment)}
                      className="h-14 lg:h-16 px-12 bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all luxury-shadow"
                    >
                      Continue
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === Step.Payment && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl lg:rounded-[3rem] p-6 lg:p-12 luxury-shadow border border-border/40"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-heading font-black tracking-tighter uppercase">Payment Method</h2>
                      <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">Select your preferred payment method.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div 
                      onClick={() => setPaymentMethod("COD")}
                      className={`p-8 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between ${paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-border/40 bg-secondary/20 hover:border-border"}`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "COD" ? "border-primary" : "border-muted-foreground/30"}`}>
                           {paymentMethod === "COD" && <div className="w-3 h-3 bg-primary rounded-full" />}
                        </div>
                        <div>
                          <h3 className="font-heading font-black uppercase tracking-wider">Cash on Delivery</h3>
                          <p className="text-[11px] text-muted-foreground font-bold">Pay when your order is delivered.</p>
                        </div>
                      </div>
                      <ShoppingBag className={paymentMethod === "COD" ? "text-primary" : "text-muted-foreground/20"} size={24} />
                    </div>

                    <div 
                      onClick={() => setPaymentMethod("Online")}
                      className={`p-8 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between opacity-60 grayscale cursor-not-allowed ${paymentMethod === "Online" ? "border-primary bg-primary/5" : "border-border/40 bg-secondary/20"}`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center border-muted-foreground/30`}>
                        </div>
                        <div>
                          <h3 className="font-heading font-black uppercase tracking-wider">Online Payment (UPI/Card)</h3>
                          <p className="text-[11px] text-muted-foreground font-bold italic">Currently unavailable — we're working on it!</p>
                        </div>
                      </div>
                      <Lock className="text-muted-foreground/20" size={24} />
                    </div>
                  </div>

                  <div className="mt-12 flex justify-between">
                    <button 
                      onClick={() => setCurrentStep(Step.Shipping)}
                      className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-black transition-all"
                    >
                      <ArrowLeft size={16} />
                      Back to Shipping
                    </button>
                    <button 
                      disabled={isSubmitting}
                      onClick={handleCreateOrder}
                      className="h-16 px-12 bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] flex items-center gap-3 hover:scale-[1.02] transition-all luxury-shadow disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                      Place Order
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === Step.Confirmation && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl lg:rounded-[3rem] p-8 lg:p-20 luxury-shadow border border-border/40 text-center"
                >
                  <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10">
                    <CheckCircle size={48} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-4xl font-heading font-black tracking-tighter uppercase mb-4 leading-none">Order Placed!</h2>
                  <p className="text-muted-foreground font-medium italic mb-12 max-w-sm mx-auto">
                    Thank you for your purchase. We've received your order and are preparing it for shipment.
                  </p>
                  
                  <div className="flex flex-col gap-4">
                    <Link 
                      to="/profile" 
                      className="h-16 bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-3 luxury-shadow hover:scale-[1.02] transition-all"
                    >
                      View Order History
                    </Link>
                    <Link 
                      to="/shop" 
                      className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-black transition-all mt-4"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Area: Order Summary */}
          <div className="lg:col-span-4 sticky top-28">
            <div className="bg-white rounded-[2.5rem] p-10 border border-border/40 luxury-shadow relative overflow-hidden">
               <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[60px]" />
               
               <h3 className="text-xl font-heading font-black mb-10 flex items-center gap-3 border-b border-border/10 pb-6 text-foreground/90 uppercase tracking-widest">
                Order Summary
               </h3>

               <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {cartItems.map((item) => (
                   <div key={item._id} className="flex gap-4">
                     <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary/30 shrink-0 border border-border/5">
                        <img src={item.mainImage} alt={item.name} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1">
                        <h4 className="text-[11px] font-black uppercase tracking-wider mb-1 text-foreground/90 line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Qty: {item.quantity}</p>
                     </div>
                     <span className="text-[12px] font-black text-primary">₹{(item.price * item.quantity).toLocaleString()}</span>
                   </div>
                 ))}
               </div>

               <div className="space-y-4 pt-6 border-t border-border/10">
                 <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                   <span>Items Subtotal</span>
                   <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
                 </div>
                 {appliedCoupon && (
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-primary">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>- ₹{appliedCoupon.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                 <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                   <span>Shipping Cost</span>
                   <span className="text-primary italic">FREE</span>
                 </div>
                 <div className="flex justify-between items-end pt-4">
                   <span className="text-[13px] font-black uppercase tracking-widest text-foreground">Grand Total</span>
                   <span className="text-3xl font-heading font-black text-primary leading-none">₹{totalAmount.toLocaleString()}</span>
                 </div>
               </div>

               {/* Coupon Code Input in Checkout */}
               <div className="mt-8 pt-6 border-t border-border/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3">Promo Code</p>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-primary" />
                        <span className="font-bold text-xs text-foreground uppercase">{appliedCoupon.code}</span>
                      </div>
                      <button onClick={removeCoupon} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                        <X size={14} className="text-muted-foreground" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                       <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        className="flex-1 h-11 px-4 bg-secondary/30 border border-border/10 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-primary/40 outline-none text-foreground placeholder:text-muted-foreground/30"
                      />
                      <button 
                        onClick={applyCoupon}
                        disabled={isApplying || !couponCode}
                        className="h-11 px-6 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-30"
                      >
                        {isApplying ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
