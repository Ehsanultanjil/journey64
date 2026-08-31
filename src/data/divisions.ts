import { DistrictDivision } from '../types';

export interface DivisionMeta {
  name: DistrictDivision;
  bn_name: string;
  districtsCount: number;
  color: string;
  bgLight: string;
  bgDark: string;
  description: string;
}

export const DIVISIONS: DivisionMeta[] = [
  {
    name: 'Barishal',
    bn_name: 'বরিশাল',
    districtsCount: 6,
    color: '#0284c7', // Sky / River blue
    bgLight: 'bg-sky-50 text-sky-700 border-sky-200',
    bgDark: 'dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    description: 'The Venice of Bengal with floating guava markets, tranquil river canals, and Kuakata beach.',
  },
  {
    name: 'Chattogram',
    bn_name: 'চট্টগ্রাম',
    districtsCount: 11,
    color: '#059669', // Emerald forest
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bgDark: 'dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    description: 'Home to the world\'s longest sea beach, Chittagong Hill Tracts, misty mountains, and naval ports.',
  },
  {
    name: 'Dhaka',
    bn_name: 'ঢাকা',
    districtsCount: 13,
    color: '#e11d48', // Crimson heritage
    bgLight: 'bg-rose-50 text-rose-700 border-rose-200',
    bgDark: 'dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    description: 'The historic pulse of Bangladesh with ancient Mughal citadels, palaces, Jamdani looms, and vibrant urban life.',
  },
  {
    name: 'Khulna',
    bn_name: 'খুলনা',
    districtsCount: 10,
    color: '#16a34a', // Mangrove green
    bgLight: 'bg-green-50 text-green-700 border-green-200',
    bgDark: 'dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',
    description: 'Home of the UNESCO Sundarbans mangrove forest, Royal Bengal Tigers, Sixty Dome Mosque, and Lalon\'s shrine.',
  },
  {
    name: 'Mymensingh',
    bn_name: 'ময়মনসিংহ',
    districtsCount: 4,
    color: '#d97706', // Warm amber
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
    bgDark: 'dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    description: 'Land of folk ballads, the scenic white clay lake of Birishiri, Brahmaputra riverbanks, and Garo foothills.',
  },
  {
    name: 'Rajshahi',
    bn_name: 'রাজশাহী',
    districtsCount: 8,
    color: '#ea580c', // Terracotta orange
    bgLight: 'bg-orange-50 text-orange-700 border-orange-200',
    bgDark: 'dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    description: 'The silk city of sweetest mangoes, ancient Buddhist monastery of Somapura Mahavihara, and Puthia temples.',
  },
  {
    name: 'Rangpur',
    bn_name: 'রংপুর',
    districtsCount: 8,
    color: '#4f46e5', // Royal indigo
    bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    bgDark: 'dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    description: 'Northern frontier where Kantajew terracotta temple shines and Kanchenjunga peaks are seen from Tetulia.',
  },
  {
    name: 'Sylhet',
    bn_name: 'সিলেট',
    districtsCount: 4,
    color: '#0d9488', // Teal haor
    bgLight: 'bg-teal-50 text-teal-700 border-teal-200',
    bgDark: 'dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    description: 'Land of two leaves and a bud, spiritual shrines, rolling tea estates, Ratargul swamp, and Tanguar Haor.',
  },
];
