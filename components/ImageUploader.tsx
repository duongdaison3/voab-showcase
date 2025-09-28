import React, { useState, useCallback } from 'react';
import type { ShowcaseImage } from '../types';

interface ImageUploaderProps {
  images: ShowcaseImage[];
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

export const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange }) => {
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
    onImagesChange([...images, ...newImages]);
  }, [onImagesChange, images]);

  const handleNameChange = (id: string, newName: string) => {
    const updatedImages = images.map(img => img.id === id ? { ...img, name: newName } : img);
    onImagesChange(updatedImages);
  };

  const handleRemoveImage = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id);
    onImagesChange(updatedImages);
  };

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
    <div className="space-y-4">
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
      
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2 bg-brand-dark rounded-md">
          {images.map(image => (
            <div key={image.id} className="p-2 border border-gray-700 rounded-lg flex flex-col justify-between">
              <div>
                <img src={image.dataUrl} alt={image.name} className="w-full h-24 object-cover rounded-md mb-2"/>
                <input 
                  type="text"
                  value={image.name}
                  onChange={(e) => handleNameChange(image.id, e.target.value)}
                  className="w-full bg-gray-700 text-white p-1 rounded-md text-sm focus:ring-brand-accent focus:border-brand-accent"
                  aria-label={`Image name for ${image.name}`}
                />
              </div>
              <button 
                type="button"
                onClick={() => handleRemoveImage(image.id)}
                className="w-full mt-2 bg-red-700 hover:bg-red-600 text-white text-xs font-semibold py-1 px-2 rounded-md transition-colors duration-200"
                aria-label={`Remove image ${image.name}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};