import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { PlusCircle, Layout, X, Trash2, Eye, Palette, RotateCcw, RotateCw, Clipboard, FileUp, LogOut } from 'lucide-react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Toolbar from './Toolbar';
import ContentEditable from 'react-contenteditable';
import { applyTextFormat as applyTextFormatUtil } from '../utils/textFormatting';
import WindowContent from './WindowContent';
import { isValidUrl } from '../utils/urlValidator';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ResponsiveGridLayout = WidthProvider(Responsive);

const customStyles = `
  .react-grid-item.react-grid-placeholder {
    background: none !important;
    opacity: 0 !important;
    border: none !important;
  }
  .node-frame {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    cursor: move;
  }
  .node-content {
    position: absolute;
    top: 32px;
    left: 8px;
    right: 8px;
    bottom: 8px;
    overflow: auto;
  }
  .node-buttons {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    z-index: 10;
    pointer-events: none;
  }
  .node-button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    margin-left: 4px;
    color: rgba(0, 0, 0, 0.5);
    transition: color 0.2s;
    pointer-events: auto;
  }
  .node-button:hover {
    color: rgba(0, 0, 0, 0.8);
  }
  .resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 20px;
    height: 20px;
    cursor: se-resize;
  }
  .image-container {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .image-container img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: object-fit 0.3s ease;
  }
  .react-grid-item:hover .image-container img {
    object-fit: cover;
  }
  .react-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQuMiA0LjIgTCA0LjIgNC4yIEwgNC4yIDAgTCA2IDAgTCA2IDYgTCA2IDYgWiIgZmlsbD0iIzAwMDAwMCIvPjwvZz48L3N2Zz4=');
    background-position: bottom right;
    padding: 0 3px 3px 0;
    background-repeat: no-repeat;
    background-origin: content-box;
    box-sizing: border-box;
    cursor: se-resize;
  }
`;

