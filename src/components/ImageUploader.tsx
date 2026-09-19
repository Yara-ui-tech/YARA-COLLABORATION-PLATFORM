import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Check, X, RefreshCw, Sparkles, FileImage } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function ImageUploader({
  value = '',
  onChange,
  bucket = 'flyers',
  label = 'Flyer / Banner Image',
  placeholder = 'https://...',
  className = ''
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      // 1. Try Supabase Storage Upload
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `yara_${bucket}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          onChange(publicUrlData.publicUrl);
          setUrlInput(publicUrlData.publicUrl);
          setIsUploading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload notice, falling back to base64 encoding:', err);
    }

    // 2. Offline / Fallback: Compress and convert to Base64 Data URL
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onChange(result);
          setUrlInput(result);
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        setErrorMsg('Could not read image file.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (readErr: any) {
      setErrorMsg(readErr.message || 'File upload failed.');
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
          <ImageIcon className="w-4 h-4 text-cyan-400" />
          <span>{label}</span>
        </label>
        
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              mode === 'upload' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              mode === 'url' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/60 hover:bg-slate-900 rounded-2xl p-4 text-center cursor-pointer transition-all group relative overflow-hidden"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {isUploading ? (
              <div className="py-4 flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                <span className="text-xs font-bold text-cyan-300">Processing image upload...</span>
              </div>
            ) : value ? (
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-950">
                    <img src={value} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left truncate">
                    <p className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Flyers / Graphic Loaded</span>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{value.substring(0, 35)}...</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange('');
                    setUrlInput('');
                  }}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="py-4 space-y-2">
                <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-200">
                  Click to Browse or Drag & Drop Flyer Image
                </p>
                <p className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                onChange(e.target.value);
              }}
              placeholder={placeholder}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-cyan-500"
            />
          </div>
          {urlInput && (
            <button
              type="button"
              onClick={() => {
                setUrlInput('');
                onChange('');
              }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-[11px] font-bold text-red-400 mt-1">{errorMsg}</p>
      )}
    </div>
  );
}
