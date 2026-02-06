import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { MagnifyingGlassIcon, ArrowLeftOnRectangleIcon, FolderIcon, DocumentIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface VaultItem {
  id: string;
  name: string;
  category: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink: string;
  size: number;
  createdTime: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<VaultItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/documents.json')
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setFilteredItems(data.items || []);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, items]);

  const categories = ['All', ...new Set(items.map(i => i.category))];

  return (
    <div className="flex h-screen bg-[#030303] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 glass border-r border-white/10 flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-2xl font-bold gradient-text">Vaultify</span>
          </div>

          <nav className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Categories</p>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${selectedCategory === cat
                    ? 'bg-violet-600/10 text-violet-400 border border-violet-600/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <FolderIcon className="w-5 h-5" />
                <span className="font-medium text-sm">{cat}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 mb-4">
            <img src={user?.picture} className="w-10 h-10 rounded-full border border-white/20" alt="User" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/10">
          <div className="relative w-96">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-2.5 text-sm transition focus:bg-white/10 focus:border-violet-600/50 outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              {filteredItems.length} items found
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 italic">
              <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full mb-4"></div>
              Loading your vault...
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map(item => (
                <div key={item.id} className="glass-card flex flex-col group h-[340px]">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white/5 mb-4 border border-white/10">
                    {item.thumbnailLink ? (
                      <img src={item.thumbnailLink.replace('=s220', '=s800')} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <DocumentIcon className="w-16 h-16 text-gray-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div className="flex gap-2 w-full">
                        <a
                          href={item.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-xs font-semibold text-white transition border border-white/10"
                        >
                          <EyeIcon className="w-4 h-4" /> View
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 mt-auto">
                    <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">{item.category}</p>
                    <h3 className="font-semibold text-white truncate text-sm" title={item.name}>{item.name}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                      <span>{(item.size / 1024).toFixed(1)} KB</span>
                      <span>{new Date(item.createdTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FolderIcon className="w-20 h-20 mb-4 opacity-10" />
              <p className="text-xl font-medium">No documents found</p>
              <p className="text-sm">Search another term or upload files to GDrive.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;