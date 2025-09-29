import React, { useState } from 'react';
import { ShowcaseImage } from '../types';
import { searchImages, SearchResult } from '../services/imageSearchService';

interface ImageSearchProps {
  onAddImages: (images: ShowcaseImage[]) => void;
}

const urlToDataUrl = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


export const ImageSearch: React.FC<ImageSearchProps> = ({ onAddImages }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setResults([]);
    setSelectedIds(new Set());
    try {
      const searchResults = await searchImages(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Image search failed:', error);
      alert('Image search failed. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAddSelectedImages = async () => {
    if (selectedIds.size === 0) return;
    setIsAdding(true);
    try {
        const selectedResults = results.filter(r => selectedIds.has(r.id));
        const newImagesPromises = selectedResults.map(async (result) => {
            const dataUrl = await urlToDataUrl(result.url);
            return {
                id: crypto.randomUUID(),
                name: result.description || query,
                dataUrl: dataUrl,
            };
        });
        const newImages = await Promise.all(newImagesPromises);
        onAddImages(newImages);
        setSelectedIds(new Set());
    } catch(error) {
        console.error("Error converting images to data URL:", error);
        alert("There was an issue adding the selected images. This can happen due to network security (CORS) policies. Please try different images.");
    } finally {
        setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g., 'cat on a skateboard'"
          className="flex-grow bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-brand-accent hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {isLoading && <p className="text-center text-gray-400">Loading results...</p>}

      {results.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1 bg-brand-dark rounded-md">
          {results.map(result => (
            <div key={result.id} className="relative cursor-pointer group" onClick={() => toggleSelection(result.id)}>
              <img
                src={result.thumbnailUrl}
                alt={result.description}
                className={`w-full h-24 object-cover rounded-md transition-all duration-200 ${selectedIds.has(result.id) ? 'ring-4 ring-brand-accent' : 'group-hover:opacity-80'}`}
              />
              {selectedIds.has(result.id) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {results.length === 0 && !isLoading && query && <p className="text-center text-gray-400">No results found for "{query}".</p>}

      {selectedIds.size > 0 && (
        <div className="text-center">
            <button
                onClick={handleAddSelectedImages}
                disabled={isAdding}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {isAdding ? `Adding ${selectedIds.size} Images...` : `Add ${selectedIds.size} Selected Images`}
            </button>
        </div>
      )}
    </div>
  );
};