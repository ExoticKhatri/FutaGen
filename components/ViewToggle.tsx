import { Library, Wand2 } from 'lucide-react';

interface ViewToggleProps {
  activeTab: 'canvas' | 'library';
  onToggle: () => void;
}

export default function ViewToggle({ activeTab, onToggle }: ViewToggleProps) {
  return (
    <div className="absolute top-8 right-8 z-50">
      <button 
        onClick={onToggle}
        className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg hover:border-teal-500 transition-colors text-sm font-medium text-white shadow-xl"
      >
        {activeTab === 'canvas' ? (
          <>
            <Library size={16} className="text-teal-500" />
            <span>Switch to Library</span>
          </>
        ) : (
          <>
            <Wand2 size={16} className="text-teal-500" />
            <span>Back to Creator</span>
          </>
        )}
      </button>
    </div>
  );
}