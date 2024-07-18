export const defaultlBoardabels = [
  { text: '', color: '#61bd4f', backColor: '#519839', selected: false },
  { text: '', color: '#f2d600', backColor: '#d9b51c', selected: false },
  { text: '', color: '#ff9f1a', backColor: '#cd8313', selected: false },
  { text: '', color: '#eb5a46', backColor: '#b04632', selected: false },
  { text: '', color: '#c377e0', backColor: '#89609e', selected: false },
  { text: '', color: '#0079bf', backColor: '#055a8c', selected: false },
];

export const mimeTypes: { [key: string]: string } = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'video/mp4': 'video',
  'video/quicktime': 'video',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'document',
  'application/vnd.ms-excel': 'document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    'document',
  'text/plain': 'document',
  // Add more MIME types as needed
};
