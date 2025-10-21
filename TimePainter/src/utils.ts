// --- Color Palette ---
export const CATEGORY_COLORS: { [key: string]: string } = {
  "学習": "bg-blue-500",
  "仕事": "bg-green-500",
  "趣味": "bg-yellow-500",
  "休憩": "bg-pink-500",
  "運動": "bg-purple-500",
  "その他": "bg-gray-500",
};

export const CATEGORY_HEX_COLORS: { [key: string]: string } = {
  "学習": "#3b82f6", // blue-500
  "仕事": "#22c55e", // green-500
  "趣味": "#eab308", // yellow-500
  "休憩": "#ec4899", // pink-500
  "運動": "#8b5cf6", // purple-500
  "その他": "#6b7280", // gray-500
};

export const CATEGORY_BORDERS: { [key: string]: string } = {
  "学習": "border-blue-700",
  "仕事": "border-green-700",
  "趣味": "border-yellow-700",
  "休憩": "border-pink-700",
  "運動": "border-purple-700",
  "その他": "border-gray-700",
};

// --- Helper Functions ---
export const generateHours = (): string[] => {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });
};

export const formatDateKey = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const isToday = (someDate: Date | null): boolean => {
    if (!someDate) return false;
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
           someDate.getMonth() === today.getMonth() &&
           someDate.getFullYear() === today.getFullYear();
};

export const areDatesEqual = (date1: Date | null, date2: Date | null): boolean => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
};
