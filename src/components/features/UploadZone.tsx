import React, { useCallback, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';
import { FEATURES } from '../../config';
import { useAuthStore } from '../../store/authStore';
import { DOCUMENT_CATEGORIES, getCategoryForType } from '../../constants/documentTypes';
import { driveService } from '../../services/driveService';

interface UploadZoneProps {
    onUploadComplete: () => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUploadComplete }) => {
    const { accessToken, setAccessToken } = useAuthStore();
    const tokenClient = React.useRef<any>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [uploadStatus, setUploadStatus] = useState<Record<string, 'pending' | 'uploading' | 'success' | 'error'>>({});
    const [fileTypes, setFileTypes] = useState<Record<string, string>>({});

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
        setFileTypes(prev => {
            const next = { ...prev };
            delete next[fileName];
            return next;
        });
    };

    const handleTypeChange = (fileName: string, type: string) => {
        setFileTypes(prev => ({ ...prev, [fileName]: type }));
    };

    // Initialize Token Client
    React.useEffect(() => {
        if (FEATURES.ENABLE_GOOGLE_AUTH) {
            tokenClient.current = window.google?.accounts.oauth2.initTokenClient({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/drive.file',
                callback: (tokenResponse: any) => {
                    if (tokenResponse.access_token) {
                        setAccessToken(tokenResponse.access_token);
                        // Auto-retry uploads upon new token
                        processUploads(tokenResponse.access_token);
                    }
                },
            });
        }
    }, [files, setAccessToken]);

    const processUploads = (token: string) => {
        files.forEach(file => {
            if (uploadStatus[file.name] === 'pending' || uploadStatus[file.name] === 'error') {
                uploadFileToDrive(file, token);
            }
        });
    };

    const uploadFileToDrive = async (file: File, token: string) => {
        try {
            setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }));

            const selectedType = fileTypes[file.name] || 'Other';
            const category = getCategoryForType(selectedType);

            // 1. Initiate Resumable Upload via Service
            const metadata = {
                name: file.name,
                mimeType: file.type,
                properties: {
                    vaultifyType: selectedType,
                    vaultifyCategory: category
                }
            };

            // This will throw if config is missing, caught below
            const uploadUrl = await driveService.initConfiguredUpload(token, file, metadata);

            if (!uploadUrl) throw new Error('No upload location returned');

            // 2. Upload Content
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', uploadUrl, true);
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    // Success!
                    setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }));
                    setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

                    // AUDIT LOGGING
                    const { user } = useAuthStore.getState();
                    driveService.logActivity(token, {
                        user: user?.name || 'Unknown User',
                        action: 'UPLOAD',
                        details: `Uploaded ${file.name} (${selectedType})`,
                        fileName: file.name
                    });

                    // Check all finished logic
                    setUploadStatus(currentStatus => {
                        const newStatus: Record<string, 'pending' | 'uploading' | 'success' | 'error'> = { ...currentStatus, [file.name]: 'success' };
                        const allFinished = files.every(f =>
                            newStatus[f.name] === 'success'
                        );
                        if (allFinished) setTimeout(onUploadComplete, 1000);
                        return newStatus;
                    });

                } else {
                    setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
                }
            };

            xhr.onerror = () => {
                setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
            };

            xhr.send(file);

        } catch (error: any) {
            console.error("Upload error:", error);
            if (error.message === 'Unauthorized') {
                setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
                console.warn("Token expired, requesting new one...");
                setAccessToken(null);
                tokenClient.current?.requestAccessToken();
            } else if (error.message.includes('Folder ID')) {
                alert(error.message); // Show the config error to user
                setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
            } else {
                setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
            }
        }
    };

    const startUploads = () => {
        if (!FEATURES.ENABLE_GOOGLE_AUTH) {
            alert('File uploads are temporarily disabled.');
            return;
        }

        // Guest check
        if (accessToken === 'guest-token') {
            alert("Guest users cannot upload files. Please sign in with Google.");
            return;
        }

        // Validate that all files have a type selected
        const missingTypes = files.some(f => !fileTypes[f.name]);
        if (missingTypes) {
            alert("Please select a document type for all files before uploading.");
            return;
        }

        if (accessToken) {
            // Optimistically try with current token
            processUploads(accessToken);
        } else {
            // No token, ask for one
            tokenClient.current?.requestAccessToken();
        }
    };

    return (
        <div className="w-full mx-auto">
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300",
                    isDragging
                        ? 'border-primary bg-primary/10 scale-[1.02]'
                        : 'border-white/20 hover:border-white/40 bg-white/5'
                )}
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
                        <p className="text-muted-foreground">or click to browse files from your device</p>
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
                <Card variant="glass" className="mt-8 space-y-4 border-white/10">
                    <div className="space-y-4">
                        {files.map((file) => (
                            <div key={file.name} className="flex flex-col gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <DocumentIcon className="w-8 h-8 text-indigo-400" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-white truncate">{file.name}</span>
                                            <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-300",
                                                    uploadStatus[file.name] === 'error' ? 'bg-red-500' :
                                                        uploadStatus[file.name] === 'success' ? 'bg-green-500' : 'bg-primary'
                                                )}
                                                style={{ width: `${uploadProgress[file.name] || 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="w-8 flex justify-center">
                                        {uploadStatus[file.name] === 'success' && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                                        {uploadStatus[file.name] === 'error' && <XMarkIcon className="w-6 h-6 text-red-500" />}
                                        {uploadStatus[file.name] === 'pending' && (
                                            <button onClick={() => removeFile(file.name)} className="text-muted-foreground hover:text-white">
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {uploadStatus[file.name] === 'pending' && (
                                    <select
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary/50"
                                        value={fileTypes[file.name] || ''}
                                        onChange={(e) => handleTypeChange(file.name, e.target.value)}
                                    >
                                        <option value="" disabled>Select Document Type</option>
                                        {Object.entries(DOCUMENT_CATEGORIES).map(([category, types]) => (
                                            <optgroup key={category} label={category}>
                                                {types.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/10">
                        <Button
                            onClick={startUploads}
                            disabled={files.every(f => uploadStatus[f.name] !== 'pending')}
                            variant="premium"
                        >
                            Start Upload
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default UploadZone;
