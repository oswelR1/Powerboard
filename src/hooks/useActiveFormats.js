import { useState, useCallback } from 'react';

export const useActiveFormats = () => {
  const [activeFormats, setActiveFormats] = useState([]);

  const updateActiveFormats = useCallback((format, color = '') => {
    setActiveFormats(prev => {
      if (format === 'color') {
        return prev.filter(f => f !== 'color').concat(`color:${color}`);
      }
      return prev.includes(format)
        ? prev.filter(f => f !== format)
        : [...prev, format];
    });
  }, []);

  return { activeFormats, updateActiveFormats };
};
