import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Check, X, RefreshCw, FileImage } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  onUploadComplete?: (url: string) => void;
  bucket?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function ImageUploader({
  value = '',
  onChange,
  onUploadComplete,
  bucket = 'images',
  label = 'Product / Course Image',
  placeholder = 'https://...',
  className = ''
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = (url: string) => {
    if (onChange) onChange(url);
    if (onUploadComplete) onUploadComplete(url);
    setUrlInput(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    // 1. Attempt Supabase Storage upload
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `yara_${bucket}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          notify(publicUrlData.publicUrl);
          setIsUploading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload notice, utilizing optimized local representation:', err);
    }

    // 2. Fallback / Offline: Convert to compressed Base64 Data URL
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            notify(compressed);
          } else {
            notify(event.target?.result as string);
          }
          setIsUploading(false);
        };
        img.onerror = () => {
          notify(event.target?.result as string);
          setIsUploading(false);
        };
        img.src = event.target?.result as string;
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
      notify(urlInput.trim());
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
          <ImageIcon className="w-4 h-4 text-emerald-500" />
          <span>{label}</span>
        </label>
        
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              mode === 'upload' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              mode === 'url' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isUploading 
                ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' 
                : 'border-slate-300 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-950/60'
            }`}
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                <span className="text-xs font-bold text-indigo-600">Uploading &amp; Processing Image...</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-emerald-600 hover:underline">Click to upload image</span>
                  <span className="text-slate-500"> or drag &amp; drop</span>
                </div>
                <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (up to 10MB)</span>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <p className="text-[11px] text-red-500 font-medium">{errorMsg}</p>
      )}

      {/* Preview */}
      {value && (
        <div className="relative w-full aspect-video max-h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => notify('')}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-red-600 transition opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Remove image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-bold">
            Image Attached
          </div>
        </div>
      )}
    </div>
  );
}
