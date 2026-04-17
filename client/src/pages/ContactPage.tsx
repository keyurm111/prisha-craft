import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Loader2, Send } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Product Inquiry",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/inquiries", formData);
      setSubmitted(true);
      toast.success("Inquiry sent successfully. Our team will contact you soon.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send inquiry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-10 lg:mb-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-black tracking-tighter mb-4 pr-1 leading-none uppercase">Contact Us</h1>
          <p className="text-sm md:text-lg text-muted-foreground font-medium italic max-w-2xl mx-auto px-4 leading-relaxed">
            Get in touch with our team of specialists for artisanal inquiries and bulk manufacturing quotes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Contact Info */}
          <div className="lg:col-span-5 space-y-8 lg:space-y-10">
            <div className="bg-secondary/30 p-6 sm:p-8 lg:p-10 rounded-3xl lg:rounded-[2.5rem] border border-border/40 space-y-8 lg:space-y-10 luxury-shadow">
              <div className="flex gap-6 items-start">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-black/5">
                  <Mail size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-primary/60">Email Address</h3>
                  <p className="text-foreground font-black text-lg tracking-tight">info@prishacrafts.com</p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-black/5">
                  <Phone size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-primary/60">Factory & Support</h3>
                  <p className="text-foreground font-black text-lg tracking-tight">+91 99999 99999</p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-black/5">
                  <MapPin size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 text-primary/60">Manufacturing Unit</h3>
                  <p className="text-foreground font-black text-lg tracking-tight">Surat, Gujarat, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2.5rem] p-12 text-center border border-border/40 luxury-shadow flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                    <Send size={20} />
                  </div>
                </div>
                <h3 className="text-3xl font-heading font-black tracking-tighter mb-4 uppercase">Message Sent</h3>
                <p className="text-muted-foreground font-medium italic max-w-sm">
                  Our team has received your message. We will respond within 24 business hours.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-10 text-[10px) font-black uppercase tracking-[0.2em] text-primary hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <div className="bg-white rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-10 lg:p-12 border border-border/40 luxury-shadow">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full h-14 px-6 bg-secondary/30 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full h-14 px-6 bg-secondary/30 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="yourname@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full h-14 px-6 bg-secondary/30 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Product Quote Request"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Your Message</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full p-6 bg-secondary/30 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                      placeholder="Tell us what you need..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-16 bg-black text-white font-black uppercase tracking-widest text-[13px] rounded-2xl hover:bg-primary transition-all flex items-center justify-center gap-3 disabled:opacity-50 luxury-shadow shadow-black/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
