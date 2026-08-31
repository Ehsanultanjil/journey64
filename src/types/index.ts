export type DistrictStatus = 'not_visited' | 'want_to_visit' | 'visited';

export type DistrictDivision =
  | 'Barishal'
  | 'Chattogram'
  | 'Dhaka'
  | 'Khulna'
  | 'Mymensingh'
  | 'Rajshahi'
  | 'Rangpur'
  | 'Sylhet';

export interface District {
  id: string;
  name: string;
  bn_name: string;
  division: DistrictDivision;
  lat: number;
  long: number;
  path: string;
  center: [number, number];
  bounds: [[number, number], [number, number]];
  tagline?: string;
  famousSpots?: string[];
  headquarter?: string;
  areaKm2?: number;
  isCoastal?: boolean;
  isHill?: boolean;
}

export interface DistrictUserData {
  districtId: string;
  status: DistrictStatus;
  rating?: number; // 1-5
  isFavorite?: boolean;
  notes?: string;
  firstVisitedDate?: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  districtId: string;
  visitId?: string;
  url: string;
  caption?: string;
  sortOrder: number;
  isCover?: boolean;
  isFavoriteMemory?: boolean;
  takenDate?: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  districtId: string;
  tripId?: string;
  tripName?: string;
  visitDate: string;
  title?: string;
  notes?: string;
  rating?: number;
  photos: Photo[];
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  notes?: string;
  districtIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: 'milestone' | 'exploration' | 'memory' | 'journey';
  currentValue: number;
  targetValue: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface UserProfile {
  name: string;
  displayName?: string;
  avatarUrl?: string;
  homeDistrictId?: string;
  bio?: string;
  joinedDate: string;
}

export interface DivisionStat {
  division: DistrictDivision;
  visited: number;
  wantToVisit: number;
  total: number;
  percentage: number;
  districts: District[];
}

export interface TravelStats {
  visitedCount: number;
  wantToVisitCount: number;
  notVisitedCount: number;
  percentageExplored: number;
  divisionsExploredCount: number;
  totalTrips: number;
  totalPhotos: number;
  totalMemories: number;
  mostVisitedDistrict?: { id: string; name: string; visits: number };
  mostExploredDivision?: { division: DistrictDivision; visited: number; total: number };
  firstVisitedDistrict?: { id: string; name: string; date: string; photoUrl?: string };
  latestVisitedDistrict?: { id: string; name: string; date: string; photoUrl?: string };
}

export type ActiveTab = 'explore' | 'memories' | 'settings';
