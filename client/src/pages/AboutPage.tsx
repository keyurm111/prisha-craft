import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Sparkles, 
  Factory, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  Boxes, 
  Clock, 
  Leaf, 
  HeartHandshake,
  Layers,
  Scissors,
  ShoppingBag,
  Briefcase,
  Luggage,
  PackageCheck
} from "lucide-react";
import SEO from "@/components/SEO";
import { buildBreadcrumbSchema, buildOrganizationSchema } from "@/lib/seo";
import { WHATSAPP_NUMBER } from "@/data/products";

export default function AboutPage() {
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
  ];

  const stats = [
    { value: "10+", label: "Years of Bag Crafting", subtext: "Artisan atelier in Surat, Gujarat" },
    { value: "50K+", label: "Handcrafted Bags Made", subtext: "Totes, duffles, backpacks & handbags" },
    { value: "100+", label: "Master Bag Craftsmen", subtext: "Skilled leather & canvas stitchers" },
    { value: "100%", label: "Hand-Inspected Quality", subtext: "12-point durability & load audit" },
  ];

  const bagCategories = [
    {
      title: "Artisanal Leather Totes",
      description: "Generously sized daily totes featuring reinforced shoulder straps, hand-burnished edges, and structured full-grain leather.",
      image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80",
      tag: "Everyday Luxury",
      icon: ShoppingBag,
    },
    {
      title: "Handcrafted Weekend Duffels",
      description: "Heavyweight canvas and vegetable-tanned leather travel bags engineered with reinforced load corners and solid brass hardware.",
      image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80",
      tag: "Travel & Utility",
      icon: Luggage,
    },
    {
      title: "Artisan Leather Backpacks",
      description: "Ergonomically balanced rucksacks crafted with saddle stitching, protective padded compartments, and heavy-gauge bonded threads.",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      tag: "Commute & Heritage",
      icon: Briefcase,
    },
    {
      title: "Crossbody & Handbags",
      description: "Refined compact silhouettes with precision edge beveling, magnetic brass clasps, and supple natural-grain texture.",
      image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
      tag: "Signature Style",
      icon: PackageCheck,
    },
  ];

  const pillars = [
    {
      icon: Scissors,
      title: "Master Bag Artisanship",
      description:
        "Every bag pattern is hand-cut and aligned to the grain. Master leatherworkers use traditional saddle stitching and hand-burnished edges for unbeatable resilience.",
      tag: "Handcrafted",
    },
    {
      icon: Leaf,
      title: "Premium Natural Materials",
      description:
        "We source vegetable-tanned leathers, heavy organic cotton canvas, solid cast brass buckles, and rust-proof zippers that develop a rich, timeless patina.",
      tag: "Sustainable",
    },
    {
      icon: Factory,
      title: "Bag Manufacturing Precision",
      description:
        "Our purpose-built bag manufacturing facility in Surat produces bespoke one-of-a-kind bags as seamlessly as large-scale OEM/ODM contract production runs.",
      tag: "Direct Factory",
    },
    {
      icon: ShieldCheck,
      title: "Reinforced for Decades",
      description:
        "Stress points, handles, and strap anchors receive multi-pass box stitching and heavy bonded nylon threads engineered never to rip or pull loose.",
      tag: "Built to Last",
    },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Material Grading & Leather Selection",
      description:
        "Our master craftsmen inspect raw full-grain hides and heavy organic canvas rolls for tensile strength, natural grain density, and flawless tactile texture.",
      image: "/images/process/step1-leather-selection.jpg",
      highlight: "Grade-A Hides & Duck Canvas",
    },
    {
      step: "02",
      title: "Precision Template Cutting & Skiving",
      description:
        "Bag panels, side gussets, and strap patterns are hand-cut with steel rulers and skived at edges to ensure seamless joints and ergonomic weight distribution.",
      image: "/images/process/step2-pattern-cutting.jpg",
      highlight: "Micrometer Pattern Alignment",
    },
    {
      step: "03",
      title: "Saddle-Stitching & Handle Assembly",
      description:
        "Handles, straps, and corner load anchors are hand-stitched using heavy bonded waxed threads clamped in a wooden stitching pony for indestructible seam strength.",
      image: "/images/process/step3-hand-stitching.jpg",
      highlight: "Reinforced Box & Cross Stitching",
    },
    {
      step: "04",
      title: "Edge Waxing, Hardware & 12-Point QA",
      description:
        "Edges are hand-burnished with natural beeswax, solid cast brass buckles are torque-tested, and every completed bag undergoes a rigorous 12-point quality audit.",
      image: "/images/process/step4-hardware-inspection.jpg",
      highlight: "Solid Brass & 12-Point Audit",
    },
  ];

  const manufacturingHighlights = [
    "Custom Bag Private Labeling & Logo Debossing",
    "Bespoke Corporate Bag Gifting & Event Collections",
    "Rapid Prototype & Bag Sample Turnaround",
    "Wholesale OEM/ODM Contract Bag Manufacturing",
    "Strict 12-Point Multi-Tier Bag Quality Testing",
    "Direct Factory Pricing with Global Export Support",
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <SEO
        title="About Us | Prisha Crafts - Handcrafted Bag Manufacturers"
        description="Learn about Prisha Crafts, premier manufacturers of handcrafted artisan leather bags, canvas totes, backpacks, and utility accessories based in Surat, Gujarat, India."
        canonicalPath="/about"
        image="https://images.unsplash.com/photo-1547949003-9792a18a2601?w=1200&q=80"
        jsonLd={[
          buildOrganizationSchema(),
          buildBreadcrumbSchema(breadcrumbItems),
        ]}
      />

      {/* Breadcrumb Bar */}
      <div className="border-b border-border/40 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8 py-3.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground font-black">About Us</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 md:pb-24 border-b border-border/40">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-12 md:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-[11px] font-black uppercase tracking-[0.25em] text-primary mb-6">
              <Sparkles size={14} />
              <span>Surat, Gujarat • Artisanal Bag Manufacturers</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-heading font-black tracking-tight uppercase leading-[1.05] mb-6 text-foreground">
              Mastery in Every Stitch, <br className="hidden sm:inline" />
              <span className="italic font-normal">Integrity</span> in Every Bag
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl mx-auto">
              Prisha Crafts is an artisanal bag manufacturing atelier dedicated to handcrafting genuine leather totes, heavy canvas duffels, backpacks, and bespoke accessories. We combine generational Indian craftsmanship with modern manufacturing discipline to create bags engineered to last a lifetime.
            </p>
          </motion.div>

          {/* Hero Visual Collage of Handcrafted Bags */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-stretch max-w-6xl mx-auto"
          >
            {/* Primary Large Bag Image */}
            <div className="md:col-span-8 relative rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/60 group h-[320px] sm:h-[420px] md:h-[500px]">
              <img
                src="https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1400&q=80"
                alt="Handcrafted leather tote bag made at Prisha Crafts workshop"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 inline-block mb-2">
                    Our Handcrafted Bags
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-black leading-tight">
                    Artisanal Leather & Canvas Bags
                  </h2>
                  <p className="text-xs sm:text-sm text-white/80 font-medium max-w-md mt-1">
                    Every bag is precision cut, saddle-stitched, and burnished by master bag artisans in Surat.
                  </p>
                </div>

                <div className="shrink-0 bg-white/95 text-black px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 backdrop-blur-md">
                  <Award size={18} className="text-primary" />
                  <span className="text-xs font-black uppercase tracking-wider">100% Handcrafted</span>
                </div>
              </div>
            </div>

            {/* Side Dual Handcrafted Bag Cards */}
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-6">
              <div className="relative rounded-3xl md:rounded-[2rem] overflow-hidden shadow-lg border border-border/60 group h-[180px] sm:h-[200px] md:h-[238px]">
                <img
                  src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"
                  alt="Handcrafted leather shoulder bag with precision stitching"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Signature Handbags</p>
                  <p className="text-sm font-black font-heading leading-tight">Full-Grain Leather & Brass</p>
                </div>
              </div>

              <div className="relative rounded-3xl md:rounded-[2rem] overflow-hidden shadow-lg border border-border/60 group h-[180px] sm:h-[200px] md:h-[238px]">
                <img
                  src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
                  alt="Handcrafted leather backpack and travel gear"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Durable Backpacks</p>
                  <p className="text-sm font-black font-heading leading-tight">Reinforced Structural Seams</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="py-12 md:py-16 bg-secondary/50 border-b border-border/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-card p-6 md:p-8 rounded-3xl border border-border/50 shadow-sm text-center flex flex-col justify-center"
              >
                <p className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-foreground tracking-tight mb-2">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-primary mb-1">
                  {stat.label}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {stat.subtext}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Handcrafted Bag Categories Showcase */}
      <section className="py-16 md:py-24 border-b border-border/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-[10px] font-black uppercase tracking-widest text-primary mb-4">
              <ShoppingBag size={14} />
              <span>Our Bag Collections</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black uppercase tracking-tight">
              Handcrafted Bags Built for Every Journey
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-medium mt-4">
              From daily artisan totes to heavy-duty canvas travel duffels, each piece is engineered with meticulous attention to detail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {bagCategories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-card rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        {cat.tag}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon size={18} />
                      </div>
                      <h3 className="text-lg font-heading font-black uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:translate-x-1 transition-transform"
                    >
                      <span>Explore Bags</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story & Heritage Section */}
      <section className="py-16 md:py-24 bg-secondary/20 border-b border-border/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            
            {/* Story Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary border border-border/60 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <Clock size={12} className="text-primary" />
                <span>Our Bag Atelier & Heritage</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black uppercase tracking-tight leading-tight">
                Born in Surat: Dedicated to the Fine Art of Bag Making
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
                <p>
                  Prisha Crafts was founded in Surat, Gujarat — a city steeped in world-renowned textile production and artisan handcrafting. What started as a dedicated bag-making atelier has evolved into a premier handcrafted bag manufacturing house.
                </p>
                <p>
                  Unlike mass-produced, fast-fashion bags that wear out in months, our bags are built from heavy organic cotton canvas, full-grain leathers, solid brass hardware, and heavy-duty bonded nylon threads. Every corner gusset, strap anchor, and zipper seam is reinforced to handle daily wear with ease.
                </p>
                <p>
                  By handling every step of the bag manufacturing process in-house — from hide grading and pattern cutting to hand stitching, wax burnishing, and 12-point quality testing — we ensure our customers receive luxury artisan bags directly from the makers.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-secondary/60 border-l-4 border-primary mt-6">
                <p className="font-heading italic text-base sm:text-lg text-foreground font-bold leading-snug">
                  "A handcrafted bag is an intimate companion. It should carry your essentials reliably, age gracefully with a beautiful patina, and reflect the skill of the artisan who made it."
                </p>
                <p className="text-[11px] font-black uppercase tracking-widest text-primary/80 mt-3">
                  — Master Bag Makers at Prisha Crafts
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <CheckCircle2 size={16} className="text-primary" />
                  <span>100% Genuine Full-Grain & Heavy Canvas</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <CheckCircle2 size={16} className="text-primary" />
                  <span>Reinforced Box Stitching on All Straps</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <CheckCircle2 size={16} className="text-primary" />
                  <span>Direct-from-Workshop Pricing</span>
                </div>
              </div>
            </motion.div>

            {/* Story Visual Frame with Bag Crafting Tools & Leather */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/80 group">
                <img
                  src="https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=1000&q=80"
                  alt="Artisan leather bag making workbench and tools"
                  className="w-full h-[400px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-xl text-black">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                      <Scissors size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider">Artisan Bag Atelier</p>
                      <p className="text-[11px] text-muted-foreground font-medium">Handcrafted in Surat with master leathercraft tools</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Core Pillars / Values Grid */}
      <section className="py-16 md:py-24 bg-secondary/30 border-b border-border/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-[10px] font-black uppercase tracking-widest text-primary mb-4">
              <Layers size={14} />
              <span>The Prisha Bag Standard</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black uppercase tracking-tight">
              Four Pillars of Our Bag Craft
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-medium mt-4">
              Our uncompromising standards ensure every bag looks exceptional and performs flawlessly for years.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-card rounded-3xl p-8 border border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Icon size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-secondary/80 text-muted-foreground">
                        {pillar.tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-heading font-black uppercase tracking-tight mb-3 group-hover:text-primary transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border/40 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary">
                    <span>Guaranteed Durability</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Making Process Section */}
      <section className="py-16 md:py-24 border-b border-border/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary border border-border/60 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
              <Boxes size={14} className="text-primary" />
              <span>Bag Crafting Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black uppercase tracking-tight">
              The Journey of a Prisha Handcrafted Bag
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-medium mt-4">
              From raw full-grain hides and heavy canvas to finished artisan bags ready for daily adventures.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-card rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                  
                  <div className="absolute top-3 left-3 bg-black/85 text-white backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase border border-white/15">
                    Step {step.step}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/90 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 inline-block">
                      {step.highlight}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-heading font-black tracking-tight uppercase mb-2 group-hover:text-primary transition-colors leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bag Manufacturing & Bulk Supply / OEM Section */}
      <section className="py-16 md:py-24 bg-secondary/40 border-b border-border/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-[10px] font-black uppercase tracking-widest text-primary">
                <Factory size={14} />
                <span>Bulk Bag Supply & OEM / ODM Manufacturing</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black uppercase tracking-tight leading-tight">
                Your Trusted Bag Manufacturing Partner for Custom & Bulk Orders
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
                Whether you are a boutique fashion designer launching a signature tote line, an e-commerce brand scaling handcrafted leather backpacks, or a corporation seeking premium leather executive bags — Prisha Crafts delivers industrial volume with artisanal fidelity.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {manufacturingHighlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-foreground">
                    <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap gap-4 items-center">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'm interested in bulk bag manufacturing & OEM inquiries with Prisha Crafts.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-primary text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-black/10 hover:scale-105"
                >
                  <MessageSquare size={16} />
                  <span>Bulk Bag Order WhatsApp</span>
                </a>

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest border border-border/80 bg-white hover:bg-secondary transition-all"
                >
                  <span>Request Bag Factory Quote</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-card rounded-3xl md:rounded-[2.5rem] p-8 md:p-10 border border-border/60 shadow-xl space-y-8">
                <div className="border-b border-border/40 pb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Factory Direct Contact</span>
                  <h3 className="text-2xl font-heading font-black tracking-tight uppercase mt-1">Get in Touch with Our Bag Atelier</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                    Connect with our technical bag manufacturing team for leather swatches, prototype requests, and volume pricing.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bag Atelier & Works</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">Ring Road, Surat, Gujarat, India - 395002</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Direct Line & WhatsApp</p>
                      <a href="tel:+919638482348" className="text-sm font-bold text-foreground hover:text-primary transition-colors block mt-0.5">
                        +91 96384 82348
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Official Bag Inquiries</p>
                      <a href="mailto:info@prishacrafts.com" className="text-sm font-bold text-foreground hover:text-primary transition-colors block mt-0.5">
                        info@prishacrafts.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-secondary/70 border border-border/40 flex items-center gap-3">
                  <HeartHandshake size={20} className="text-primary shrink-0" />
                  <p className="text-xs font-medium text-muted-foreground">
                    Private label bag consultations available. We offer complete confidentiality (NDA supported).
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 md:py-28 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_70%)]" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center max-w-4xl">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-background/60 bg-white/10 px-4 py-1.5 rounded-full border border-white/10 inline-block mb-6">
            Timeless Leathercraft & Canvas Bags
          </span>
          
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading font-black uppercase tracking-tight mb-6">
            Experience the Distinction of Prisha Crafts Bags
          </h2>
          
          <p className="text-sm sm:text-lg text-background/70 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Explore our curated catalog of handcrafted leather totes, backpacks, canvas duffels, and accessories or consult our workshop for bespoke bag manufacturing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/shop"
              className="w-full sm:w-auto bg-primary text-white font-black py-4 px-10 rounded-2xl hover:bg-white hover:text-black transition-all text-xs tracking-widest uppercase shadow-xl hover:scale-105"
            >
              Explore Bag Collection
            </Link>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I want to inquire about handcrafted bags from Prisha Crafts.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-white/10 text-white font-black py-4 px-10 rounded-2xl hover:bg-white/20 transition-all text-xs tracking-widest uppercase border border-white/20 hover:scale-105 flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              <span>Chat on WhatsApp (+91 96384 82348)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
