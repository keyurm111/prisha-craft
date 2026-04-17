import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Loader2, Clock } from "lucide-react";
import api from "@/services/api";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  category: string;
  publishedAt: string;
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await api.get(`/blogs/${slug}`);
        setBlog(res.data.data.blog);
      } catch (error) {
        console.error("Failed to fetch blog details", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlog();
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-40 text-center">
        <h1 className="text-4xl font-heading font-black mb-8 uppercase">Manuscript Not Found</h1>
        <Link to="/blog" className="text-primary font-black uppercase tracking-widest text-sm hover:underline">Return to Editorial</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl py-12 md:py-20">
        {/* Back Button */}
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all mb-12 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Editorial
        </Link>

        {/* Header Section */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
              {blog.category}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              <Clock size={12} />
              5 Min Read
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black tracking-tighter leading-tight mb-8 uppercase">
            {blog.title}
          </h1>

          <div className="flex items-center gap-6 border-y border-border/40 py-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <User size={14} className="text-muted-foreground" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">{blog.author}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={14} />
              <span className="text-xs font-bold uppercase tracking-widest">
                {new Date(blog.publishedAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-12 rounded-[2rem] overflow-hidden shadow-2xl">
          <img 
            src={blog.image} 
            alt={blog.title} 
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>

        {/* Article Body */}
        <article className="prose prose-lg prose-stone max-w-none prose-headings:font-heading prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:font-medium prose-p:text-muted-foreground prose-p:leading-relaxed">
          <p className="text-xl md:text-2xl font-bold text-foreground leading-relaxed mb-10 italic">
            {blog.summary}
          </p>
          
          <div className="space-y-6">
            {blog.content.split('\n').map((para, i) => (
              para.trim() && <p key={i}>{para}</p>
            ))}
          </div>
        </article>

        {/* Simple Footer */}
        <div className="mt-20 pt-10 border-t border-border/40 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-8">End of Manuscript</p>
           <Link 
            to="/blog"
            className="px-10 py-5 bg-black text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-primary transition-all inline-block"
           >
             Continue Reading
           </Link>
        </div>
      </div>
    </div>
  );
}
