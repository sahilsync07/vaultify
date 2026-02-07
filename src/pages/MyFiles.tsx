import React, { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card } from '../components/ui/Card';
import FilePreview from '../components/features/FilePreview';
import { useAuthStore } from '../store/authStore';
import { driveService } from '../services/driveService';
import {
    MagnifyingGlassIcon,
    DocumentIcon,
    PhotoIcon,
    VideoCameraIcon
} from '@heroicons/react/24/outline';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { DOCUMENT_CATEGORIES } from '../constants/documentTypes';

interface DocumentMetadata {
    vaultifyType?: string;
    vaultifyCategory?: string;
}

interface DocumentItem {
    id: string;
    name: string;
    mimeType: string;
    category: string;
    type?: string;
    webViewLink: string;
    thumbnailLink: string;
    createdTime: string;
    properties?: DocumentMetadata;
}

const MyFiles: React.FC = () => {
    const { accessToken } = useAuthStore();
    const [items, setItems] = useState<DocumentItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<DocumentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [previewFile, setPreviewFile] = useState<DocumentItem | null>(null);

    useEffect(() => {
        fetchDocuments();
    }, [accessToken]);

    const fetchDocuments = async () => {
        setIsLoading(true);

        // Guest Handling or No Token
        if (!accessToken || accessToken === 'guest-token') {
            // Fallback to mock data for guests
            fetch('/vaultify/documents.json')
                .then(res => res.json())
                .then(data => {
                    setItems(data?.items || []);
                    setFilteredItems(data?.items || []);
                    setIsLoading(false);
                })
                .catch(() => setIsLoading(false));
            return;
        }

        // Real GDrive Fetch
        try {
            const files = await driveService.listFiles(accessToken);

            const driveFiles = files.map((f: any) => ({
                id: f.id,
                name: f.name,
                mimeType: f.mimeType,
                // Use metadata category if available, else standard fallback
                category: f.properties?.vaultifyCategory || 'Other',
                type: f.properties?.vaultifyType,
                webViewLink: f.webViewLink,
                thumbnailLink: f.thumbnailLink,
                createdTime: f.createdTime,
                properties: f.properties
            }));

            // Sort by recently created
            driveFiles.sort((a: any, b: any) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());

            // Exclude the log file itself from "My Files" view to avoid clutter
            const cleanFiles = driveFiles.filter(f => f.name !== 'vaultify_audit_logs.json');

            setItems(cleanFiles);
            setFilteredItems(cleanFiles);
        } catch (error) {
            console.error("Error fetching Drive files:", error);
        } finally {
            setIsLoading(false);
        }
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

    // Generate categories list dynamically
    const categories = ['All', ...Object.keys(DOCUMENT_CATEGORIES)];

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('image')) return <PhotoIcon className="w-8 h-8 text-pink-400" />;
        if (mimeType.includes('pdf')) return <DocumentIcon className="w-8 h-8 text-red-400" />;
        if (mimeType.includes('video')) return <VideoCameraIcon className="w-8 h-8 text-blue-400" />;
        return <DocumentIcon className="w-8 h-8 text-indigo-400" />;
    };

    return (
        <AppLayout>
            <div className="flex flex-col h-full relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold gradient-text">My Files</h1>
                    <div className="relative w-full md:w-96 group">
                        <Input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 border-white/10 bg-white/5 focus:bg-white/10"
                        />
                        <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground absolute left-3 top-2.5" />
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
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="font-semibold text-white truncate text-lg" title={item.name}>{item.name}</h3>
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

                {previewFile && (
                    <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
                )}
            </div>
        </AppLayout>
    );
};

export default MyFiles;
