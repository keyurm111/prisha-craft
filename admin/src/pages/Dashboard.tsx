import { useState, useEffect } from "react";
import api from "@/services/api";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  Clock,
  Package,
  Calendar,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalInquiries: number;
  recentOrders: any[];
  recentInquiries: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [oRes, pRes, uRes, iRes] = await Promise.all([
        api.get("/orders"),
        api.get("/products"),
        api.get("/users"),
        api.get("/inquiries")
      ]);

      const orders = oRes.data.data.orders;
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      
      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: pRes.data.results || 0,
        totalInquiries: iRes.data.data.inquiries.length,
        recentOrders: orders.slice(0, 5),
        recentInquiries: iRes.data.data.inquiries.slice(0, 5)
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-10 animate-fade-in py-2 md:py-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tighter mb-2 uppercase text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm font-medium italic">
            Store performance and recent activity.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-2xl border border-border/40">
          <Calendar size={16} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Earnings" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon={<DollarSign size={24} />} 
          trend="+12.5%" 
          trendType="up"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={<ShoppingBag size={24} />} 
          trend="+8.2%" 
          trendType="up"
        />
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={<Package size={24} />} 
          trend="Static" 
          trendType="neutral"
        />
        <StatCard 
          title="Customer Messages" 
          value={stats.totalInquiries} 
          icon={<MessageSquare size={24} />} 
          trend="-2.4%" 
          trendType="down"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        {/* Recent Orders Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-heading font-black uppercase tracking-tight">Recent Orders</h2>
            <Link to="/orders" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
              View All Orders <ChevronRight size={12} />
            </Link>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-border/40 luxury-shadow overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/20 bg-secondary/10">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-secondary/5 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-foreground">{order.user?.name || "Anonymous User"}</span>
                          <span className="text-[10px] text-muted-foreground font-bold">Ref: #{order._id.slice(-6)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                            order.orderStatus === 'Processing' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-secondary/50 text-muted-foreground border-border/30'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                         <span className="text-[10px] font-bold text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-sm">
                        ₹{order.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {stats.recentOrders.length === 0 && (
               <div className="p-20 text-center italic text-muted-foreground font-medium">No orders found.</div>
            )}
          </div>
        </div>

        {/* Recent Inquiries List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-heading font-black uppercase tracking-tight">Recent Messages</h2>
            <Link to="/inquiries" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
               View All <ChevronRight size={12} />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.recentInquiries.map((inquiry) => (
              <div key={inquiry._id} className="p-5 bg-white rounded-2xl md:rounded-[1.5rem] border border-border/40 luxury-shadow flex items-start gap-4 hover:border-primary/20 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-black shrink-0">
                  {inquiry.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-foreground truncate">{inquiry.subject}</p>
                  <p className="text-[10px] text-muted-foreground font-bold truncate mb-2">{inquiry.name}</p>
                  <div className="flex items-center gap-2 text-[9px] text-primary font-black uppercase tracking-tighter">
                    <Clock size={10} />
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {stats.recentInquiries.length === 0 && (
               <div className="p-10 bg-secondary/10 rounded-3xl border border-dashed border-border text-center italic text-muted-foreground text-sm font-medium">No messages found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendType }: { title: string, value: string | number, icon: React.ReactNode, trend: string, trendType: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-border/40 luxury-shadow hover:scale-[1.02] transition-transform duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-primary/5 text-primary rounded-2xl">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
          trendType === 'up' ? 'text-green-600 bg-green-50' : 
          trendType === 'down' ? 'text-red-600 bg-red-50' : 
          'text-muted-foreground bg-secondary'
        }`}>
          {trendType === 'up' && <ArrowUpRight size={12} />}
          {trendType === 'down' && <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{title}</p>
        <h3 className="text-2xl md:text-3xl font-heading font-black tracking-tighter">{value}</h3>
      </div>
    </div>
  );
}
