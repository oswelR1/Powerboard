export const initialWindowState = {
  windows: [
    { i: '1', x: 0, y: 0, w: 2, h: 2, content: 'This is Project A and first project doing with new content management app power.', bgColor: 'bg-white/80' },
    { i: '2', x: 2, y: 0, w: 1, h: 1, content: '#2nd Note', bgColor: 'bg-green-100/80' },
    { i: '3', x: 3, y: 0, w: 1, h: 1, content: '#3rd Note', bgColor: 'bg-purple-100/80' },
    { i: '4', x: 0, y: 2, w: 1, h: 1, content: 'Image#1', bgColor: 'bg-white/80' },
    { i: '5', x: 1, y: 2, w: 2, h: 1, content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', bgColor: 'bg-white/80' },
    { i: '6', x: 3, y: 2, w: 1, h: 1, content: 'https://example.com/article', bgColor: 'bg-white/80' },
  ],
  colorOptions: [
    'bg-white/80', 'bg-red-100/80', 'bg-yellow-100/80', 
    'bg-green-100/80', 'bg-blue-100/80', 'bg-purple-100/80'
  ],
  textColorOptions: ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
};

export const windowReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_LAYOUT':
      return {
        ...state,
        windows: state.windows.map(window => {
          const updatedLayout = action.payload.find(item => item.i === window.i);
          return { ...window, ...updatedLayout };
        }),
      };
    case 'ADD_WINDOW':
      const newWindow = {
        i: `${state.windows.length + 1}`,
        x: (state.windows.length * 2) % 12,
        y: Infinity,
        w: 2,
        h: 2,
        content: '',
        bgColor: 'bg-white/80'
      };
      return { ...state, windows: [...state.windows, newWindow] };
    case 'REMOVE_WINDOW':
      return { ...state, windows: state.windows.filter(window => window.i !== action.payload) };
    case 'UPDATE_WINDOW_COLOR':
      return {
        ...state,
        windows: state.windows.map(window =>
          window.i === action.payload.id ? { ...window, bgColor: action.payload.color } : window
        ),
      };
    case 'UPDATE_WINDOW_CONTENT':
      return {
        ...state,
        windows: state.windows.map(window =>
          window.i === action.payload.id ? { ...window, content: action.payload.content } : window
        ),
      };
    default:
      return state;
  }
};
