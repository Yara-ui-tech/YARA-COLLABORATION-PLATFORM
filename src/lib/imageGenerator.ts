/**
 * SVG Image Generator for tech-themed placeholder assets
 */

export const generateMentorAvatar = (name: string, seed: number): string => {
  const colors = ['6366F1', '8B5CF6', 'EC4899', 'F59E0B', '10B981', '06B6D4'];
  const bgColor = colors[seed % colors.length];
  const textColor = 'FFFFFF';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const size = 120;

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}'%3E%3Crect fill='%23${bgColor}' width='${size}' height='${size}'/%3E%3Ctext x='50%25' y='50%25' font-size='48' font-weight='bold' fill='%23${textColor}' text-anchor='middle' dominant-baseline='middle' font-family='system-ui, -apple-system, sans-serif'%3E${initials}%3C/text%3E%3C/svg%3E`;
};

export const generateEventBanner = (title: string, seed: number): string => {
  const gradients = [
    ['FF6B6B', 'FF8E72'],
    ['4ECDC4', '44A08D'],
    ['FFE66D', 'FFB347'],
    ['95E1D3', '38ADA9'],
    ['F38181', 'AA96DA'],
  ];
  const [color1, color2] = gradients[seed % gradients.length];
  const width = 400;
  const height = 200;
  const truncatedTitle = title.split(' ').slice(0, 5).join(' ').substring(0, 35);

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23${color1};stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23${color2};stop-opacity:1' /%3E%3C/linearGradient%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='white' stroke-width='0.5' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='${width}' height='${height}' fill='url(%23grad)'/%3E%3Crect width='${width}' height='${height}' fill='url(%23grid)'/%3E%3Ctext x='${width/2}' y='${height/2}' font-size='32' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle' font-family='system-ui, -apple-system, sans-serif' opacity='0.9'%3E${truncatedTitle}%3C/text%3E%3C/svg%3E`;
};

export const generateResourceThumbnail = (resourceType: string, seed: number): string => {
  const icons: Record<string, string> = {
    pdf: '📄',
    video: '🎥',
    code: '💻',
    document: '📝',
    image: '🖼️',
    simulation: '⚙️',
    tool: '🛠️',
    default: '📚'
  };

  const colors = ['3B82F6', '8B5CF6', 'EC4899', 'F59E0B', '10B981', '06B6D4', '6366F1'];
  const bgColor = colors[seed % colors.length];
  const size = 200;
  const icon = icons[resourceType.toLowerCase()] || icons.default;

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}'%3E%3Cdefs%3E%3CradialGradient id='radGrad'%3E%3Cstop offset='0%25' style='stop-color:%23${bgColor};stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23${bgColor}CC;stop-opacity:1' /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='${size}' height='${size}' fill='url(%23radGrad)'/%3E%3Ccircle cx='${size/2}' cy='${size/2}' r='40' fill='white' opacity='0.2'/%3E%3Ctext x='${size/2}' y='${size/2}' font-size='80' text-anchor='middle' dominant-baseline='middle'%3E${icon}%3C/text%3E%3C/svg%3E`;
};

export const generateProjectThumbnail = (projectName: string, seed: number): string => {
  const patterns = [
    'M20,20 L80,80 M80,20 L20,80',
    'M50,20 L50,80 M20,50 L80,50',
    'M20,20 Q50,80 80,20',
    'M20,50 Q50,20 80,50',
  ];

  const colors = ['6366F1', '8B5CF6', '#EC4899', '10B981', '06B6D4'];
  const bgColor = colors[seed % colors.length];
  const patternPath = patterns[seed % patterns.length];
  const size = 200;

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}'%3E%3Cdefs%3E%3ClinearGradient id='projectGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:${bgColor.startsWith('#') ? bgColor : '%23' + bgColor};stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:${bgColor.startsWith('#') ? bgColor : '%23' + bgColor};stop-opacity:0.6' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='${size}' height='${size}' fill='url(%23projectGrad)'/%3E%3Cpath d='${patternPath}' stroke='white' stroke-width='2' fill='none' opacity='0.3'/%3E%3Ccircle cx='30' cy='30' r='8' fill='white' opacity='0.6'/%3E%3Ccircle cx='170' cy='170' r='8' fill='white' opacity='0.6'/%3E%3C/svg%3E`;
};

export const generateLoadingAnimation = (): string => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50'%3E%3Ccircle cx='25' cy='25' r='20' fill='none' stroke='%234F46E5' stroke-width='3' opacity='0.2'/%3E%3Ccircle cx='25' cy='25' r='20' fill='none' stroke='%234F46E5' stroke-width='3' stroke-dasharray='31.4' stroke-dashoffset='0' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 25 25' to='360 25 25' dur='0.8s' repeatCount='indefinite' /%3E%3C/circle%3E%3C/svg%3E`;
};
