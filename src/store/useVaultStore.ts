import { create } from 'zustand';
import type { VaultItem, Folder } from '../types';

interface VaultState {
  items: VaultItem[];
  folders: Folder[];
  searchQuery: string;
  selectedFolder: string;
  setItems: (items: VaultItem[]) => void;
  setSearch: (query: string) => void;
  setFolder: (folder: string) => void;
}

export const useVaultStore = create<VaultState>((set) => ({
  items: [],
  folders: [
    { id: 'all', name: 'All Items', itemCount: 0 },
    { id: 'work', name: 'Work', itemCount: 0 },
    { id: 'personal', name: 'Personal', itemCount: 0 },
  ],
  searchQuery: '',
  selectedFolder: 'all',
  setItems: (items) => set({ items }),
  setSearch: (searchQuery) => set({ searchQuery }),
  setFolder: (selectedFolder) => set({ selectedFolder }),
}));