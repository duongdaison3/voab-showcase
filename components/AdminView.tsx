import React, { useState, useEffect } from 'react';
import { ShowcaseTopic, ShowcaseImage, GameResult } from '../types';
import { saveTopic } from '../services/showcaseService';
import { getHistory } from '../services/historyService';
import { ImageUploader } from './ImageUploader';

interface AdminViewProps {
  topics: ShowcaseTopic[];
  onStartShowcase: (topic: ShowcaseTopic) => void;
  onTopicCreated: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ topics, onStartShowcase, onTopicCreated }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ShowcaseImage[]>([]);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      const history = await getHistory();
      setGameHistory(history);
      setIsHistoryLoading(false);
    };
    fetchHistory();
  }, []);

  const handleFormReset = () => {
    setName('');
    setCategory('');
    setDescription('');
    setImages([]);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || images.length === 0) {
      alert('Please fill in all fields and upload at least one image.');
      return;
    }
    const newTopic: ShowcaseTopic = {
      id: crypto.randomUUID(),
      name,
      category,
      description,
      images,
    };
    await saveTopic(newTopic);
    onTopicCreated();
    handleFormReset();
  };
  
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <header className="text-center mb-8 flex flex-col items-center">
        <img src="https://i.imgur.com/8Q7L5x2.png" alt="VDI English Logo" className="h-24" />
        <p className="text-lg text-gray-300 mt-4">Admin Dashboard</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-dark p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2 text-brand-light">Create New Showcase</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent" required />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
              <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"></textarea>
            </div>
            
            <ImageUploader images={images} onImagesChange={setImages} />
            <button type="submit" className="w-full bg-brand-primary hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">Save Showcase</button>
          </form>
        </div>

        <div className="bg-brand-dark p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2 text-brand-light">Existing Showcases</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {topics.length === 0 ? (
              <p className="text-gray-400">No showcases created yet.</p>
            ) : (
              [...topics].reverse().map(topic => (
                <div key={topic.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-brand-light">{topic.name}</h3>
                    <p className="text-sm text-gray-400">{topic.category} - {topic.images.length} images</p>
                  </div>
                  <button onClick={() => onStartShowcase(topic)} className="bg-brand-accent hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">Start</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-brand-dark p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2 text-brand-light">Game History</h2>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {isHistoryLoading ? (
            <p className="text-gray-400">Loading history...</p>
          ) : gameHistory.length === 0 ? (
            <p className="text-gray-400">No games played yet.</p>
          ) : (
            gameHistory.map(result => (
              <div key={result.id} className="bg-gray-800 p-4 rounded-lg">
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
    </div>
  );
};
