import React, { useCallback, useState } from 'react';
import GlassCard from '../ui/GlassCard';
import NeoButton from '../ui/NeoButton';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

interface UploadZoneProps {
    onUploadComplete: () => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUploadComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [uploadStatus, setUploadStatus] = useState<Record<string, 'pending' | 'uploading' | 'success' | 'error'>>({});

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files);
            setFiles(prev => [...prev, ...newFiles]);
            // Initialize status
            newFiles.forEach(f => {
                setUploadStatus(prev => ({ ...prev, [f.name]: 'pending' }));
                setUploadProgress(prev => ({ ...prev, [f.name]: 0 }));
            });
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
            newFiles.forEach(f => {
                setUploadStatus(prev => ({ ...prev, [f.name]: 'pending' }));
                setUploadProgress(prev => ({ ...prev, [f.name]: 0 }));
            });
        }
    };

    const removeFile = (fileName: string) => {
        setFiles(prev => prev.filter(f => f.name !== fileName));
        setUploadStatus(prev => {
            const next = { ...prev };
            delete next[fileName];
            return next;
        });
    };

    const uploadFileToDrive = async (file: File, accessToken: string) => {
        try {
            setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }));

            // 1. Initiate Resumable Upload
            const metadata = {
                name: file.name,
                mimeType: file.type,
                parents: [import.meta.env.VITE_GDRIVE_FOLDER_ID] // Need to ensure this env var is accessible
            };

            const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Upload-Content-Type': file.type,
                    'X-Upload-Content-Length': file.size.toString()
                },
                body: JSON.stringify(metadata)
            });

            if (!initRes.ok) throw new Error('Failed to initiate upload');

            const uploadUrl = initRes.headers.get('Location');
            if (!uploadUrl) throw new Error('No upload location returned');

            // 2. Upload Content
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', uploadUrl, true);
            xhr.setRequestHeader('Content-Type', file.type);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }));
                    setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
                    // If all done, trigger callback
                    const allDone = files.every(f =>
                        (f.name === file.name || uploadStatus[f.name] === 'success')
                    );
                    if (allDone) onUploadComplete();
                } else {
                    setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
                }
            };

            xhr.onerror = () => {
                setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
            };

            xhr.send(file);

        } catch (error) {
            console.error("Upload error:", error);
            setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
        }
    };

    const startUploads = () => {
        // Request Access Token
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: (tokenResponse: any) => {
                if (tokenResponse.access_token) {
                    files.forEach(file => {
                        if (uploadStatus[file.name] === 'pending') {
                            uploadFileToDrive(file, tokenResponse.access_token);
                        }
                    });
                }
            },
        });
        client.requestAccessToken();
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                className={`
            relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300
            ${isDragging
                        ? 'border-primary bg-primary/10 scale-[1.02]'
                        : 'border-white/20 hover:border-white/40 bg-white/5'
                    }
        `}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                        <CloudArrowUpIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Drag documents here</h3>
                        <p className="text-gray-400">or click to browse files from your device</p>
                    </div>
                    <input
                        type="file"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileSelect}
                    />
                </div>
            </div>

            {files.length > 0 && (
                <GlassCard className="mt-8 space-y-4">
                    {files.map((file) => (
                        <div key={file.name} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                            <DocumentIcon className="w-8 h-8 text-indigo-400" />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-white truncate">{file.name}</span>
                                    <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${uploadStatus[file.name] === 'error' ? 'bg-red-500' :
                                                uploadStatus[file.name] === 'success' ? 'bg-green-500' : 'bg-primary'
                                            }`}
                                        style={{ width: `${uploadProgress[file.name] || 0}%` }}
                                    />
                                </div>
                            </div>

                            <div className="w-8 flex justify-center">
                                {uploadStatus[file.name] === 'success' && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                                {uploadStatus[file.name] === 'error' && <XMarkIcon className="w-6 h-6 text-red-500" />}
                                {uploadStatus[file.name] === 'pending' && (
                                    <button onClick={() => removeFile(file.name)} className="text-gray-500 hover:text-white">
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end pt-4 border-t border-white/10">
                        <NeoButton onClick={startUploads} disabled={files.every(f => uploadStatus[f.name] !== 'pending')}>
                            Start Upload
                        </NeoButton>
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

export default UploadZone;
