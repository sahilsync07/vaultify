import React from 'react';
import AppLayout from '../layouts/AppLayout';
import UploadZone from '../components/features/UploadZone';
import { Card } from '../components/ui/Card';

const UploadPage: React.FC = () => {
    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold gradient-text">Upload Documents</h1>
                    <p className="text-muted-foreground">
                        Drag and drop your files securely to your encrypted vault.
                        Supports PDF, images, and video up to 500MB.
                    </p>
                </div>

                <Card variant="glass" className="p-8">
                    <UploadZone onUploadComplete={() => {
                        // Optional: Navigate to My Files or show success toast
                        alert("Upload Completed Successfully! Check 'My Files'.");
                    }} />
                </Card>
            </div>
        </AppLayout>
    );
};

export default UploadPage;
