import React from 'react';
import AppLayout from '../layouts/AppLayout';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { CloudArrowUpIcon, FolderIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome Section */}
        <section className="space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Your encrypted vault is ready. What would you like to do today?
          </p>
        </section>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="glass" className="p-6 hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => navigate('/upload')}>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <CloudArrowUpIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Upload Files</h3>
                <p className="text-sm text-muted-foreground">Securely add new documents</p>
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-6 hover:border-indigo-500/50 transition-colors cursor-pointer group" onClick={() => navigate('/files')}>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <FolderIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Expected Files</h3>
                <p className="text-sm text-muted-foreground">Browse your vault</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats / Overview (Placeholder) */}
        <Card variant="neo" className="p-8 border-white/5 bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Storage Status</h3>
              <p className="text-muted-foreground">Connected to Google Drive</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-emerald-400">Online</span>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;