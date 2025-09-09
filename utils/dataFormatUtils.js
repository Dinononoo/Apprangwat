/**
 * Utility functions for formatting and displaying data in the landslide monitoring app
 */

// Translate keys from English to Thai
export const translateKey = (key) => {
  const translations = {
    lat: 'ละติจูด',
    lon: 'ลองจิจูด',
    alt: 'ความสูง',
    altitude: 'ความสูง GPS',
    elevation: 'มุมเงย',
    distance: 'ระยะทาง',
    azimuth: 'มุมแอซิมัท',
    slopeDistance: 'ระยะทางลาดเอียง',
    mode: 'โหมด'
  };
  return translations[key] || key;
};

// Format value based on data type
export const formatValue = (key, value) => {
  // ตรวจสอบค่า undefined, null หรือ NaN
  if (value === undefined || value === null || isNaN(value)) {
    if (key === 'lat' || key === 'lon') return '--°';
    if (key === 'alt' || key === 'slopeDistance') return '-- m';
    if (key === 'altitude' || key === 'azimuth' || key === 'elevation') return '--°';
    if (key === 'mode') return 'โหมดไม่ทราบ';
    return '--';
  }

  // แปลงเป็นตัวเลขเพื่อความปลอดภัย
  const numValue = Number(value);
  
  if (key === 'lat' || key === 'lon') return `${numValue.toFixed(3)}°`;
  if (key === 'alt' || key === 'slopeDistance' || key === 'distance') return `${numValue.toFixed(2)} m`;
  if (key === 'altitude' || key === 'azimuth' || key === 'elevation') return `${numValue.toFixed(2)}°`;
  if (key === 'mode') {
    if (numValue === 1) return "โหมดปกติ";
    if (numValue === 2) return "โหมดแจ้งเตือน";
    return `โหมด: ${numValue}`;
  }
  return numValue.toString();
};

// Get icon for each data type
export const getIconForKey = (key) => {
  switch(key) {
    case 'alt': return '🏔️';
    case 'altitude': return '📍';
    case 'azimuth': return '🧭';
    case 'elevation': return '📐';
    case 'distance': return '📏';
    case 'slopeDistance': return '📐';
    case 'lat': return '🌐';
    case 'lon': return '🌐';
    case 'mode': return '🔔';
    default: return '📊';
  }
};

export const formatSensorValue = (key, value) => {
  // ตรวจสอบค่า undefined, null หรือ NaN
  if (value === undefined || value === null || isNaN(value)) {
    if (key === 'alt' || key === 'slopeDistance' || key === 'distance') return '-- m';
    if (key === 'altitude' || key === 'azimuth' || key === 'elevation') return '--°';
    return '--';
  }

  // แปลงเป็นตัวเลขเพื่อความปลอดภัย
  const numValue = Number(value);
  
  if (key === 'alt' || key === 'slopeDistance' || key === 'distance') return `${numValue.toFixed(2)} m`;
  if (key === 'altitude' || key === 'azimuth' || key === 'elevation') return `${numValue.toFixed(2)}°`;
  return numValue.toString();
};