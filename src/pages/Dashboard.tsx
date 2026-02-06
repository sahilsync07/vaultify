import React, { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import UploadZone from '../components/features/UploadZone';
import FilePreview from '../components/features/FilePreview';
import {
  MagnifyingGlassIcon,
  DocumentIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { cn } from '../lib/utils';

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
    if (mimeType.includes('video')) return <VideoCameraIcon className="w-8 h-8 text-blue-400" />;
    return <DocumentIcon className="w-8 h-8 text-indigo-400" />;
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full relative">
        {/* Header / Search Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold gradient-text">My Vault</h1>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-96 group">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-white/10 bg-white/5 focus:bg-white/10"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground absolute left-3 top-2.5" />
            </div>
            <Button onClick={() => setShowUpload(true)} variant="premium" className="hidden md:flex">
              <CloudArrowUpIcon className="w-5 h-5 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === cat
                  ? "bg-primary text-white shadow-neon"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
              )}
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
                <Card key={item.id} variant="glass" className="group relative overflow-hidden p-0 flex flex-col h-[280px] hover:scale-[1.02] transition-transform duration-300">
                  {/* Thumbnail Preview */}
                  <div
                    className="h-40 bg-gray-900/50 relative overflow-hidden cursor-pointer"
                    onClick={() => setPreviewFile(item)}
                  >
                    {item.thumbnailLink ? (
                      <img src={item.thumbnailLink} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                        {getFileIcon(item.mimeType)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
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
                      <span className="text-xs text-muted-foreground uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-full">{item.category}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <DocumentIcon className="w-16 h-16 mb-4 opacity-20" />
              <p>No documents found.</p>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        <Modal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          title="Upload Documents"
          className="max-w-2xl"
        >
          <UploadZone onUploadComplete={() => setShowUpload(false)} />
        </Modal>

        {/* Preview Modal */}
        {previewFile && (
          <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
        )}

        {/* Mobile FAB for Upload */}
        <Button
          onClick={() => setShowUpload(true)}
          variant="premium"
          className="md:hidden fixed bottom-20 right-6 w-14 h-14 rounded-full p-0 shadow-neon z-40"
        >
          <CloudArrowUpIcon className="w-7 h-7 text-white" />
        </Button>
      </div>
    </AppLayout>
  );
};

export default Dashboard;