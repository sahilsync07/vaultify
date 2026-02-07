
const GDRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const GDRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable';
const LOG_FILE_NAME = 'vaultify_audit_logs.json';

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    webViewLink: string;
    thumbnailLink?: string;
    createdTime: string;
    properties?: Record<string, string>;
}

export interface LogEntry {
    timestamp: string;
    user: string;
    action: string;
    details: string;
    fileId?: string;
    fileName?: string;
}

const checkConfig = () => {
    const folderId = import.meta.env.VITE_GDRIVE_FOLDER_ID;
    if (!folderId || folderId === 'undefined') {
        throw new Error('Google Drive Folder ID is missing. Please configure VITE_GDRIVE_FOLDER_ID.');
    }
    return folderId;
};

export const driveService = {
    // List Files from Vault
    listFiles: async (accessToken: string, queryAddon: string = ''): Promise<DriveFile[]> => {
        try {
            const folderId = checkConfig();
            const query = `'${folderId}' in parents and trashing = false ${queryAddon ? `and ${queryAddon}` : ''}`;

            const response = await fetch(`${GDRIVE_API_URL}?q=${encodeURIComponent(query)}&fields=files(id, name, mimeType, webViewLink, thumbnailLink, createdTime, properties)&pageSize=1000`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error('Unauthorized');
                throw new Error('Failed to fetch files');
            }

            const data = await response.json();
            return data.files || [];
        } catch (error) {
            console.error('DriveService List Error:', error);
            throw error;
        }
    },

    // Search specifically for the Log File
    findLogFile: async (accessToken: string): Promise<DriveFile | null> => {
        const files = await driveService.listFiles(accessToken, `name = '${LOG_FILE_NAME}'`);
        return files.length > 0 ? files[0] : null;
    },

    // Read Logs
    fetchLogs: async (accessToken: string): Promise<LogEntry[]> => {
        try {
            const logFile = await driveService.findLogFile(accessToken);
            if (!logFile) return [];

            const response = await fetch(`${GDRIVE_API_URL}/${logFile.id}?alt=media`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error("Error fetching logs:", error);
            return [];
        }
    },

    // Append a Log Entry
    logActivity: async (accessToken: string, entry: Omit<LogEntry, 'timestamp'>) => {
        try {
            const newEntry: LogEntry = {
                ...entry,
                timestamp: new Date().toISOString()
            };

            let logs: LogEntry[] = [];
            let logFileId: string | null = null;

            // 1. Get existing logs
            const existingFile = await driveService.findLogFile(accessToken);
            if (existingFile) {
                logFileId = existingFile.id;
                logs = await driveService.fetchLogs(accessToken);
            }

            // 2. Append new entry
            logs.unshift(newEntry); // Add to top

            // 3. Save back to Drive
            const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });

            const metadata = {
                name: LOG_FILE_NAME,
                mimeType: 'application/json',
                parents: [checkConfig()]
            };

            const method = logFileId ? 'PATCH' : 'POST';
            const url = logFileId
                ? `https://www.googleapis.com/upload/drive/v3/files/${logFileId}?uploadType=multipart`
                : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', blob);

            await fetch(url, {
                method: method,
                headers: { Authorization: `Bearer ${accessToken}` },
                body: form
            });

        } catch (error) {
            console.error('Failed to log activity:', error);
            // Don't throw, logging failure shouldn't crash the app
        }
    },

    // Initialize Resumable Upload
    initConfiguredUpload: async (accessToken: string, file: File, metadata: any) => {
        const folderId = checkConfig();

        const finalMetadata = {
            ...metadata,
            parents: [folderId]
        };

        const response = await fetch(GDRIVE_UPLOAD_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Upload-Content-Type': file.type || 'application/octet-stream',
                'X-Upload-Content-Length': file.size.toString()
            },
            body: JSON.stringify(finalMetadata)
        });

        if (response.status === 401) throw new Error('Unauthorized');
        if (!response.ok) throw new Error('Failed to initiate upload');

        return response.headers.get('Location');
    }
};
