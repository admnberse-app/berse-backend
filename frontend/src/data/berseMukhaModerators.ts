export interface BerseMukhaModerator {
  id: string;
  name: string;
  number: number;
  color: string;
  colorCode: string;
  avatar?: string;
  maxParticipants: number;
  currentParticipants: number;
}

export const berseMukhaModerators: BerseMukhaModerator[] = [
  { id: 'mod-1', name: 'Aisha', number: 1, color: 'Red', colorCode: '#EF4444', maxParticipants: 7, currentParticipants: 0 },
  { id: 'mod-2', name: 'Omar', number: 2, color: 'Blue', colorCode: '#3B82F6', maxParticipants: 7, currentParticipants: 0 },
  { id: 'mod-3', name: 'Fatima', number: 3, color: 'Green', colorCode: '#10B981', maxParticipants: 7, currentParticipants: 0 },
  { id: 'mod-4', name: 'Hassan', number: 4, color: 'Purple', colorCode: '#8B5CF6', maxParticipants: 7, currentParticipants: 0 },
  { id: 'mod-5', name: 'Mariam', number: 5, color: 'Orange', colorCode: '#F97316', maxParticipants: 7, currentParticipants: 0 },
  { id: 'mod-6', name: 'Ali', number: 6, color: 'Pink', colorCode: '#EC4899', maxParticipants: 7, currentParticipants: 0 },
  { id: 'mod-7', name: 'Zahra', number: 7, color: 'Teal', colorCode: '#14B8A6', maxParticipants: 7, currentParticipants: 0 },
  { id: 'mod-8', name: 'Ibrahim', number: 8, color: 'Indigo', colorCode: '#6366F1', maxParticipants: 7, currentParticipants: 0 },
  { id: 'mod-9', name: 'Khadija', number: 9, color: 'Yellow', colorCode: '#EAB308', maxParticipants: 7, currentParticipants: 0 },
  { id: 'mod-10', name: 'Yusuf', number: 10, color: 'Lime', colorCode: '#84CC16', maxParticipants: 7, currentParticipants: 0 },
  { id: 'mod-11', name: 'Safiya', number: 11, color: 'Cyan', colorCode: '#06B6D4', maxParticipants: 7, currentParticipants: 0 },
  { id: 'mod-12', name: 'Bilal', number: 12, color: 'Rose', colorCode: '#F43F5E', maxParticipants: 7, currentParticipants: 0 },
  { id: 'mod-13', name: 'Amina', number: 13, color: 'Violet', colorCode: '#A78BFA', maxParticipants: 7, currentParticipants: 0 },
  { id: 'mod-14', name: 'Hamza', number: 14, color: 'Amber', colorCode: '#F59E0B', maxParticipants: 7, currentParticipants: 0 },
  { id: 'mod-15', name: 'Sumaya', number: 15, color: 'Emerald', colorCode: '#10B981', maxParticipants: 7, currentParticipants: 0 }
];

export const getAvailableModerators = (): BerseMukhaModerator[] => {
  return berseMukhaModerators.filter(mod => mod.currentParticipants < mod.maxParticipants);
};

export const getModeratorById = (id: string): BerseMukhaModerator | undefined => {
  return berseMukhaModerators.find(mod => mod.id === id);
};

export const getModeratorByNumber = (number: number): BerseMukhaModerator | undefined => {
  return berseMukhaModerators.find(mod => mod.number === number);
};

export const assignParticipantToModerator = (moderatorId: string): boolean => {
  const moderator = berseMukhaModerators.find(mod => mod.id === moderatorId);
  if (moderator && moderator.currentParticipants < moderator.maxParticipants) {
    moderator.currentParticipants++;
    return true;
  }
  return false;
};