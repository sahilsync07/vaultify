import React from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

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
        <Modal
            isOpen={true}
            onClose={onClose}
            title={file.name}
            className="max-w-6xl w-full h-[85vh] flex flex-col p-0 overflow-hidden"
        >
            <div className="flex-1 bg-[#1a1a1a] relative h-full">
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
                            <ArrowTopRightOnSquareIcon className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h4 className="text-xl font-semibold text-white mb-2">Preview not available</h4>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            This file type cannot be previewed directly. Please open it in a new tab to view.
                        </p>
                        <Button
                            onClick={() => window.open(file.webViewLink, '_blank')}
                            variant="primary"
                        >
                            Open in Google Drive
                        </Button>
                    </div>
                )}
            </div>

            <div className="absolute top-4 right-14 z-10">
                <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-gray-400 hover:text-white hover:bg-black/20 rounded-lg transition-colors inline-flex"
                    title="Open in new tab"
                >
                    <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                </a>
            </div>
        </Modal>
    );
};

export default FilePreview;
