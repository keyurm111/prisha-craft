import { motion } from "framer-motion";

export default function TermsAndConditions() {
  const sections = [
    { title: "Acceptance of Terms", content: "By accessing or using Prisha Crafts (\"the Site\"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services." },
    { title: "User Obligations", content: "You agree to provide accurate, current, and complete information when creating an account and placing orders. You are responsible for all activities that occur under your account." },
    { title: "Intellectual Property", content: "All content on this Site, including text, graphics, logos, images, and software, is the property of Prisha Crafts and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without permission." },
    { title: "Limitation of Liability", content: "Prisha Crafts shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of our products or website. Our liability is limited to the purchase price of the specific product in question." },
    { title: "Governing Law", content: "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Surat, Gujarat." },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-20 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-16"
      >
        <div className="text-center mb-20 border-b-2 border-border pb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 block">Terms of Service</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black tracking-tight mb-4 text-foreground">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground font-body text-lg italic tracking-wide font-medium">
            Effective Date: March 22, 2026 | Read these terms carefully before using our services.
          </p>
        </div>

        <div className="space-y-12">
          {sections.map((section, index) => (
            <section key={section.title} className="space-y-6">
              <h2 className="text-2xl font-heading font-black text-foreground uppercase tracking-widest border-l-4 border-primary pl-6 py-2">
                {String(index + 1).padStart(2, '0')}. {section.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed font-body text-justify italic font-medium">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <section className="bg-primary/10 p-10 rounded-[3rem] border border-primary/20 text-center mt-20">
          <h2 className="text-2xl font-heading font-bold mb-4 text-foreground">Need Clarification?</h2>
          <p className="text-muted-foreground leading-relaxed font-body mb-8">
            If you have any questions about these Terms & Conditions, please reach out to us. We're here to help you understand our policies and your rights as a user.
          </p>
          <button className="bg-primary text-primary-foreground font-bold py-4 px-10 rounded-2xl hover:bg-primary/90 transition-all font-body tracking-widest uppercase text-sm">
            Contact Support Team
          </button>
        </section>
      </motion.div>
    </div>
  );
}
