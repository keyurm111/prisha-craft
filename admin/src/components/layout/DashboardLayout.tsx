import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Image as ImageIcon, 
  Users, 
  ShoppingBag, 
  LogOut,
  ChevronRight,
  MessageSquare,
  FileText,
  Menu,
  X,
  Ticket,
  Settings,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', end: true },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: Layers, label: 'Categories', path: '/categories' },
  { icon: BarChart3, label: 'Ranking', path: '/rankings' },
  { icon: ImageIcon, label: 'Sliders', path: '/sliders' },
  { icon: Users, label: 'Users', path: '/users' },
  { icon: ShoppingBag, label: 'Orders', path: '/orders' },
  { icon: MessageSquare, label: 'Inquiries', path: '/inquiries' },
  { icon: FileText, label: 'Blogs', path: '/blogs' },
  { icon: Ticket, label: 'Coupons', path: '/coupons' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#faf9f6] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[90] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-border/40 flex flex-col p-6 luxury-shadow transition-transform duration-500 lg:relative lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="mb-12 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-heading font-black tracking-tighter uppercase whitespace-nowrap">PrishaCrafts<span className="text-primary text-5xl leading-none">.</span></h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 hover:bg-secondary rounded-full">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden no-scrollbar">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 pl-4 opacity-60">Admin Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => 
                cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] text-[12px] font-bold transition-all duration-300 group",
                  isActive 
                    ? "bg-primary text-primary-foreground luxury-shadow" 
                    : "text-[#64748b] hover:bg-secondary hover:text-primary"
                )
              }
            >
              <item.icon size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-300" />
              <span className="flex-1 font-body">{item.label}</span>
              <ChevronRight size={14} className={cn("opacity-20 group-hover:opacity-100 transition-opacity")} />
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-border/40">
          <Button 
            variant="ghost" 
            className="w-full h-14 flex items-center gap-4 px-5 rounded-[1.25rem] justify-start text-[11px] font-black uppercase tracking-widest text-[#ef4444] hover:bg-red-50 hover:text-[#ef4444] transition-all"
            onClick={handleLogout}
          >
            <LogOut size={18} strokeWidth={3} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto bg-transparent overflow-x-hidden relative">
          <header className="sticky top-0 right-0 left-0 h-20 lg:h-24 glass flex items-center justify-between px-4 lg:px-12 z-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-secondary rounded-xl transition-colors"
              >
                <Menu size={24} />
              </button>
              <div className="flex flex-col">
                <h2 className="text-xl lg:text-2xl font-heading font-bold tracking-tight">Admin Panel</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-6">
              <div className="hidden lg:block h-10 w-[1px] bg-border/60 mx-2" />
              <div className="flex items-center gap-3 p-1.5 lg:p-2 lg:pl-4 lg:bg-secondary/50 rounded-full border border-transparent lg:border-border/40">
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-foreground leading-none mb-1">Administrator</span>
                  <span className="text-[9px] font-bold text-muted-foreground/60 leading-none text-right">Store Manager</span>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-sm luxury-shadow border-2 lg:border-4 border-white shrink-0">
                  PC
                </div>
              </div>
            </div>
          </header>

          <div className="p-4 lg:p-12">
            <div className="max-w-[1600px] mx-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
