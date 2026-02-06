import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_KEY = process.env.GDRIVE_API_KEY;
const FOLDER_ID = process.env.GDRIVE_FOLDER_ID;
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'documents.json');

async function fetchGDriveFiles() {
    console.log(`🚀 Fetching files from GDrive folder: ${FOLDER_ID}`);

    const url = 'https://www.googleapis.com/drive/v3/files';
    try {
        const response = await axios.get(url, {
            params: {
                q: `'${FOLDER_ID}' in parents and trashed = false`,
                fields: 'files(id, name, mimeType, size, webViewLink, thumbnailLink, createdTime)',
                key: API_KEY,
                pageSize: 1000,
            },
        });

        const files = response.data.files || [];

        const formattedItems = files.map((file) => {
            let category = 'Other';
            const nameLower = file.name.toLowerCase();
            if (
                nameLower.includes('id') ||
                nameLower.includes('card') ||
                nameLower.includes('passport') ||
                nameLower.includes('aadhar')
            ) {
                category = 'Identity';
            } else if (
                nameLower.includes('tax') ||
                nameLower.includes('invoice') ||
                nameLower.includes('bill')
            ) {
                category = 'Finance';
            } else if (
                nameLower.includes('medical') ||
                nameLower.includes('report')
            ) {
                category = 'Health';
            } else if (
                nameLower.includes('education') ||
                nameLower.includes('result') ||
                nameLower.includes('certificate')
            ) {
                category = 'Education';
            }

            return {
                id: file.id,
                name: file.name,
                mimeType: file.mimeType,
                size: parseInt(file.size || '0'),
                webViewLink: file.webViewLink,
                thumbnailLink: file.thumbnailLink || '',
                category,
                createdTime: file.createdTime,
            };
        });

        const manifest = {
            lastUpdated: new Date().toISOString(),
            version: '1.0.0',
            items: formattedItems,
        };

        if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
            fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

        console.log(`✅ Successfully synced ${formattedItems.length} documents to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error(`❌ Error fetching files: ${error.response?.data?.error?.message || error.message}`);
    }
}

fetchGDriveFiles();
