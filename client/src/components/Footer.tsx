import { Link } from "react-router-dom";
import { ShoppingBag, Heart, User, MapPin, Phone, Mail, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/services/api";

interface Category {
  _id: string;
  name: string;
}

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.data.categories.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch footer categories", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 lg:px-8 pt-24 pb-12">
        {/* Main Footer Grid - 5 Columns on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-16 mb-24">
          
          {/* Section 1: Brand & Narrative */}
          <div className="col-span-2 lg:col-span-1 space-y-8">
            <Link to="/" className="flex items-center group">
              <img 
                src="/images/logo.png" 
                alt="Prisha Crafts" 
                className="h-14 w-auto object-contain brightness-0 invert" 
              />
            </Link>
            <p className="text-sm text-background/70 leading-loose font-medium italic pr-4">
              "Curating the extraordinary for those who demand excellence in every facet of their estate and lifestyle."
            </p>
            <div className="flex gap-4">
              <Link to="/cart" className="w-12 h-12 flex items-center justify-center bg-background/10 text-white rounded-full">
                <ShoppingBag size={18} />
              </Link>
              <Link to="/wishlist" className="w-12 h-12 flex items-center justify-center bg-background/10 text-white rounded-full">
                <Heart size={18} />
              </Link>
              <Link to="/login" className="w-12 h-12 flex items-center justify-center bg-background/10 text-white rounded-full">
                <User size={18} />
              </Link>
            </div>
          </div>

          {/* Section 2: Navigations */}
          <div className="col-span-1 lg:pl-6">
            <h4 className="font-heading text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-white">Navigations</h4>
            <ul className="space-y-6 text-[12px] font-bold uppercase tracking-widest text-background/70">
              {[
                { name: "Home", path: "/" },
                { name: "Shop", path: "/shop" },
                { name: "Blogs", path: "/blog" },
                { name: "Wishlist", path: "/wishlist" },
                { name: "Cart", path: "/cart" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="flex items-center gap-3">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Categories */}
          <div className="col-span-1">
            <h4 className="font-heading text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-white">Categories</h4>
            <ul className="space-y-6 text-[12px] font-bold uppercase tracking-widest text-background/70">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat._id}>
                    <Link to={`/shop?category=${cat._id}`} className="flex items-center gap-3">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/shop">All Products</Link></li>
                  <li><Link to="/shop">Top Categories</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Section 4: Customer Care */}
          <div className="col-span-1">
            <h4 className="font-heading text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-white">Customer Care</h4>
            <ul className="space-y-6 text-[12px] font-bold uppercase tracking-widest text-background/70">
              {[
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms & Conditions", path: "/terms" },
                { name: "Return Policy", path: "/return" },
                { name: "Support", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="flex items-center gap-3">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 space-y-10">
            <h4 className="font-heading text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-white">Get in Touch</h4>
            <div className="space-y-7">
              <div className="flex gap-4 items-start">
                 <div className="mt-1 p-2 bg-background/10 rounded-lg text-white shrink-0">
                    <MapPin size={16} />
                 </div>
                 <p className="text-[13px] font-medium leading-relaxed text-background/80 italic">
                    Ring Road, Surat,<br/>Gujarat, India - 395002
                 </p>
              </div>
              <div className="flex gap-4 items-center">
                 <div className="p-2 bg-background/10 rounded-lg text-white shrink-0">
                    <Phone size={16} />
                 </div>
                 <p className="text-[13px] font-black tracking-wider text-background/90">
                    +91 99999 99999
                 </p>
              </div>
              <div className="flex gap-4 items-center">
                 <div className="p-2 bg-background/10 rounded-lg text-white shrink-0">
                    <Mail size={16} />
                 </div>
                 <p className="text-[13px] font-bold text-background/70 italic lowercase break-all">
                    info@prishacrafts.com
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Footer Bottom - Centered Copyright & Tagline */}
        <div className="flex flex-col items-center justify-center pt-8 md:pt-12 border-t border-white/5 gap-6 text-center">
            <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
              © {new Date().getFullYear()} PRISHA CRAFTS INDUSTRIES. All Rights Reserved.
            </p>
            <p className="text-[8px] font-black uppercase tracking-[0.6em] text-primary/40">
               Engineering Excellence • Artisanal Craftsmanship
            </p>
        </div>
      </div>
    </footer>
  );
}

