import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { Plus, Trash2, FileText, Loader2, X, Send, Image as ImageIcon, Pencil, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/common/ImageUpload";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  category: string;
  status: "Draft" | "Published";
  featured: boolean;
  publishedAt: string;
  createdAt: string;
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newBlog, setNewBlog] = useState({
    title: "",
    summary: "",
    content: "",
    image: "",
    author: "Admin",
    category: "General",
    status: "Published" as "Draft" | "Published",
    featured: false
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await api.get("/blogs");
      setBlogs(res.data.data.blogs);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
      toast.error("Failed to load blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...newBlog,
        slug: newBlog.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")
      };

      if (editingId) {
        await api.patch(`/blogs/${editingId}`, payload);
        toast.success("Blog updated successfully");
      } else {
        await api.post("/blogs", payload);
        toast.success("Blog published successfully");
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchBlogs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingId(blog._id);
    setNewBlog({
      title: blog.title,
      summary: blog.summary,
      content: blog.content,
      image: blog.image,
      author: blog.author,
      category: blog.category,
      status: blog.status,
      featured: blog.featured
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setNewBlog({
      title: "",
      summary: "",
      content: "",
      image: "",
      author: "Admin",
      category: "General",
      status: "Published",
      featured: false
    });
  };

  const deleteBlog = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await api.delete(`/blogs/${id}`);
      setBlogs(blogs.filter(b => b._id !== id));
      toast.success("Blog deleted successfully");
    } catch (error) {
      toast.error("Failed to delete blog");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in py-2 md:py-6 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border/20 pb-6 md:pb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tighter mb-2 md:mb-4 uppercase">Blog Posts</h1>
          <p className="text-muted-foreground font-medium italic text-sm md:text-lg leading-tight md:leading-none">Share insights and news with your audience.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="h-12 md:h-14 px-5 md:px-8 bg-black text-white rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-primary transition-all luxury-shadow w-full md:w-auto justify-center"
        >
          <Plus size={18} />
          Write New Blog
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-border/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/30">
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Article</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Category</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-muted-foreground italic font-medium">No blog posts found.</p>
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id} className="group hover:bg-secondary/10 transition-colors">
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/5 flex items-center justify-center text-primary/40 border border-primary/10 overflow-hidden shrink-0">
                          {blog.image ? <img src={blog.image} className="w-full h-full object-cover" /> : <FileText size={20} />}
                        </div>
                        <div className="max-w-xs">
                          <p className="text-sm font-black text-foreground mb-1 line-clamp-1 uppercase tracking-tight">{blog.title}</p>
                          <p className="text-[10px] text-muted-foreground font-medium line-clamp-1 italic">{blog.summary}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 md:px-3 py-1 rounded-full border border-primary/10">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6">
                      <div className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest ${blog.status === "Published" ? "text-green-600" : "text-amber-600"}`}>
                        {blog.status === "Published" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {blog.status}
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button onClick={() => handleEdit(blog)} className="p-2.5 hover:bg-primary/5 text-primary rounded-xl transition-all"><Pencil size={18} /></button>
                         <button onClick={() => deleteBlog(blog._id)} className="p-2.5 hover:bg-destructive/5 text-destructive rounded-xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in text-left">
          <div className="bg-white w-full max-w-4xl rounded-[1.5rem] md:rounded-[3rem] overflow-hidden luxury-shadow border border-white/20 animate-zoom-in">
            <div className="p-6 md:p-14 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl md:text-3xl font-heading font-black tracking-tighter uppercase">{editingId ? "Edit Blog Post" : "Compose Blog Post"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-all"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                    <input type="text" required value={newBlog.title} onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold outline-none placeholder:text-muted-foreground/40" placeholder="Catchy title..." />
                  </div>
                  <ImageUpload 
                    label="Blog Hero Image"
                    value={newBlog.image}
                    onChange={(url) => setNewBlog({ ...newBlog, image: url })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Author</label>
                    <input type="text" required value={newBlog.author} onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                    <select value={newBlog.category} onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold appearance-none">
                      <option value="General">General</option>
                      <option value="Design">Design</option>
                      <option value="Crafts">Crafts</option>
                      <option value="News">News</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Status</label>
                    <select value={newBlog.status} onChange={(e) => setNewBlog({ ...newBlog, status: e.target.value as any })} className="w-full h-12 md:h-14 px-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold appearance-none">
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Summary</label>
                  <textarea rows={2} required value={newBlog.summary} onChange={(e) => setNewBlog({ ...newBlog, summary: e.target.value })} className="w-full p-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold resize-none italic" placeholder="Brief excerpt..." />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Content (Markdown)</label>
                  <textarea rows={10} required value={newBlog.content} onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })} className="w-full p-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold resize-none" placeholder="Start writing..." />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full h-14 md:h-16 bg-black text-white font-black uppercase tracking-widest text-[11px] md:text-[13px] rounded-xl md:rounded-2xl hover:bg-primary transition-all flex items-center justify-center gap-3 luxury-shadow disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <span>Send</span>}
                  {editingId ? "Update Blog" : "Publish Blog"}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
