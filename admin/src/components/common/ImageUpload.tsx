import { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "Feature Image" }: ImageUploadProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>(value.startsWith('http') ? 'url' : 'upload');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (max 5MB)");
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const res = await api.post('/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onChange(res.data.url);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
        <div className="flex bg-secondary/50 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${activeTab === 'upload' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${activeTab === 'url' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            URL
          </button>
        </div>
      </div>

      <div className="relative group">
        {activeTab === 'url' ? (
          <div className="relative">
            <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-12 md:h-14 pl-12 pr-5 bg-secondary/30 border-none rounded-xl md:rounded-2xl font-bold focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground/40"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-32 md:h-40 border-2 border-dashed rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${value ? 'border-primary/20 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-secondary/30'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload} 
            />
            {isUploading ? (
              <Loader2 className="animate-spin text-primary" size={24} />
            ) : value ? (
              <div className="relative w-full h-full p-2">
                <img src={value} className="w-full h-full object-contain rounded-xl" alt="Preview" />
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(''); }}
                  className="absolute top-4 right-4 p-1.5 bg-black text-white rounded-full hover:bg-primary transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Upload size={18} className="text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Click to upload</p>
                  <p className="text-[9px] font-medium text-muted-foreground mt-1">PNG, JPG or WEBP (Max 5MB)</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {value && activeTab === 'url' && (
        <div className="mt-4 p-3 bg-secondary/20 rounded-xl border border-border/20 flex items-center gap-4">
           <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-border/20 shrink-0">
              <img src={value} className="w-full h-full object-cover" alt="Preview" />
           </div>
           <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Preview</p>
              <p className="text-[10px] font-bold truncate text-foreground/70">{value}</p>
           </div>
           <button 
              type="button"
              onClick={() => onChange('')}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
           >
              <X size={16} />
           </button>
        </div>
      )}
    </div>
  );
}
