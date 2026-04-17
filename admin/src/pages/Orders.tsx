import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { ShoppingBag, Loader2, Package, Clock, CheckCircle, XCircle, Search, Trash2, X, Truck } from "lucide-react";
import { toast } from "sonner";

interface Order {
  _id: string;
  user: { name: string; email: string };
  items: Array<{
    product: { name: string; mainImage: string } | string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  totalAmount: number;
  couponCode?: string;
  discountAmount?: number;
  orderStatus: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus: string;
  paymentMethod: string;
  transactionId?: string;
  paymentDetails?: Record<string, string>;
  shippingDimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  createdAt: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Partial<Order>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      setPendingChanges({
        orderStatus: selectedOrder.orderStatus,
        paymentStatus: selectedOrder.paymentStatus,
        shippingDimensions: selectedOrder.shippingDimensions || {
          length: 0,
          width: 0,
          height: 0,
          weight: 0
        }
      });
    }
  }, [selectedOrder]);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data.data.orders);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    setIsSaving(true);
    try {
      const response = await api.patch(`/orders/${selectedOrder._id}/status`, pendingChanges);
      toast.success("Order updated successfully");
      const updatedOrder = response.data.data.order;
      setOrders(orders.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      setSelectedOrder(updatedOrder);
    } catch (error) {
      toast.error("Failed to update order");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/orders/${id}`);
      setOrders(orders.filter(o => o._id !== id));
      toast.success("Order deleted successfully");
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Processing": return <Clock className="text-amber-500" size={16} />;
      case "Shipped": return <Package className="text-blue-500" size={16} />;
      case "Delivered": return <CheckCircle className="text-green-500" size={16} />;
      case "Cancelled": return <XCircle className="text-red-500" size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in py-2 md:py-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tighter mb-1 uppercase text-foreground">Order Management</h1>
          <p className="text-muted-foreground text-sm font-medium italic">Track and process your customer orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-border/40 luxury-shadow overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/30">
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Order ID</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Products</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Shipping Status</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Price</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {orders.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center">
                     <ShoppingBag className="mx-auto text-muted-foreground/20 mb-4" size={48} />
                     <p className="text-muted-foreground italic font-medium">No order details found in the system.</p>
                   </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="group hover:bg-secondary/10 transition-colors">
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] sm:text-[11px] font-black text-foreground mb-1 uppercase tracking-tighter">#{order._id.slice(-8)}</span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase">{order.shippingAddress?.fullName || order.user?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center border border-border/20 overflow-hidden shrink-0">
                           {order.items[0]?.product && typeof order.items[0].product === 'object' ? (
                             <img src={(order.items[0].product as any).mainImage} className="w-full h-full object-cover" />
                           ) : <Package size={14} className="text-muted-foreground/30" />}
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-tight truncate max-w-[120px]">
                           {order.items[0]?.product && typeof order.items[0].product === 'object' ? (order.items[0].product as any).name : "Unknown Item"}
                           {order.items.length > 1 && <span className="text-primary ml-1">+{order.items.length - 1}</span>}
                         </p>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                        order.orderStatus === 'Processing' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        order.orderStatus === 'Shipped' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                         {getStatusIcon(order.orderStatus)}
                         {order.orderStatus}
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-[10px] sm:text-[11px] font-black text-foreground tracking-tighter">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="h-9 px-4 bg-secondary text-foreground rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-border transition-all flex items-center gap-2"
                        >
                          Details
                        </button>
                        <button 
                          onClick={() => deleteOrder(order._id)}
                          className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Order Modal */}
      {selectedOrder && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="bg-white w-full max-w-4xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/40 animate-zoom-in max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <div className="p-6 md:p-10 border-b border-border/10 flex justify-between items-center bg-secondary/5">
              <div>
                <h2 className="text-xl md:text-3xl font-heading font-black tracking-tighter uppercase mb-0.5 md:mb-1 text-foreground">Order Details</h2>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID: #{selectedOrder._id}</span>
                  <span className="hidden md:block w-1 h-1 bg-border rounded-full" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary italic">Date: {new Date(selectedOrder.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</span>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 md:p-3 hover:bg-white rounded-full transition-all shadow-sm">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 space-y-8 md:space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-8 md:space-y-10">
                  <section>
                    <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-primary mb-4">Customer Info</h3>
                    <div className="p-5 md:p-6 bg-secondary/20 rounded-xl md:rounded-2xl border border-border/10 space-y-1">
                      <p className="font-bold text-base md:text-lg">{selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name}</p>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">{selectedOrder.user?.email}</p>
                      <p className="text-xs md:text-sm font-bold text-foreground mt-2">{selectedOrder.shippingAddress?.phone}</p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-primary mb-4">Shipping Address</h3>
                    <div className="p-5 md:p-6 bg-secondary/20 rounded-xl md:rounded-2xl border border-border/10 space-y-1">
                      <p className="text-sm font-bold text-foreground">{selectedOrder.shippingAddress?.addressLine1}</p>
                      {selectedOrder.shippingAddress?.addressLine2 && (
                          <p className="text-sm text-foreground/70">{selectedOrder.shippingAddress?.addressLine2}</p>
                      )}
                      <p className="text-sm font-bold text-foreground">
                          {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">{selectedOrder.shippingAddress?.country}</p>
                    </div>
                  </section>
                </div>

                <div className="space-y-8 md:space-y-10">
                  <section>
                    <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-primary mb-4">Order Status</h3>
                    <div className="p-5 md:p-6 bg-secondary/20 rounded-xl md:rounded-2xl border border-border/10">
                       <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-border/40">
                          {getStatusIcon(pendingChanges.orderStatus || 'Processing')}
                          <select 
                            value={pendingChanges.orderStatus} 
                            onChange={(e) => setPendingChanges({ ...pendingChanges, orderStatus: e.target.value as any })}
                            className="bg-transparent text-sm font-black outline-none flex-1"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                       </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-primary mb-4">Payment Details</h3>
                    <div className="p-5 md:p-6 bg-secondary/20 rounded-xl md:rounded-2xl border border-border/10 flex justify-between items-center">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">Method</p>
                          <p className="text-xs font-bold">{selectedOrder.paymentMethod}</p>
                       </div>
                       <div className="text-right space-y-1">
                          <p className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">Status</p>
                          <select 
                            value={pendingChanges.paymentStatus} 
                            onChange={(e) => setPendingChanges({ ...pendingChanges, paymentStatus: e.target.value })}
                            className={`text-[10px] font-black uppercase bg-transparent outline-none ${pendingChanges.paymentStatus === "PAID" ? "text-green-600" : "text-amber-600"}`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            <option value="FAILED">FAILED</option>
                          </select>
                       </div>
                    </div>
                  </section>
                </div>
              </div>

              <section>
                <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-primary mb-6">Ordered Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-border/40 hover:bg-secondary/5 transition-colors">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-border/20 shadow-sm flex-shrink-0">
                        <img 
                          src={(item.product as any)?.mainImage || "https://placehold.co/100"} 
                          alt="product" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-foreground truncate">{(item.product as any)?.name || "Unknown Product"}</p>
                        <p className="text-[11px] font-medium text-muted-foreground/60 mt-0.5">₹{item.price.toLocaleString()} × {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white/50 p-6 md:p-8 rounded-[2rem] border border-border/40 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <Truck size={120} strokeWidth={1} />
                 </div>

                 <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className="p-2.5 bg-primary text-white rounded-lg shadow-lg">
                       <Truck size={18} />
                    </div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-primary">Shipping Details</h3>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6 relative z-10">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                         {selectedOrder.items.length === 1 ? "Total Order Dimensions (Synced with Product)" : "Total Package Metrics (Manual Entry Required)"}
                       </p>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black uppercase text-muted-foreground/40 ml-1">Length (cm)</label>
                             <input 
                               type="number" 
                               value={pendingChanges.shippingDimensions?.length || 0}
                               onChange={(e) => setPendingChanges({ 
                                 ...pendingChanges, 
                                 shippingDimensions: { ...pendingChanges.shippingDimensions || { length:0, width:0, height:0, weight:0 }, length: Number(e.target.value) } 
                               })}
                               className="w-full h-10 px-4 bg-white border border-border/60 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-primary/40 transition-all text-foreground"
                               placeholder={selectedOrder.items.length > 1 ? "" : "0"}
                             />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black uppercase text-muted-foreground/40 ml-1">Width (cm)</label>
                             <input 
                               type="number" 
                               value={pendingChanges.shippingDimensions?.width || 0}
                               onChange={(e) => setPendingChanges({ 
                                 ...pendingChanges, 
                                 shippingDimensions: { ...pendingChanges.shippingDimensions || { length:0, width:0, height:0, weight:0 }, width: Number(e.target.value) } 
                               })}
                               className="w-full h-10 px-4 bg-white border border-border/60 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-primary/40 transition-all text-foreground"
                               placeholder={selectedOrder.items.length > 1 ? "" : "0"}
                             />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black uppercase text-muted-foreground/40 ml-1">Height (cm)</label>
                             <input 
                               type="number" 
                               value={pendingChanges.shippingDimensions?.height || 0}
                               onChange={(e) => setPendingChanges({ 
                                 ...pendingChanges, 
                                 shippingDimensions: { ...pendingChanges.shippingDimensions || { length:0, width:0, height:0, weight:0 }, height: Number(e.target.value) } 
                               })}
                               className="w-full h-10 px-4 bg-white border border-border/60 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-primary/40 transition-all text-foreground"
                               placeholder={selectedOrder.items.length > 1 ? "" : "0"}
                             />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black uppercase text-muted-foreground/40 ml-1">Weight (kg)</label>
                             <input 
                               type="number" 
                               step="0.1"
                               value={pendingChanges.shippingDimensions?.weight || 0}
                               onChange={(e) => setPendingChanges({ 
                                 ...pendingChanges, 
                                 shippingDimensions: { ...pendingChanges.shippingDimensions || { length:0, width:0, height:0, weight:0 }, weight: Number(e.target.value) } 
                               })}
                               className="w-full h-10 px-4 bg-white border border-border/60 rounded-xl text-xs font-black outline-none focus:ring-1 focus:ring-primary/40 transition-all text-primary"
                               placeholder={selectedOrder.items.length > 1 ? "" : "0"}
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Product Reference Dimensions</p>
                       <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar">
                          {selectedOrder.items.map((item, idx) => {
                             const product = typeof item.product === 'object' ? item.product as any : null;
                             const dims = product?.shippingDimensions;
                             return (
                                <div key={idx} className="p-3 bg-white rounded-xl border border-border/40 flex justify-between items-center shadow-sm">
                                   <span className="text-[10px] font-bold truncate max-w-[120px] text-foreground/70">{product?.name || "Item"}</span>
                                   <div className="flex gap-3 text-[10px] font-black text-primary">
                                      {dims ? (
                                         <>
                                            <span>{dims.length}×{dims.width}×{dims.height} cm</span>
                                            <span className="text-muted-foreground/40 font-bold border-l border-border/40 pl-3">{dims.weight} KG</span>
                                         </>
                                      ) : <span className="text-muted-foreground text-[8px]">NO SPECS</span>}
                                   </div>
                                </div>
                             );
                          })}
                       </div>
                       {selectedOrder.items.length === 1 && (
                          <button 
                            onClick={() => {
                               const product = typeof selectedOrder.items[0].product === 'object' ? selectedOrder.items[0].product as any : null;
                               if (product?.shippingDimensions) {
                                   setPendingChanges({ ...pendingChanges, shippingDimensions: { ...product.shippingDimensions } });
                               }
                            }}
                            className="w-full py-3 bg-secondary/50 hover:bg-secondary text-foreground text-[9px] font-black uppercase tracking-widest transition-all rounded-xl border border-border/20"
                          >
                             Apply Product Dimensions to Package
                          </button>
                       )}
                    </div>
                 </div>
              </section>

              <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0">
                 <div className="space-y-2 w-full md:w-auto">
                    {selectedOrder.couponCode && (
                      <div className="flex justify-between items-center text-green-600 font-black uppercase tracking-widest text-[10px]">
                        <span>Coupon Applied ({selectedOrder.couponCode})</span>
                        <span className="ml-4">- ₹{selectedOrder.discountAmount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Grand Total</span>
                       <p className="text-3xl font-heading font-black text-primary tracking-tighter">₹{selectedOrder.totalAmount.toLocaleString()}</p>
                    </div>
                 </div>

                 <button
                   onClick={handleUpdateOrder}
                   disabled={isSaving}
                   className="w-full md:w-auto h-14 md:h-16 px-10 md:px-16 bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] md:text-[13px] rounded-xl md:rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 font-heading shadow-xl shadow-primary/20 disabled:opacity-50"
                 >
                   {isSaving ? <Loader2 className="animate-spin" size={18} /> : <span>Update Order Details</span>}
                 </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
