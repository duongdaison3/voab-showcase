import React, { useState, useEffect, useMemo } from 'react';
import { ShowcaseTopic, ShowcaseImage, GameResult } from '../types';
import { saveTopic } from '../services/showcaseService';
import { getHistory } from '../services/historyService';
import { ImageUploader } from './ImageUploader';
import { ImageSearch } from './ImageSearch';

interface AdminViewProps {
  topics: ShowcaseTopic[];
  onStartShowcase: (topic: ShowcaseTopic) => void;
  onTopicCreated: () => void;
}

const ImagePreviewModal: React.FC<{image: ShowcaseImage, onClose: () => void}> = ({ image, onClose }) => {
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            onClose();
          }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    // Reset zoom when image changes
    useEffect(() => {
        setIsZoomed(false);
    }, [image]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="image-preview-title"
            onClick={onClose} // Close on backdrop click
        >
            <div 
                className="bg-brand-dark p-4 rounded-lg shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col relative"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
            >
                <div className="flex justify-between items-center mb-2">
                     <h2 id="image-preview-title" className="text-xl font-bold text-brand-light truncate pr-10">{image.name}</h2>
                     <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white text-3xl font-bold absolute top-2 right-4 z-10"
                        aria-label="Close image preview"
                     >
                        &times;
                     </button>
                </div>
                <div className="flex-grow overflow-auto">
                    <img 
                        src={image.dataUrl} 
                        alt={`Preview of ${image.name}`}
                        className={`w-full h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
                        onClick={() => setIsZoomed(!isZoomed)}
                    />
                </div>
                 <div className="text-center text-gray-400 text-sm mt-2">
                    Click image to {isZoomed ? 'zoom out' : 'zoom in'}. Click backdrop or press Esc to close.
                 </div>
            </div>
        </div>
    );
};


export const AdminView: React.FC<AdminViewProps> = ({ topics, onStartShowcase, onTopicCreated }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ShowcaseImage[]>([]);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'search'>('upload');
  const [previewImage, setPreviewImage] = useState<ShowcaseImage | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      const history = await getHistory();
      setGameHistory(history);
      setIsHistoryLoading(false);
    };
    fetchHistory();
  }, []);

  const allCategories = useMemo(() => {
    const defaultCategories = ['Animals', 'Food', 'Technology', 'Nature', 'Sports', 'Travel'];
    const existingCategories = topics.map(topic => topic.category);
    // Filter out empty strings and create a unique, sorted list
    const uniqueCategories = [...new Set([...defaultCategories, ...existingCategories])].filter(Boolean).sort();
    return uniqueCategories;
  }, [topics]);

  const handleFormReset = () => {
    setName('');
    setCategory('');
    setCustomCategory('');
    setDescription('');
    setImages([]);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === 'Other' ? customCategory.trim() : category;

    if (!name || !finalCategory || images.length === 0) {
      alert('Please fill in all fields and upload at least one image.');
      return;
    }
    const newTopic: ShowcaseTopic = {
      id: crypto.randomUUID(),
      name,
      category: finalCategory,
      description,
      images,
    };
    await saveTopic(newTopic);
    onTopicCreated();
    handleFormReset();
  };

  const handleNameChange = (id: string, newName: string) => {
    setImages(imgs => imgs.map(img => img.id === id ? { ...img, name: newName } : img));
  };

  const handleRemoveImage = (id: string) => {
      setImages(imgs => imgs.filter(img => img.id !== id));
  };
  
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <header className="text-center mb-12 flex flex-col items-center">
        <img src="https://github.com/duongdaison3/voab-showcase/blob/76d8fdf6afa203fdbd719fe1ab9767654e1d781f/assets/HDI-LOGO.png" alt="HDI English Logo" className="h-20" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-blue-400 text-transparent bg-clip-text mt-4">
          HDI English Vocabulary Showcase
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-blue-500/30 rounded-xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold mb-4 pb-2 bg-gradient-to-r from-brand-light to-brand-accent text-transparent bg-clip-text">Create New Showcase</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent" required />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
              <select
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                required
              >
                <option value="" disabled>Select a category</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Other">Other (specify below)</option>
              </select>
            </div>

            {category === 'Other' && (
              <div className="animate-fade-in">
                <label htmlFor="custom-category" className="block text-sm font-medium text-gray-300">New Category Name</label>
                <input
                  type="text"
                  id="custom-category"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                  required
                  placeholder="e.g., Historical Figures"
                />
              </div>
            )}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Images</label>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex border-b border-gray-700 mb-4">
                    <button type="button" onClick={() => setActiveTab('upload')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'upload' ? 'border-b-2 border-brand-accent text-white' : 'text-gray-400 hover:text-white'}`}>
                        Upload from Computer
                    </button>
                    <button type="button" onClick={() => setActiveTab('search')} className={`py-2 px-4 font-medium transition-colors ${activeTab === 'search' ? 'border-b-2 border-brand-accent text-white' : 'text-gray-400 hover:text-white'}`}>
                        Search on Web
                    </button>
                </div>
                {activeTab === 'upload' ? (
                    <ImageUploader onImagesChange={newImages => setImages(prev => [...prev, ...newImages])} />
                ) : (
                    <ImageSearch onAddImages={newImages => setImages(prev => [...prev, ...newImages])} />
                )}
              </div>

              {images.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-base font-semibold mb-2 text-gray-300">
                    {images.length} Image{images.length > 1 ? 's' : ''} for Showcase
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2 bg-brand-dark rounded-md">
                    {images.map(image => (
                      <div key={image.id} className="p-2 border border-gray-700 rounded-lg flex flex-col justify-between animate-fade-in">
                        <div>
                          <img 
                            src={image.dataUrl} 
                            alt={image.name} 
                            className="w-full h-24 object-cover rounded-md mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setPreviewImage(image)}
                          />
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
                </div>
              )}
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-brand-secondary to-brand-accent hover:scale-105 transform transition-transform duration-200 shadow-lg text-white font-bold py-3 px-4 rounded-lg">Save Showcase</button>
          </form>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-blue-500/30 rounded-xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold mb-4 pb-2 bg-gradient-to-r from-brand-light to-brand-accent text-transparent bg-clip-text">Existing Showcases</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {topics.length === 0 ? (
              <p className="text-gray-400">No showcases created yet.</p>
            ) : (
              [...topics].reverse().map(topic => (
                <div key={topic.id} className="bg-gray-800/80 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-brand-light">{topic.name}</h3>
                    <p className="text-sm text-gray-400">{topic.category} - {topic.images.length} images</p>
                  </div>
                  <button onClick={() => onStartShowcase(topic)} className="bg-gradient-to-r from-blue-500 to-brand-accent hover:scale-105 transform transition-transform duration-200 shadow-lg text-white font-bold py-2 px-4 rounded-lg">Start</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-slate-900/50 backdrop-blur-sm border border-blue-500/30 rounded-xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold mb-4 pb-2 bg-gradient-to-r from-brand-light to-brand-accent text-transparent bg-clip-text">Game History</h2>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {isHistoryLoading ? (
            <p className="text-gray-400">Loading history...</p>
          ) : gameHistory.length === 0 ? (
            <p className="text-gray-400">No games played yet.</p>
          ) : (
            gameHistory.map(result => (
              <div key={result.id} className="bg-gray-800/80 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-brand-light">{result.topicName}</h3>
                    <p className="text-sm text-gray-400">{result.players[0].name} vs {result.players[1].name}</p>
                  </div>
                  <p className="text-sm text-gray-500">{new Date(result.date).toLocaleString()}</p>
                </div>
                <div className="mt-2 text-center">
                  <span className="font-semibold">{result.players[0].name}: <span className="text-brand-accent">{result.players[0].score}</span></span>
                  <span className="mx-2">|</span>
                  <span className="font-semibold">{result.players[1].name}: <span className="text-brand-accent">{result.players[1].score}</span></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {previewImage && <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />}
    </div>
  );
};
