import React from 'react';
import { X } from 'lucide-react';

const PreviewWindow = ({ window, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`p-6 rounded-lg w-2/3 h-2/3 ${window.bgColor} relative`}>
        <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 hover:bg-gray-300">
          <X size={20} />
        </button>
        <div 
          contentEditable
          onInput={(e) => onEdit(e.target.innerHTML)}
          dangerouslySetInnerHTML={{ __html: window.content }}
          className="mt-8 h-full overflow-auto p-4"
          style={{ 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(PreviewWindow);