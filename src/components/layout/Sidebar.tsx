import { HomeIcon, FolderIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useVaultStore } from '../../store/useVaultStore';

export default function Sidebar() {
  const { folders, selectedFolder, setFolder } = useVaultStore();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
        <h1 className="text-xl font-bold">Vaultify</h1>
      </div>

      <button className="w-full btn-primary flex items-center justify-center gap-2 mb-6">
        <PlusIcon className="w-5 h-5" /> Add Item
      </button>

      <nav className="space-y-1">
        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => setFolder(folder.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              selectedFolder === folder.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
            }`}
          >
            {folder.id === 'all' ? <HomeIcon className="w-5 h-5" /> : <FolderIcon className="w-5 h-5" />}
            <span className="flex-1 text-left">{folder.name}</span>
            <span className="text-xs text-gray-500">{folder.itemCount}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}