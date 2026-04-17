import { motion } from "framer-motion";

export default function ReturnPolicy() {
  const steps = [
    { title: "Review Policy", content: "Check the criteria for returns and ensure your item is eligible for return within 30 days of purchase." },
    { title: "Initiate Return", content: "Contact us through WhatsApp or our return portal to request a Return Authorization Number (RAN)." },
    { title: "Pack & Ship", content: "Securely pack your item in its original packaging and include the RAN. Ship to our warehouse." },
    { title: "Get Refunded", content: "Once we receive and inspect your return, we'll process your refund within 5-7 business days." },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-20 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-24"
      >
        <div className="text-center mb-24 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-6 block font-body">Hassle-Free Returns</span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black tracking-tight mb-8 text-foreground leading-[1.1]">
            Return Policy
          </h1>
          <p className="text-muted-foreground font-body text-xl italic tracking-wide font-medium leading-relaxed">
            Not completely satisfied? We're here to help you find the perfect solution with our simple, transparent return process.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="p-10 bg-secondary/20 rounded-[3rem] border border-border/50 text-center relative overflow-hidden group">
              <span className="absolute -top-4 -right-4 text-9xl font-heading font-black text-foreground/5 transition-transform group-hover:scale-110">
                {index + 1}
              </span>
              <h3 className="font-heading font-black text-lg mb-4 text-primary uppercase tracking-widest">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-body font-medium">{step.content}</p>
            </div>
          ))}
        </section>

        <section className="space-y-16 py-20 border-y border-border/50">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-center text-foreground">Return Criteria</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-4xl mx-auto">
            <div className="p-8 bg-green-50/50 rounded-3xl border border-green-100 flex flex-col items-center">
              <h3 className="font-heading font-black text-xl mb-4 text-green-700 uppercase tracking-widest">Eligible Returns</h3>
              <ul className="space-y-4 text-green-800/70 font-body font-medium text-sm text-center">
                <li>Unused items in original condition</li>
                <li>Items within 30 days of delivery</li>
                <li>Original packaging must be intact</li>
                <li>Proof of purchase is required</li>
              </ul>
            </div>
            <div className="p-8 bg-red-50/50 rounded-3xl border border-red-100 flex flex-col items-center">
              <h3 className="font-heading font-black text-xl mb-4 text-red-700 uppercase tracking-widest">Ineligible Returns</h3>
              <ul className="space-y-4 text-red-800/70 font-body font-medium text-sm text-center">
                <li>Items showing signs of usage</li>
                <li>Clearance and final sale items</li>
                <li>Items damaged after delivery</li>
                <li>Perishable and hygienic products</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="text-center py-20 bg-foreground text-background rounded-[4rem] px-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.1),transparent)]" />
          <h2 className="text-3xl md:text-4xl font-heading font-black mb-6">Need Immediate Assistance?</h2>
          <p className="text-background/70 font-body text-lg mb-12 max-w-2xl mx-auto h-auto leading-relaxed font-medium">
            Contact our customer support team directly for any issues or questions regarding your return. We're here to make things right.
          </p>
          <button className="bg-primary text-primary-foreground font-black py-5 px-14 rounded-2xl hover:bg-primary/95 transition-all font-body text-sm tracking-[0.15em] uppercase hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20">
            Chat on WhatsApp Now
          </button>
        </section>
      </motion.div>
    </div>
  );
}
