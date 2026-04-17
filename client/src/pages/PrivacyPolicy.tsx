import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-20 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <h1 className="text-3xl md:text-5xl font-heading font-black mb-12 uppercase tracking-tighter text-foreground">
          Privacy Policy
        </h1>

        <section>
          <h2 className="text-xl font-heading font-black mb-4 uppercase tracking-tight flex items-center gap-3 text-primary">
            <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs">01</span>
            Introduction
          </h2>
          <p className="text-muted-foreground leading-relaxed font-body font-medium">
            Welcome to Prisha Crafts. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website, use our services, or interact with us.
          </p>
        </section>

        <section className="space-y-6 px-4 border-l-4 border-primary pl-8 py-4">
          <h2 className="text-2xl font-heading font-bold text-foreground font-black tracking-tight underline selection:no-underline">Security of Your Data</h2>
          <p className="text-muted-foreground leading-relaxed font-body">
            We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, loss, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure.
          </p>
        </section>

        <section className="space-y-6 px-4">
          <h2 className="text-2xl font-heading font-bold text-foreground">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed font-body">
            If you have any questions or concerns about this Privacy Policy, please contact us at:
          </p>
          <div className="font-body space-y-1">
            <p className="font-bold">Prisha Crafts Support Team</p>
            <p className="text-muted-foreground">Email: privacy@meili.example</p>
            <p className="text-muted-foreground">Phone: +91 99999 99999</p>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