const ContentManagementUI = () => {
  const { user, handleLogout, projects, setProjects, projectWindows, setProjectWindows, saveUserData } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeProject, setActiveProject] = useState({ id: '1', name: 'Untitled' });
  const [previewWindow, setPreviewWindow] = useState(null);
  const [colorPaletteOpen, setColorPaletteOpen] = useState(false);
  const [textColorPaletteOpen, setTextColorPaletteOpen] = useState(false);
  const previewRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [editingProject, setEditingProject] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  const findAvailablePosition = useCallback((windows = []) => {
    const occupiedPositions = new Set(windows.map(w => `${w.x},${w.y}`));
    for (let y = 0; y < 1000; y++) {
      for (let x = 0; x < 4; x++) {
        if (!occupiedPositions.has(`${x},${y}`)) {
          return { x, y };
        }
      }
    }
    return { x: 0, y: 0 };
  }, []);

  const addProject = useCallback(() => {
    const newProjectId = Date.now().toString();
    const newProject = { id: newProjectId, name: 'Untitled' };
    setProjects(prev => [...prev, newProject]);
    setProjectWindows(prev => ({ ...prev, [newProjectId]: [] }));
    setActiveProject(newProject);
  }, [setProjectWindows, setProjects]);

  const switchProject = useCallback((project) => {
    setActiveProject(project);
  }, []);

  const closeProject = useCallback((projectToClose) => {
    if (projects.length > 1) {
      setProjects(prev => prev.filter(p => p.id !== projectToClose.id));
      setProjectWindows(prev => {
        const { [projectToClose.id]: removed, ...rest } = prev;
        return rest;
      });
      if (activeProject.id === projectToClose.id) {
        setActiveProject(projects.find(p => p.id !== projectToClose.id) || projects[0]);
      }
    }
  }, [projects, activeProject, setProjectWindows, setProjects]);

  const startRenameProject = useCallback((project) => {
    setEditingProject(project.id);
  }, []);

  const finishRenameProject = useCallback((project, newName) => {
    if (newName.trim() && newName !== project.name) {
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, name: newName } : p));
      if (activeProject.id === project.id) {
        setActiveProject(prev => ({ ...prev, name: newName }));
      }
    }
    setEditingProject(null);
  }, [activeProject, setProjects]);

  const addWindow = useCallback(() => {
    const currentWindows = projectWindows[activeProject.id] || [];
    const { x, y } = findAvailablePosition(currentWindows);
    const newWindow = {
      i: `${Date.now()}`,
      x,
      y,
      w: 2,
      h: 2,
      content: '',
      bgColor: 'bg-white/80'
    };
    setProjectWindows(prev => ({
      ...prev,
      [activeProject.id]: [...(prev[activeProject.id] || []), newWindow]
    }));
  }, [activeProject, projectWindows, findAvailablePosition, setProjectWindows]);

  const addWindowFromClipboard = useCallback(async () => {
    try {
      let content = '';
      let bgColor = 'bg-white/80';

      // Try to read from clipboard
      if (navigator.clipboard && navigator.clipboard.readText) {
        content = await navigator.clipboard.readText();
      } else {
        // Fallback for browsers that don't support clipboard API
        content = await new Promise((resolve) => {
          const textArea = document.createElement("textarea");
          document.body.appendChild(textArea);
          textArea.focus();
          document.execCommand("paste");
          resolve(textArea.value);
          document.body.removeChild(textArea);
        });
      }

      content = content.trim();

      if (isValidUrl(content)) {
        // If it's a valid URL, we'll keep it as is
      } else if (content.startsWith('<iframe') && content.includes('pinterest.com')) {
        // Extract Pinterest pin ID from iframe src
        const match = content.match(/id=(\d+)/);
        if (match && match[1]) {
          content = `https://www.pinterest.com/pin/${match[1]}/`;
        }
      } else if (content.includes('class="twitter-tweet"')) {
        // It's a Twitter embed, keep it as is
      } else if (content.includes('class="reddit-embed-bq"')) {
        // It's a Reddit embed, keep it as is
      } else if (content.startsWith('<')) {
        // If it starts with '<', it might be HTML. Wrap it in a div.
        content = `<div>${content}</div>`;
      } else {
        // If it's just text, wrap it in a p tag
        content = `<p>${content}</p>`;
      }

      const { x, y } = findAvailablePosition(projectWindows[activeProject.id]);
      const newWindow = {
        i: `${Date.now()}`,
        x,
        y,
        w: 2,
        h: 2,
        content,
        bgColor
      };
      setProjectWindows(prev => ({
        ...prev,
        [activeProject.id]: [...prev[activeProject.id], newWindow]
      }));
    } catch (err) {
      console.error('Failed to read clipboard contents:', err);
      alert('Unable to read from clipboard. Please check your browser permissions.');
    }
  }, [activeProject, projectWindows, findAvailablePosition, setProjectWindows]);

  const addWindowFromFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        let content = '';
        let bgColor = 'bg-white/80';

        if (file.type === 'application/pdf') {
          // Handle PDF
          content = URL.createObjectURL(file);
        } else if (file.type.startsWith('image/')) {
          // Handle Image
          content = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
        }

        const { x, y } = findAvailablePosition(projectWindows[activeProject.id]);
        const newWindow = {
          i: `${Date.now()}`,
          x,
          y,
          w: 2,
          h: 2,
          content,
          bgColor,
          contentType: file.type.startsWith('image/') ? 'image' : 'pdf'
        };
        setProjectWindows(prev => ({
          ...prev,
          [activeProject.id]: [...prev[activeProject.id], newWindow]
        }));
      }
    };
    input.click();
  }, [activeProject, projectWindows, findAvailablePosition, setProjectWindows]);

  const removeWindow = useCallback((id) => {
    setProjectWindows(prev => ({
      ...prev,
      [activeProject.id]: prev[activeProject.id].filter(window => window.i !== id)
    }));
  }, [activeProject, setProjectWindows]);

  const openPreview = useCallback((window, e) => {
    e.stopPropagation();
    setPreviewWindow(window);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewWindow(null);
    setColorPaletteOpen(false);
    setTextColorPaletteOpen(false);
  }, []);

  const toggleColorPalette = useCallback(() => {
    setColorPaletteOpen(prev => !prev);
    setTextColorPaletteOpen(false);
  }, []);

  const toggleTextColorPalette = useCallback(() => {
    setTextColorPaletteOpen(prev => !prev);
    setColorPaletteOpen(false);
  }, []);

  const changeWindowColor = useCallback((color) => {
    if (previewWindow) {
      setProjectWindows(prev => ({
        ...prev,
        [activeProject.id]: prev[activeProject.id].map(w =>
          w.i === previewWindow.i ? { ...w, bgColor: color } : w
        )
      }));
      setPreviewWindow(prev => ({ ...prev, bgColor: color }));
    }
    setColorPaletteOpen(false);
  }, [previewWindow, activeProject, setProjectWindows]);

  const handlePreviewEdit = useCallback((event) => {
    const newContent = event.target.value;
    setPreviewWindow(prev => ({ ...prev, content: newContent }));
    setProjectWindows(prev => ({
      ...prev,
      [activeProject.id]: prev[activeProject.id].map(w =>
        w.i === previewWindow.i ? { ...w, content: newContent } : w
      )
    }));
    
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newContent]);
    setHistoryIndex(prev => prev + 1);
  }, [previewWindow, historyIndex, activeProject, setProjectWindows]);

  const handleTextFormat = useCallback((format, color = '') => {
    if (!previewRef.current) return;
    
    const updatedContent = applyTextFormatUtil(previewRef.current, format, color);
    
    setPreviewWindow(prev => ({ ...prev, content: updatedContent }));
    setProjectWindows(prev => ({
      ...prev,
      [activeProject.id]: prev[activeProject.id].map(w =>
        w.i === previewWindow.i ? { ...w, content: updatedContent } : w
      )
    }));
    
    setHistory(prev => [...prev.slice(0, historyIndex + 1), updatedContent]);
    setHistoryIndex(prev => prev + 1);
    
    previewRef.current.focus();
  }, [previewWindow, historyIndex, activeProject, setProjectWindows]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      const previousContent = history[historyIndex - 1];
      setPreviewWindow(prev => ({ ...prev, content: previousContent }));
      setProjectWindows(prev => ({
        ...prev,
        [activeProject.id]: prev[activeProject.id].map(w =>
          w.i === previewWindow.i ? { ...w, content: previousContent } : w
        )
      }));
    }
  }, [historyIndex, history, previewWindow, activeProject, setProjectWindows]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      const nextContent = history[historyIndex + 1];
      setPreviewWindow(prev => ({ ...prev, content: nextContent }));
      setProjectWindows(prev => ({
        ...prev,
        [activeProject.id]: prev[activeProject.id].map(w =>
          w.i === previewWindow.i ? { ...w, content: nextContent } : w
        )
      }));
    }
  }, [historyIndex, history, previewWindow, activeProject, setProjectWindows]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }

    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b': 
          e.preventDefault();
          handleTextFormat('bold'); 
          break;
        case 'i': 
          e.preventDefault();
          handleTextFormat('italic'); 
          break;
        case 'u': 
          e.preventDefault();
          handleTextFormat('underline'); 
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        default:
          // Do nothing for other keys
          break;
      }
    }
  }, [handleTextFormat, undo, redo]);

  const saveFormattedContent = useCallback(() => {
    if (previewRef.current && previewWindow) {
      const formattedContent = previewRef.current.innerHTML;
      setProjectWindows(prev => ({
        ...prev,
        [activeProject.id]: prev[activeProject.id].map(w =>
          w.i === previewWindow.i ? { ...w, content: formattedContent } : w
        )
      }));
    }
  }, [previewWindow, activeProject, setProjectWindows]);

  useEffect(() => {
    return saveFormattedContent;
  }, [saveFormattedContent]);

  const colorOptions = useMemo(() => [
    'bg-white/80', 'bg-red-100/80', 'bg-yellow-100/80', 
    'bg-green-100/80', 'bg-blue-100/80', 'bg-purple-100/80'
  ], []);

  const textColorOptions = useMemo(() => [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'
  ], []);

  // Update the layout change handler
  const onLayoutChange = useCallback((newLayout) => {
    setProjectWindows(prev => {
      const currentWindows = prev[activeProject.id] || [];
      if (currentWindows.length === 0) {
        console.warn(`No windows found for project with id ${activeProject.id}`);
        return prev;
      }
      
      return {
        ...prev,
        [activeProject.id]: currentWindows.map(window => {
          const layoutItem = newLayout.find(item => item.i === window.i);
          return layoutItem ? { ...window, x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h } : window;
        })
      };
    });
  }, [activeProject, setProjectWindows]);

  // Get the current project's windows
  const currentWindows = projectWindows[activeProject.id] || [];

  const onLogout = useCallback(() => {
    const logoutSuccessful = handleLogout();
    if (logoutSuccessful) {
      navigate('/login', { replace: true });
    }
  }, [handleLogout, navigate]);

  // Update the saveUserData call
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (user) {
        saveUserData();
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [projects, projectWindows, user, saveUserData]);

  // Add this useEffect to log activeProject when it changes
  useEffect(() => {
    console.log('Active project changed:', activeProject);
  }, [activeProject]);

  useEffect(() => {
    if (user) {
      setProjects(user.projects || []);
      const windows = {};
      user.projects.forEach(project => {
        windows[project.id] = project.windows || [];
      });
      setProjectWindows(windows);
    }
  }, [user, setProjects, setProjectWindows]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-200/50">
      <style>{customStyles}</style>

      {/* Sidebar */}
      <div className={`bg-gray-100/80 shadow-lg transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold text-red-800 ${!isSidebarOpen && 'hidden'}`}>Power</h2>
            <button onClick={toggleSidebar} className="w-8 h-8 flex items-center justify-center focus:outline-none">
              <Layout size={20} className={`transform transition-transform ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`} />
            </button>
          </div>
          <button onClick={addProject} className={`flex items-center text-gray-700 hover:bg-gray-200/50 py-2 rounded-lg w-full ${!isSidebarOpen && 'justify-center'}`}>
            <PlusCircle size={18} />
            {isSidebarOpen && <span className="ml-2">Start new</span>}
          </button>
        </div>
        <nav className={`mt-4 ${!isSidebarOpen && 'hidden'}`}>
          {projects.map((project) => (
            <div 
              key={project.id} 
              className={`flex items-center justify-between px-4 py-2 text-gray-600 hover:bg-gray-200/50 cursor-pointer ${activeProject.id === project.id ? 'bg-gray-200/50' : ''}`}
              onClick={() => switchProject(project)}
              onDoubleClick={() => startRenameProject(project)}
            >
              {editingProject === project.id ? (
                <input
                  type="text"
                  defaultValue={project.name}
                  onBlur={(e) => finishRenameProject(project, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      finishRenameProject(project, e.target.value);
                    }
                  }}
                  className="bg-transparent border-none focus:outline-none w-full"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span 
                  className={`flex-grow ${activeProject.id === project.id ? 'font-bold' : ''}`}
                  style={{ color: 'black', fontSize: '16px' }} // Temporary style for debugging
                >
                  {project.name || 'Unnamed Project'}
                </span>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  closeProject(project);
                }}
                className="ml-2"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </nav>
        {/* Add logout button */}
        <div className="mt-auto p-4">
          <button
            onClick={onLogout}
            className={`flex items-center text-gray-700 hover:bg-gray-200/50 py-2 rounded-lg w-full ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="ml-2">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 bg-gray-300/30 relative overflow-auto">
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: currentWindows.map(window => ({
              i: window.i,
              x: window.x,
              y: window.y,
              w: window.w,
              h: window.h,
            })) }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 4, md: 4, sm: 2, xs: 1, xxs: 1 }}
            rowHeight={150}
            onLayoutChange={onLayoutChange}
            isDraggable={true}
            isResizable={true}
            resizeHandle={<div className="react-resizable-handle" />}
            margin={[16, 16]}
            draggableHandle=".node-frame"
            useCSSTransforms={true}
            containerPadding={[0, 0]}
            style={{ minHeight: '100%' }}
          >
            {currentWindows.map((window) => (
              <div
                key={window.i}
                className={`rounded-3xl shadow-lg ${window.bgColor} relative overflow-hidden
                            transition-all duration-200 hover:shadow-xl select-none`}
              >
                <div className="node-frame"></div>
                <div className="node-buttons">
                  <button 
                    onClick={(e) => openPreview(window, e)} 
                    className="node-button"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={(e) => removeWindow(window.i, e)} 
                    className="node-button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="node-content" style={{ height: 'calc(100% - 32px)' }}>
                  <WindowContent content={window.content} contentType={window.contentType} />
                </div>
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>

        {/* Add Window Buttons */}
        <div className="absolute bottom-6 right-6 flex space-x-2">
          <button
            onClick={addWindowFromClipboard}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200"
            title="Add from clipboard"
          >
            <Clipboard size={24} className="text-red-800" />
          </button>
          <button
            onClick={addWindowFromFile}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200"
            title="Import file"
          >
            <FileUp size={24} className="text-red-800" />
          </button>
          <button
            onClick={addWindow}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200"
            title="Add new window"
          >
            <PlusCircle size={24} className="text-red-800" />
          </button>
        </div>
      </div>

      {/* Preview Window */}
      {previewWindow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg w-2/3 h-2/3 ${previewWindow.bgColor} relative`}>
            <div className="absolute top-2 right-2 flex space-x-2">
              <button onClick={undo} className="w-8 h-8 rounded-full bg-gray-300/50 flex items-center justify-center hover:bg-gray-400/50">
                <RotateCcw size={16} />
              </button>
              <button onClick={redo} className="w-8 h-8 rounded-full bg-gray-300/50 flex items-center justify-center hover:bg-gray-400/50">
                <RotateCw size={16} />
              </button>
              <button onClick={toggleColorPalette} className="w-8 h-8 rounded-full bg-gray-300/50 flex items-center justify-center hover:bg-gray-400/50">
                <Palette size={16} />
              </button>
              <button onClick={closePreview} className="w-8 h-8 rounded-full bg-gray-300/50 flex items-center justify-center hover:bg-gray-400/50">
                <X size={16} />
              </button>
            </div>
            {colorPaletteOpen && (
              <div className="absolute top-12 right-2 bg-white p-2 rounded shadow-lg">
                {colorOptions.map((color, index) => (
                  <button
                    key={index}
                    className={`w-6 h-6 m-1 rounded-full ${color}`}
                    onClick={() => changeWindowColor(color)}
                  />
                ))}
              </div>
            )}
            <Toolbar
              activeFormats={[]}
              onFormatClick={handleTextFormat}
              onColorClick={toggleTextColorPalette}
              textColorOptions={textColorOptions}
              textColorPaletteOpen={textColorPaletteOpen}
            />
            <ContentEditable
              innerRef={previewRef}
              html={previewWindow.content}
              disabled={false}
              onChange={handlePreviewEdit}
              onKeyDown={handleKeyDown}
              className="mt-12 h-full overflow-auto p-4"
              style={{ 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word',
                outline: 'none',
                caretColor: 'auto'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ContentManagementUI);