export interface BerseMukhaColor {
  name: string;
  colorCode: string;
}

export const berseMukhaColors: BerseMukhaColor[] = [
  { name: 'Red', colorCode: '#EF4444' },
  { name: 'Blue', colorCode: '#3B82F6' },
  { name: 'Green', colorCode: '#10B981' },
  { name: 'Purple', colorCode: '#8B5CF6' },
  { name: 'Orange', colorCode: '#F97316' },
  { name: 'Pink', colorCode: '#EC4899' },
  { name: 'Teal', colorCode: '#14B8A6' },
  { name: 'Indigo', colorCode: '#6366F1' },
  { name: 'Yellow', colorCode: '#EAB308' },
  { name: 'Lime', colorCode: '#84CC16' },
  { name: 'Cyan', colorCode: '#06B6D4' },
  { name: 'Rose', colorCode: '#F43F5E' },
  { name: 'Violet', colorCode: '#A78BFA' },
  { name: 'Amber', colorCode: '#F59E0B' },
  { name: 'Emerald', colorCode: '#10B981' }
];

export interface BerseMukhaModerator {
  id: string;
  name: string;
  session1Number?: number;
  session2Color?: string;
  session2ColorCode?: string;
}