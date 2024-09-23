import React from 'react';
import { Bold, Italic, Underline, Highlighter, Droplet } from 'lucide-react';

const Toolbar = ({ activeFormats, onFormatClick, onColorClick, textColorOptions, textColorPaletteOpen }) => {
  return (
    <div className="absolute top-2 left-2 flex space-x-2 bg-white p-2 rounded-lg shadow-md items-center">
      <button
        onClick={() => onFormatClick('bold')}
        className={`p-1 hover:bg-gray-100 rounded ${activeFormats.includes('bold') ? 'bg-gray-200' : ''}`}
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => onFormatClick('italic')}
        className={`p-1 hover:bg-gray-100 rounded ${activeFormats.includes('italic') ? 'bg-gray-200' : ''}`}
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => onFormatClick('underline')}
        className={`p-1 hover:bg-gray-100 rounded ${activeFormats.includes('underline') ? 'bg-gray-200' : ''}`}
      >
        <Underline size={16} />
      </button>
      <button onClick={() => onFormatClick('h1')} className={`p-1 hover:bg-gray-100 rounded ${activeFormats.includes('h1') ? 'bg-gray-200' : ''}`}>
        <span className="font-bold">H1</span>
      </button>
      <button onClick={() => onFormatClick('h2')} className={`p-1 hover:bg-gray-100 rounded ${activeFormats.includes('h2') ? 'bg-gray-200' : ''}`}>
        <span className="font-bold">H2</span>
      </button>
      <button onClick={() => onFormatClick('h3')} className={`p-1 hover:bg-gray-100 rounded ${activeFormats.includes('h3') ? 'bg-gray-200' : ''}`}>
        <span className="font-bold">H3</span>
      </button>
      <button
        onClick={() => onFormatClick('highlight')}
        className={`p-1 hover:bg-gray-100 rounded ${activeFormats.includes('highlight') ? 'bg-gray-200' : ''}`}
      >
        <Highlighter size={16} />
      </button>
      <div className="relative">
        <button onClick={onColorClick} className="p-1 hover:bg-gray-100 rounded">
          <Droplet size={16} />
        </button>
        {textColorPaletteOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white p-2 rounded-lg shadow-lg">
            {textColorOptions.map((color, index) => (
              <button
                key={index}
                className="w-6 h-6 m-1 rounded-full"
                style={{ backgroundColor: color }}
                onClick={() => onFormatClick('color', color)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Toolbar);
