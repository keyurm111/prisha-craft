import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { toast } from "sonner";
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Save, 
  Loader2, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  X,
  Ticket,
  LogOut
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Order {
  _id: string;
  totalAmount: number;
  couponCode?: string;
  discountAmount?: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: Array<{
    product: any;
    quantity: number;
    price: number;
    selectedVariant?: {
      id: string;
      name: string;
      options?: Record<string, string>;
    };
  }>;
}

export default function ProfilePage() {
  const { user, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  
  // Profile State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isUpdating, setIsUpdating] = useState(false);

  // Structured Address State
  const [addressLine1, setAddressLine1] = useState(user?.shippingAddress?.addressLine1 || "");
  const [area, setArea] = useState(user?.shippingAddress?.area || "");
  const [city, setCity] = useState(user?.shippingAddress?.city || "");
  const [state, setState] = useState(user?.shippingAddress?.state || "");
  const [postalCode, setPostalCode] = useState(user?.shippingAddress?.postalCode || "");
  const [country, setCountry] = useState(user?.shippingAddress?.country || "India");

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAddressLine1(user.shippingAddress?.addressLine1 || "");
      setArea(user.shippingAddress?.area || "");
      setCity(user.shippingAddress?.city || "");
      setState(user.shippingAddress?.state || "");
      setPostalCode(user.shippingAddress?.postalCode || "");
      setCountry(user.shippingAddress?.country || "India");
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  // Auto-detect address details from Postal Code
  useEffect(() => {
    const fetchAddressDetails = async () => {
      if (/^[1-9][0-9]{5}$/.test(postalCode)) {
        const toastId = toast.loading("Fetching address details for PIN code...");
        try {
          const response = await fetch(`https://api.postalpincode.in/pincode/${postalCode}`);
          const data = await response.json();
          
          if (data && data[0] && data[0].Status === "Success") {
            const postOffices = data[0].PostOffice;
            if (postOffices && postOffices.length > 0) {
              const info = postOffices[0];
              setArea(info.Name || "");
              setCity(info.District || info.Block || "");
              setState(info.State || "");
              setCountry("India");
              toast.success("Address details auto-filled!", { id: toastId });
            } else {
              toast.error("Invalid PIN code.", { id: toastId });
            }
          } else {
            toast.error("Invalid PIN code or service unavailable.", { id: toastId });
          }
        } catch (error) {
          console.error("Error fetching PIN code details:", error);
          toast.error("Failed to fetch PIN code details.", { id: toastId });
        }
      }
    };

    fetchAddressDetails();
  }, [postalCode]);

  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancellationForm, setShowCancellationForm] = useState(false);
  const [cancelReasonOption, setCancelReasonOption] = useState("Incorrect shipping address");
  const [customCancelNote, setCustomCancelNote] = useState("");

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await api.get("/orders/my-orders");
      setOrders(response.data.data.orders);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    setCancelReasonOption("Incorrect shipping address");
    setCustomCancelNote("");
    setShowCancellationForm(true);
  };

  const submitCancelOrder = async () => {
    if (!selectedOrder) return;
    
    let reason = cancelReasonOption;
    if (cancelReasonOption === "Changed my mind / Other") {
      if (!customCancelNote.trim()) {
        toast.error("Please enter a custom cancellation reason.");
        return;
      }
      reason = customCancelNote.trim();
    }
    
    setIsCancelling(true);
    try {
      const response = await api.post(`/orders/${selectedOrder._id}/cancel`, { cancellationReason: reason });
      if (response.data.status === "success") {
        const orderVal = response.data.data.order;
        if (orderVal.paymentMethod === "Online") {
          toast.success(
            `Order cancelled successfully! A full refund of ₹${orderVal.totalAmount.toLocaleString()} has been initiated and will reflect in your account in 5–7 business days (UPI methods are often instant).`,
            { duration: 8000 }
          );
        } else {
          toast.success("Order cancelled successfully!");
        }
        setShowCancellationForm(false);
        setCustomCancelNote("");
        await fetchOrders();
        setSelectedOrder(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const getItemImage = (item: any) => {
    const product = item.product;
    if (!product || typeof product !== 'object') {
      return "https://placehold.co/100";
    }
    
    if (item.selectedVariant?.id && product.variants) {
      let variant = product.variants.find((v: any) => {
        const vId = v._id || v.id;
        return vId && String(vId) === String(item.selectedVariant.id);
      });
      
      // Fallback to match by options if ID match fails (e.g. if variants were regenerated)
      if (!variant && item.selectedVariant.options) {
        variant = product.variants.find((v: any) => {
          const vOpt = v.options;
          const sOpt = item.selectedVariant.options;
          if (!vOpt || !sOpt) return false;
          
          const vOptObj = vOpt instanceof Map ? Object.fromEntries(vOpt) : vOpt;
          const sOptObj = sOpt instanceof Map ? Object.fromEntries(sOpt) : sOpt;
          
          const sKeys = Object.keys(sOptObj);
          if (sKeys.length === 0) return false;
          
          return sKeys.every(key => {
            const vVal = vOptObj[key];
            const sVal = sOptObj[key];
            return vVal !== undefined && String(vVal).toLowerCase() === String(sVal).toLowerCase();
          });
        });
      }
      
      if (variant?.image) {
        return variant.image;
      }
    }
    return product.mainImage || product.variants?.[0]?.image || "https://placehold.co/100";
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const shippingAddress = {
          addressLine1,
          area,
          city,
          state,
          postalCode,
          country
      };
      const response = await api.patch("/users/updateMe", { name, phone, shippingAddress });
      const { user: updatedUser } = response.data.data;
      const token = localStorage.getItem("token");
      if (token) login(token, updatedUser);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processing": return "text-amber-500 bg-amber-50 border-amber-100";
      case "Shipped": return "text-blue-500 bg-blue-50 border-blue-100";
      case "Delivered": return "text-green-500 bg-green-50 border-green-100";
      case "Cancelled": return "text-red-500 bg-red-50 border-red-100";
      default: return "text-muted-foreground bg-secondary border-border";
    }
  };

  return (
    <div className="container mx-auto py-28 px-4 lg:px-8 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-5xl font-heading font-black tracking-tighter mb-4 uppercase">My Account</h1>
        <div className="flex gap-4 border-b border-border">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === "profile" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            My Profile
            {activeTab === "profile" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab("orders")}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === "orders" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            My Orders
            {activeTab === "orders" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "profile" ? (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-[2.5rem] p-10 border border-border/40 shadow-sm flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-white text-5xl font-black mb-6 shadow-xl shadow-primary/20">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-heading font-black mb-2 uppercase">{user?.name}</h3>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-secondary rounded-full border border-border/40">
                  <Shield size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{user?.role} Account</span>
                </div>

                <div className="w-full h-[1px] bg-border/40 my-8" />

                <button 
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-destructive hover:opacity-70 transition-all group"
                >
                  <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                  Log Out Account
                </button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2.5rem] p-10 border border-border/40 shadow-sm">
                <form onSubmit={handleUpdate} className="space-y-12">
                   <div className="space-y-8">
                    {/* Basic Info Section */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 flex items-center gap-3">
                             <div className="w-1 h-3 bg-primary"></div>
                             Identity Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                <div className="relative">
                                    <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                                    <Input 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-14 pl-12 bg-secondary/30 border-none rounded-2xl font-bold"
                                    placeholder="Your Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                                    <Input 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+91 XXXXX XXXXX"
                                    className="h-14 pl-12 bg-secondary/30 border-none rounded-2xl font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 opacity-30" />
                                <Input 
                                value={email} 
                                disabled
                                className="h-14 pl-12 bg-secondary/10 border-none rounded-2xl font-bold text-muted-foreground cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address Section */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 flex items-center gap-3">
                             <div className="w-1 h-3 bg-primary"></div>
                             Shipping Address
                        </h4>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Address Line 1</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                                    <Input 
                                        value={addressLine1} 
                                        onChange={(e) => setAddressLine1(e.target.value)}
                                        placeholder="Street name, House No."
                                        className="h-14 pl-12 bg-secondary/30 border-none rounded-2xl font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Area</label>
                                <Input 
                                    value={area} 
                                    onChange={(e) => setArea(e.target.value)}
                                    placeholder="Area, Colony, Landmark, etc."
                                    className="h-14 px-6 bg-secondary/30 border-none rounded-2xl font-bold"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">City</label>
                                    <Input 
                                        value={city} 
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="City"
                                        className="h-14 px-6 bg-secondary/30 border-none rounded-2xl font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">State / Province</label>
                                    <Input 
                                        value={state} 
                                        onChange={(e) => setState(e.target.value)}
                                        placeholder="State"
                                        className="h-14 px-6 bg-secondary/30 border-none rounded-2xl font-bold"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Postal Code</label>
                                    <Input 
                                        value={postalCode} 
                                        onChange={(e) => setPostalCode(e.target.value)}
                                        placeholder="XXXXXX"
                                        className="h-14 px-6 bg-secondary/30 border-none rounded-2xl font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Country</label>
                                    <Input 
                                        value={country} 
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="h-14 px-6 bg-secondary/30 border-none rounded-2xl font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="h-16 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] gap-3 px-10 shadow-lg shadow-primary/20"
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Update Account
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="orders"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {isLoadingOrders ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-primary" size={48} />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] p-20 border border-border/40 shadow-sm text-center">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-muted-foreground/20 mx-auto mb-6">
                  <ShoppingBag size={40} />
                </div>
                <h3 className="text-xl font-heading font-black mb-2 uppercase">No Orders Yet</h3>
                <p className="text-muted-foreground italic mb-8">You haven't made any acquisitions yet.</p>
                <Button onClick={() => window.location.href = '/shop'} className="rounded-xl font-black uppercase tracking-widest text-[10px] px-8 py-6">
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white rounded-[2rem] p-5 lg:p-8 border border-border/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4 lg:gap-6 w-full md:w-auto">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0">
                        <ShoppingBag size={20} className="lg:hidden" />
                        <ShoppingBag size={24} className="hidden lg:block" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-primary truncate">Order #{order._id.slice(-8)}</span>
                          <span className={`text-[8px] lg:text-[9px] font-black uppercase tracking-widest px-2 lg:py-1 rounded-full border ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs lg:text-sm font-bold text-muted-foreground italic">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-4 lg:gap-8 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-border/10">
                       <div className="md:text-right">
                          <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-0.5">Items</span>
                          <p className="font-bold text-base lg:text-lg">{order.items?.length || 0}</p>
                       </div>
                       <div className="md:text-right">
                          <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-0.5">Total Amount</span>
                          <p className="font-heading font-black text-xl lg:text-2xl tracking-tighter text-primary">₹{order.totalAmount.toLocaleString()}</p>
                       </div>
                       <button 
                        onClick={() => setSelectedOrder(order)}
                        className="h-10 w-10 lg:h-12 lg:w-12 rounded-lg lg:rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all group-hover:bg-primary group-hover:text-white"
                       >
                         <ChevronRight size={18} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-4xl rounded-2xl lg:rounded-[3rem] overflow-hidden shadow-2xl border border-border/40 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 lg:p-10 border-b border-border/10 flex justify-between items-center bg-secondary/5">
                <div className="min-w-0 pr-4">
                  <h2 className="text-xl lg:text-3xl font-heading font-black tracking-tighter uppercase mb-1 text-foreground truncate">Order Details</h2>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                    <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate max-w-[150px] lg:max-w-none">ID: #{selectedOrder._id}</span>
                    <span className="hidden sm:block w-1 h-1 bg-border rounded-full" />
                    <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-primary italic">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 lg:p-3 hover:bg-white rounded-full transition-all shadow-sm shrink-0">
                  <X size={20} className="lg:hidden" />
                  <X size={24} className="hidden lg:block" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="p-6 bg-secondary/20 rounded-2xl space-y-2">
                       <Clock size={16} className="text-primary mb-2" />
                       <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Ordered On</span>
                       <p className="font-bold text-sm tracking-tight">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                   </div>
                   <div className="p-6 bg-secondary/20 rounded-2xl space-y-2">
                       <CheckCircle size={16} className="text-primary mb-2" />
                       <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Current Status</span>
                       <p className="font-bold text-sm tracking-tight uppercase tracking-widest">{selectedOrder.orderStatus}</p>
                   </div>
                   <div className="p-6 bg-secondary/20 rounded-2xl space-y-2">
                       <ShoppingBag size={16} className="text-primary mb-2" />
                       <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Total Value</span>
                       <p className="font-heading font-black text-xl text-primary">₹{selectedOrder.totalAmount.toLocaleString()}</p>
                   </div>
                </div>

                <section>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6 border-b border-border pb-2">Items Ordered</h4>
                    <div className="space-y-4">
                       {selectedOrder.items?.map((item, idx) => (
                         <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 p-4 lg:p-6 bg-secondary/5 rounded-2xl">
                             <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden bg-white border border-border/10 shrink-0 mx-auto sm:mx-0">
                                 <img src={getItemImage(item)} alt="" className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1 w-full text-center sm:text-left">
                                 <p className="font-bold text-sm lg:text-base uppercase tracking-tight line-clamp-1">{item.product?.name || "Product Item"}</p>
                                 {item.selectedVariant?.name && (
                                     <p className="text-[9px] text-primary font-black uppercase tracking-wider mt-0.5">Option: {item.selectedVariant.name}</p>
                                 )}
                                 <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                             </div>
                            <div className="w-full sm:w-auto text-center sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-border/10 sm:border-none">
                                <p className="font-bold text-sm lg:text-lg text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                </section>

                <div className="p-8 bg-secondary/30 rounded-3xl border border-divider space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase text-muted-foreground">Payment Method</span>
                        <span className="font-bold uppercase text-sm">{selectedOrder.paymentMethod}</span>
                    </div>
                    {selectedOrder.couponCode && (
                       <div className="flex justify-between items-center text-green-600 font-black uppercase tracking-widest text-[11px] py-3 border-y border-green-100">
                          <div className="flex items-center gap-2">
                             <Ticket size={14} />
                             <span>Coupon Used ({selectedOrder.couponCode})</span>
                          </div>
                          <span>- ₹{selectedOrder.discountAmount?.toLocaleString()}</span>
                       </div>
                    )}
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-xs font-black uppercase text-muted-foreground">Payment Status</span>
                        <span className={`font-black uppercase text-[10px] px-3 py-1 rounded-full ${
                          selectedOrder.paymentStatus === 'Paid' ? 'text-green-600 bg-green-50' : 
                          selectedOrder.paymentStatus === 'Refunded' ? 'text-blue-600 bg-blue-50' : 
                          selectedOrder.paymentStatus === 'Refund Pending' ? 'text-amber-600 bg-amber-50 animate-pulse' :
                          selectedOrder.paymentStatus === 'Refund Initiated' ? 'text-blue-500 bg-blue-50/50' :
                          selectedOrder.paymentStatus === 'Refund Failed' ? 'text-red-500 bg-red-50' :
                          selectedOrder.paymentStatus === 'Failed' ? 'text-red-600 bg-red-50' : 
                          'text-amber-600 bg-amber-50'
                        }`}>
                            {selectedOrder.paymentStatus}
                        </span>
                    </div>
                </div>

                {selectedOrder.orderStatus === "Processing" && (
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => handleCancelOrder(selectedOrder._id)}
                      disabled={isCancelling}
                      className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] tracking-widest uppercase rounded-xl transition-all shadow-md hover:shadow-red-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="animate-spin" size={14} />
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <span>Cancel Order</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancellation Reason Modal */}
      <AnimatePresence>
        {showCancellationForm && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-border/40 p-8 space-y-6 text-foreground"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-heading font-black tracking-tight uppercase">Cancel Your Order</h3>
                <p className="text-xs text-muted-foreground">
                  We are sorry to see you cancel. Please let us know the reason so we can improve our service.
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-semibold">Choose a reason:</label>
                {[
                  "Incorrect shipping address",
                  "Order placed by mistake",
                  "Found a better price elsewhere",
                  "Changed my mind / Other"
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      cancelReasonOption === reason
                        ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                        : "border-border/60 hover:bg-secondary/40 text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancellationReason"
                      value={reason}
                      checked={cancelReasonOption === reason}
                      onChange={() => setCancelReasonOption(reason)}
                      className="accent-primary w-4 h-4 shrink-0"
                    />
                    <span className="text-xs">{reason}</span>
                  </label>
                ))}
              </div>

              {cancelReasonOption === "Changed my mind / Other" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-semibold">
                    Custom Reason Details:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your reason here..."
                    value={customCancelNote}
                    onChange={(e) => setCustomCancelNote(e.target.value)}
                    className="w-full p-4 text-xs rounded-xl border border-border/60 outline-none focus:border-primary transition-all resize-none bg-white"
                    required
                  />
                </motion.div>
              )}

              {selectedOrder.paymentMethod === "Online" && (
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <span className="text-blue-500 text-lg">💡</span>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-wider font-semibold">Refund Information</p>
                    <p className="text-[11px] text-blue-700/80 leading-relaxed font-medium">
                      A full refund of <strong className="text-blue-900 font-bold">₹{selectedOrder.totalAmount.toLocaleString()}</strong> will be automatically credited back to your original payment method.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancellationForm(false)}
                  className="flex-1 py-4 hover:bg-secondary/40 border border-border/60 text-foreground font-black text-[10px] tracking-widest uppercase rounded-xl transition-all active:scale-95"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={submitCancelOrder}
                  disabled={isCancelling}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] tracking-widest uppercase rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm Cancel</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
