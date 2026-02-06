export interface VaultItem {
  id: string;
  type: 'document' | 'note' | 'link' | 'sheet';
  title: string;
  description?: string;
  fileUrl?: string;
  driveLink?: string;
  tags: string[];
  folder: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  itemCount: number;
}