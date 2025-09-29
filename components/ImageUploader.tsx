import React, { useState, useCallback } from 'react';
import type { ShowcaseImage } from '../types';

interface ImageUploaderProps {
  onImagesChange: (images: ShowcaseImage[]) => void;
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const newImagesPromises = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name.replace(/\.[^/.]+$/, ""), // remove extension
        dataUrl: await fileToDataUrl(file),
      }));
    
    const newImages = await Promise.all(newImagesPromises);
    onImagesChange(newImages);
  }, [onImagesChange]);

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div 
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-300 ${isDragging ? 'border-brand-accent bg-brand-primary' : 'border-gray-500 hover:border-brand-accent'}`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <p className="text-gray-400">Drag & drop images here, or click to select files</p>
        </label>
      </div>
  );
};