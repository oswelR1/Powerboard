export const applyTextFormat = (element, format, color = '') => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return element.innerHTML;

  const range = selection.getRangeAt(0);
  const selectedText = range.toString();

  let formattedText = '';
  switch (format) {
    case 'bold':
      formattedText = `<strong>${selectedText}</strong>`;
      break;
    case 'italic':
      formattedText = `<em>${selectedText}</em>`;
      break;
    case 'underline':
      formattedText = `<u>${selectedText}</u>`;
      break;
    case 'h1':
      formattedText = `<h1 style="font-size: 2em; margin: 0.67em 0;">${selectedText}</h1>`;
      break;
    case 'h2':
      formattedText = `<h2 style="font-size: 1.5em; margin: 0.83em 0;">${selectedText}</h2>`;
      break;
    case 'h3':
      formattedText = `<h3 style="font-size: 1.17em; margin: 1em 0;">${selectedText}</h3>`;
      break;
    case 'highlight':
      formattedText = `<mark>${selectedText}</mark>`;
      break;
    case 'color':
      formattedText = `<span style="color:${color}">${selectedText}</span>`;
      break;
    default:
      formattedText = selectedText;
  }

  range.deleteContents();
  const newNode = document.createElement('div');
  newNode.innerHTML = formattedText;
  range.insertNode(newNode.firstChild);

  return element.innerHTML;
};
