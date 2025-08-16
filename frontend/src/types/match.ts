import { SvgIconComponent } from '@mui/icons-material';

export interface ConnectionMode {
  id: string;
  label: string;
  icon: SvgIconComponent;
  description: string;
}

export interface TabType {
  id: string;
  label: string;
}

export interface Connection {
  id: string;
  name: string;
  location: string;
  match: number;
  tags: string[];
  bio: string;
  avatar?: string;
  languages?: string[];
  mutuals?: string[];
  rating?: number;
  reviews?: number;
  verified?: boolean;
  lastSeen?: string;
  availability?: string;
  interests?: string[];
}

export interface Introduction {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  connection?: Connection;
}

export interface Squad {
  id: string;
  name: string;
  description: string;
  members: string[];
  maxMembers: number;
  category: string;
  location: string;
  createdBy: string;
  createdAt: string;
  tags: string[];
  isPrivate: boolean;
}

export interface BingoItem {
  id: string;
  text: string;
  completed: boolean;
  points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface NetworkNode {
  id: string;
  name: string;
  connections: string[];
  position?: { x: number; y: number };
  type: 'user' | 'connection' | 'mutual';
  strength?: number;
}

export interface FilterOptions {
  location?: string;
  interests?: string[];
  languages?: string[];
  availability?: string;
  rating?: number;
  verified?: boolean;
  distance?: number;
  ageRange?: [number, number];
  gender?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
  points: number;
  icon: string;
  category: string;
}