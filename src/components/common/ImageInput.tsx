import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImage, validateImageUrl } from '../../utils/upload';
import { toast } from 'sonner';

interface ImageInputProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
}

export default function ImageInput({ value, onChange, folder = 'general', label, className }: ImageInputProps) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>(value ? 'url' : 'upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size and type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type. Please upload an image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Max size is 2MB.');
      return;
    }

    try {
      setUploading(true);
      const path = `${folder}/${Date.now()}_${file.name}`;
      const url = await uploadImage(file, path);
      onChange(url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = async (url: string) => {
    onChange(url);
    if (url) {
      const isValid = await validateImageUrl(url);
      if (!isValid) {
        toast.error('Invalid image URL');
      }
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</span>}
      
      <div className="relative group">
        <div className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden flex flex-col items-center justify-center transition-all group-hover:border-indigo-300">
          {value ? (
            <div className="relative w-full h-full">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => onChange('')}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                id="remove-image-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center p-4">
              <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No image selected</p>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
              id="mode-upload-btn"
            >
              <Upload className="w-3 h-3" />
              Upload
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === 'url' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
              id="mode-url-btn"
            >
              <LinkIcon className="w-3 h-3" />
              URL
            </button>
          </div>

          <div className="flex-1">
            {mode === 'upload' ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-600 transition-all"
                id="select-file-btn"
              >
                Select File
              </button>
            ) : (
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={value}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] outline-none focus:border-indigo-400 transition-all"
                id="image-url-input"
              />
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*" 
          />
        </div>
      </div>
    </div>
  );
}
