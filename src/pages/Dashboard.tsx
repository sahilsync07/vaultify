import React, { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import GlassCard from '../components/ui/GlassCard';
import NeoButton from '../components/ui/NeoButton';
import UploadZone from '../components/features/UploadZone';
import FilePreview from '../components/features/FilePreview';
import {
  MagnifyingGlassIcon,
  DocumentIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface DocumentItem {
  id: string;
  name: string;
  mimeType: string;
  category: string;
  webViewLink: string;
  thumbnailLink: string;
  createdTime: string;
}

const Dashboard: React.FC = () => {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Feature States
  const [showUpload, setShowUpload] = useState(false);
  const [previewFile, setPreviewFile] = useState<DocumentItem | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = () => {
    setIsLoading(true);
    fetch('/vaultify/documents.json')
      .then(res => res.json())
      .then(data => {
        const sortedItems = (data?.items || []).sort((a: DocumentItem, b: DocumentItem) =>
          new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
        );
        setItems(sortedItems);
        setFilteredItems(sortedItems);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load documents:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let result = items;
    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }
    if (searchTerm) {
      result = result.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredItems(result);
  }, [searchTerm, selectedCategory, items]);

  const categories = ['All', 'Identity', 'Finance', 'Health', 'Education', 'Other'];

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return <PhotoIcon className="w-8 h-8 text-pink-400" />;
    if (mimeType.includes('pdf')) return <DocumentIcon className="w-8 h-8 text-red-400" />;
    return <DocumentIcon className="w-8 h-8 text-blue-400" />;
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full relative">
        {/* Header / Search Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-white">My Vault</h1>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-80 group">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all custom-input"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
            <NeoButton onClick={() => setShowUpload(true)} variant="primary" className="hidden md:flex">
              <CloudArrowUpIcon className="w-5 h-5" />
              Upload
            </NeoButton>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                        px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                        ${selectedCategory === cat
                  ? 'bg-primary text-white shadow-neon'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }
                    `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {filteredItems.map((item) => (
                <GlassCard key={item.id} className="group relative overflow-hidden p-0 flex flex-col h-[280px]">
                  {/* Thumbnail Preview */}
                  <div
                    className="h-40 bg-gray-900/50 relative overflow-hidden group-hover:opacity-80 transition-opacity cursor-pointer"
                    onClick={() => setPreviewFile(item)}
                  >
                    {item.thumbnailLink ? (
                      <img src={item.thumbnailLink} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getFileIcon(item.mimeType)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20">
                        Preview
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate text-lg" title={item.name}>{item.name}</h3>
                        <div className="p-1.5 bg-white/5 rounded-lg">
                          {getFileIcon(item.mimeType)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">{item.category}</span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <DocumentIcon className="w-16 h-16 mb-4 opacity-20" />
              <p>No documents found.</p>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-3xl relative">
              <button
                onClick={() => setShowUpload(false)}
                className="absolute -top-10 right-0 text-white/50 hover:text-white"
              >
                <XMarkIcon className="w-8 h-8" />
              </button>
              <UploadZone onUploadComplete={() => {
                // Optional: Refresh list or show success message
                // We rely on GitHub Sync for the public list, but client-side we can maybe mock it?
                // For now, just close modal
                setShowUpload(false);
              }} />
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewFile && (
          <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
        )}

        {/* Mobile FAB for Upload */}
        <button
          onClick={() => setShowUpload(true)}
          className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-neon z-40 active:scale-90 transition-transform"
        >
          <CloudArrowUpIcon className="w-7 h-7 text-white" />
        </button>
      </div>
    </AppLayout>
  );
};

export default Dashboard;