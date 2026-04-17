import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, ShoppingBag, User, Menu, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();

  const baseLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Blog", path: "/blog" },
  ];

  const footerLinks = [
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border/40 luxury-shadow">
      <div className="container mx-auto flex items-center justify-between h-20 px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src="/images/logo.png" 
            alt="Prisha Crafts" 
            className="h-16 w-auto object-contain hover:opacity-80 transition-opacity"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
          {baseLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-black
                after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-primary
                after:origin-bottom-right after:scale-x-0 after:transition-transform after:duration-500
                hover:after:origin-bottom-left hover:after:scale-x-100
                ${location.pathname === link.path ? "text-primary after:scale-x-100" : "text-muted-foreground"}
              `}
            >
              {link.name}
            </Link>
          ))}

          {footerLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-black
                ${location.pathname === link.path ? "text-primary" : "text-muted-foreground"}
              `}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/wishlist" className="group relative p-3 hover:bg-secondary rounded-2xl transition-all" aria-label="Wishlist">
            <Heart size={20} fill={wishlist.length > 0 ? "currentColor" : "none"} className={`transition-colors ${wishlist.length > 0 ? 'text-red-500' : 'group-hover:text-primary'}`} />
            {wishlist.length > 0 && (
              <span className="absolute top-2 right-2 flex min-w-[16px] h-[16px] items-center justify-center rounded-full bg-black text-[9px] font-black text-white">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/cart" className="group relative p-3 hover:bg-secondary rounded-2xl transition-all" aria-label="Cart">
            <ShoppingBag size={20} className="group-hover:text-primary transition-colors" />
            {cartCount > 0 && (
              <span className="absolute top-2 right-2 flex min-w-[16px] h-[16px] items-center justify-center rounded-full bg-primary text-[9px] font-black text-white">
                {cartCount}
              </span>
            )}
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-2 p-1.5 bg-secondary/30 rounded-2xl border border-border/20 transition-all hover:border-primary/20">
               <Link to="/profile" className="w-8 h-8 rounded-xl bg-white border border-border/10 flex items-center justify-center luxury-shadow overflow-hidden group">
                  <User size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
               </Link>
               <Link to="/profile" className="text-[10px] font-black uppercase tracking-widest px-2 hidden sm:inline-block text-muted-foreground hover:text-black transition-colors">
                {user?.name?.split(' ')[0]}
              </Link>
            </div>
          ) : (
            <Link to="/login" className="p-3 hover:bg-secondary rounded-2xl transition-all text-muted-foreground hover:text-primary" aria-label="Account">
               <User size={20} />
            </Link>
          )}

          <button
            className="lg:hidden p-3 bg-secondary rounded-2xl transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-border/40 luxury-shadow z-40 overflow-hidden"
          >
            <div className="flex flex-col p-8 gap-1">
              {[...baseLinks, ...footerLinks].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`text-[11px] font-black uppercase tracking-widest py-5 px-6 rounded-2xl transition-all ${
                    location.pathname === link.path ? "bg-black text-white luxury-shadow" : "hover:bg-secondary/50 text-muted-foreground hover:text-black"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
