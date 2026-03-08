import React, { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FoodImageUploader({ onImageUploaded, isAnalyzing }) {
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    onImageUploaded(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {/* Camera capture input — opens native camera on mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative border-2 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all duration-300 cursor-pointer ${dragActive
                ? "border-amber-500 bg-amber-50/50 dark:bg-amber-900/10"
                : "border-gray-200 dark:border-gray-700 bg-gradient-to-br from-orange-50/30 to-amber-50/30 dark:from-gray-800/30 dark:to-gray-800/30 hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-900/10"
              }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30">
                <Camera className="w-9 h-9 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                  Upload or Take a Food Photo
                </h3>
                <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs mx-auto">
                  Drag & drop, choose from gallery, or take a new photo with your camera
                </p>
              </div>

              {/* Two action buttons */}
              <div className="flex gap-3 mt-1 w-full max-w-xs">
                <button
                  onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-md shadow-amber-200/40 hover:shadow-lg active:scale-95 transition-all min-h-[48px]"
                >
                  <Camera className="w-4 h-4" />
                  Camera
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-amber-400 text-amber-700 dark:text-amber-400 text-sm font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 active:scale-95 transition-all min-h-[48px]"
                >
                  <Upload className="w-4 h-4" />
                  Gallery
                </button>
              </div>

              <p className="text-xs text-gray-400">JPG, PNG, WEBP · Max 10 MB</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative rounded-3xl overflow-hidden shadow-xl shadow-amber-100/50"
          >
            <img
              src={preview}
              alt="Food preview"
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            {!isAnalyzing && (
              <button
                onClick={clearPreview}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-all shadow-md"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                  <p className="text-white font-semibold text-lg">Analysing your food…</p>
                  <p className="text-white/70 text-sm">Identifying ingredients &amp; nutrition</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}