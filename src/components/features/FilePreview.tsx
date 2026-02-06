import React from 'react';
import { XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface FilePreviewProps {
    file: {
        name: string;
        webViewLink: string;
        mimeType: string;
    };
    onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
    // Convert standard view link to preview link for embedding
    const previewLink = file.webViewLink.replace('/view', '/preview');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-6xl h-[85vh] bg-[#0A0A0A] rounded-2xl border border-white/10 flex flex-col shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-glass">
                    <h3 className="font-semibold text-white truncate max-w-md">{file.name}</h3>
                    <div className="flex items-center gap-2">
                        <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Open in new tab"
                        >
                            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-[#1a1a1a] relative">
                    {file.mimeType.includes('pdf') || file.mimeType.includes('image') ? (
                        <iframe
                            src={previewLink}
                            className="w-full h-full border-0"
                            allow="autoplay"
                            title="File Preview"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <ArrowTopRightOnSquareIcon className="w-10 h-10 text-gray-400" />
                            </div>
                            <h4 className="text-xl font-semibold text-white mb-2">Preview not available</h4>
                            <p className="text-gray-400 max-w-sm mb-6">
                                This file type cannot be previewed directly. Please open it in a new tab to view.
                            </p>
                            <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="px-6 py-3 bg-primary text-white rounded-xl font-medium shadow-neon hover:shadow-neon-hover transition-all"
                            >
                                Open in Google Drive
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilePreview;
