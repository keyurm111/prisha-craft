import { motion } from "framer-motion";
import { Target, Eye, Building2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-3xl md:text-5xl font-heading font-black mb-4 md:mb-6 text-center uppercase tracking-tighter leading-none">About Prisha Crafts</h1>
        <p className="text-sm md:text-lg text-muted-foreground font-medium text-center mb-10 md:mb-16 leading-relaxed italic px-4">
          Prisha Crafts is a legacy of artisanal excellence, specializing in premium handcrafted bags. As experienced manufacturers, we blend traditional craftsmanship with modern utility to create timeless accessories.
        </p>

        <div className="grid gap-12">
          <div className="flex gap-6 items-start">
            <div className="shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary">
              <Target size={22} />
            </div>
            <div>
              <h2 className="text-xl font-heading font-black mb-2 uppercase tracking-tight">Our Mission</h2>
              <p className="text-muted-foreground font-medium leading-relaxed">
                To empower artisans and provide our global community with handcrafted bags that tell a story of quality, durability, and sustainable design. We believe in high-character products that last a lifetime.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary">
              <Eye size={22} />
            </div>
            <div>
              <h2 className="text-xl font-heading font-black mb-2 uppercase tracking-tight">Our Vision</h2>
              <p className="text-muted-foreground font-medium leading-relaxed">
                To be the world's most trusted partner for handcrafted bags, recognized for our commitment to artisan welfare, manufacturing transparency, and uncompromising quality.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-heading font-black mb-2 uppercase tracking-tight">Legacy of Manufacturing</h2>
              <p className="text-muted-foreground font-medium leading-relaxed">
                With years of experience as dedicated bag manufacturers, Prisha Crafts handles everything from custom artisan pieces to bulk production for global retailers, ensuring the same level of care in every stitch.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
