const fs = require('fs');
const d3Geo = require('d3-geo');

// Read raw geojson
const geojson = JSON.parse(fs.readFileSync('./src/data/bd-raw-geojson.json', 'utf8'));

// Read district info metadata
const infoRaw = JSON.parse(fs.readFileSync('./src/data/bd-districts-info.json', 'utf8'));
const infoDistricts = infoRaw.districts || [];

// Target SVG dimensions: 800 x 1000
const projection = d3Geo.geoMercator()
  .fitExtent([[50, 40], [750, 960]], geojson);

const pathGenerator = d3Geo.geoPath().projection(projection);

// Division mapping helpers
const divMap = {
  '1': 'Barishal',
  '2': 'Chattogram',
  '3': 'Dhaka',
  '4': 'Khulna',
  '5': 'Rajshahi',
  '6': 'Rangpur',
  '7': 'Sylhet',
  '8': 'Mymensingh'
};

function toId(name) {
  return name.toLowerCase().replace(/['\.]/g, '').replace(/[\s_]+/g, '-').trim();
}

const coastalSet = new Set([
  'cox-s-bazar', 'chattogram', 'bagerhat', 'khulna', 'satkhira', 'patuakhali',
  'bhola', 'barguna', 'lakshmipur', 'noakhali', 'feni', 'chandpur', 'jhalokati', 'pirojpur'
]);
const hillSet = new Set(['bandarban', 'rangamati', 'khagrachhari']);

const famousSpotsMap = {
  'cox-s-bazar': ["World's Longest Sea Beach", 'Himchari National Park', 'Inani Coral Beach', "Saint Martin's Island"],
  'bandarban': ['Nilgiri Hill Resort', 'Nafakhum Waterfall', 'Sajek-like Cloud Viewpoints', 'Boga Lake', 'Keokradong Peak'],
  'rangamati': ['Kaptai Lake', 'Hanging Bridge', 'Shuvolong Waterfall', 'Sajek Valley Border'],
  'khagrachhari': ['Sajek Valley', 'Alutila Cave', 'Richhang Falls', 'Tareng Viewpoint'],
  'sylhet': ['Ratargul Swamp Forest', 'Bichnakandi', 'Jaflong River Stones', 'Hazrat Shah Jalal Dargah'],
  'moulvibazar': ['Lawachara National Park', 'Madhabkunda Waterfall', 'Sreemangal Tea Gardens', 'Hum Hum Falls'],
  'sunamganj': ['Tanguar Haor Wetland', 'Shimul Bagan (Silk Cotton Forest)', 'Jadukata River', 'Barekkartilla'],
  'habiganj': ['Satchari National Park', 'Baniachong Village', 'Rema-Kalenga Wildlife Sanctuary'],
  'dhaka': ['Lalbagh Fort', 'Ahsan Manzil (Pink Palace)', 'National Parliament House', 'Old Dhaka Heritage'],
  'chattogram': ['Patenga Sea Beach', "Foy's Lake", 'Naval Academy Pier', 'Guliakhali Beach', 'Chandranath Hill'],
  'bagerhat': ['Sixty Dome Mosque (UNESCO)', 'Shrine of Khan Jahan Ali', 'Sundarbans Mangrove Gateway'],
  'khulna': ['Sundarbans Tiger Reserve', 'Rupsha Bridge', 'Karamjal Eco Park', 'Kotka Wildlife Sanctuary'],
  'satkhira': ['Sundarbans West Gateway', 'Munshiganj Forest Pier', 'Shyamnagar Temples'],
  'patuakhali': ['Kuakata Daughter of Sea (Sunrise & Sunset Beach)', 'Fatrar Bon Mangrove'],
  'bhola': ['Char Kukri Mukri Wildlife Sanctuary', 'Monpura Island', 'Meghna River Excursions'],
  'barishal': ['Floating Guava Market (Bhimruli)', 'Durga Sagar Dighi', 'Kirtankhola Riverfront'],
  'bogura': ['Mahasthangarh (Ancient Citadel)', "Gokul Medh (Behula's Basor Ghor)", 'Kherua Mosque', 'Famous Bogra Doi'],
  'rajshahi': ['Varendra Research Museum', 'Padma River Sunset Embankment', 'Puthia Temple Complex', 'Silk & Mango Orchards'],
  'naogaon': ['Somapura Mahavihara at Paharpur (UNESCO)', 'Kusumba Mosque', 'Dubalhati Palace'],
  'dinajpur': ['Kantajew Temple (Terracotta Masterpiece)', 'Ramsagar Dighi', 'Swapnapuri Amusement Park'],
  'panchagarh': ['Tetulia Kanchenjunga Viewpoint', 'Banglabandha Zero Point', 'Plain-land Tea Gardens'],
  'mymensingh': ['Shilpacharya Zainul Abedin Museum', 'Muktagacha Rajbari (Famous Monda)', 'Brahmaputra River Park'],
  'netrokona': ['Birishiri & Shomeshwari River', 'Bijoypur Ceramic Hills', 'Susang Durgapur Palace Ruins'],
  'gazipur': ['Bhawal National Park', 'Bangabandhu Safari Park', 'Heritage Eco Resorts'],
  'narayanganj': ['Panam Nagar Ancient Ghost City', 'Sonargaon Folk Art Museum', 'Goaldi Mosque'],
  'munshiganj': ['Idrakpur Fort', 'Padma River Bridge Vista', 'Atish Dipankar Memorial'],
  'tangail': ['Mohera Jamidar Bari', '201 Dome Mosque', 'Madhupur National Park (Pineapple Orchards)'],
  'brahmanbaria': ['Kharampur Mazar Sharif', 'Titas River Views', 'Arifil Mosque'],
  'comilla': ['Shalban Vihara (Mainamati Buddhist Citadel)', 'Dharmasagar Dighi', 'Famous Comilla Rasmalai'],
  'cumilla': ['Shalban Vihara (Mainamati Buddhist Citadel)', 'Dharmasagar Dighi', 'Famous Comilla Rasmalai']
};

const taglinesMap = {
  'cox-s-bazar': 'The crown jewel of unbroken golden sands and ocean sunsets.',
  'bandarban': 'Majestic misty mountains, roaring waterfalls, and serene tribal valleys.',
  'rangamati': 'Shimmering emerald Kaptai lake waters framed by pine-covered hills.',
  'khagrachhari': 'The gateway to Sajek Valley, mysterious caves, and lush green hills.',
  'sylhet': 'Freshwater swamp forests, crystal stone rivers, and holy shrines.',
  'moulvibazar': 'Endless rolling tea estates and dense tropical rainforest canopy.',
  'sunamganj': 'The ocean-like vastness of Tanguar Haor wetland and crimson Shimul gardens.',
  'dhaka': 'The vibrant 400-year-old historic capital pulsing with heritage and soul.',
  'chattogram': 'The port city where hills meet the sea and historic trade routes began.',
  'bagerhat': 'UNESCO medieval city of mosques built by warrior-saint Khan Jahan Ali.',
  'khulna': 'The gateway to the Sundarbans — home of the Royal Bengal Tiger.',
  'bogura': 'Ancient 3rd-century BC archaeological citadel and legendary curd capital.',
  'rajshahi': 'Padma river breezes, royal terracotta temples, and the Silk City.',
  'naogaon': 'Home to Somapura Mahavihara — the largest Buddhist monastery south of the Himalayas.',
  'dinajpur': 'Intricately carved terracotta Mahabharata legends on the walls of Kantajew.',
  'panchagarh': 'The northernmost tip with direct vistas of the snowy Himalayas and Kanchenjunga.',
  'patuakhali': 'Kuakata — the rare beach where you watch both sunrise and sunset melt into the bay.',
  'bhola': 'The island district of wandering deer, virgin mangroves, and river life.',
  'barishal': 'Venice of Bengal — floating guava markets and winding tidal creeks.'
};

const compiled = geojson.features.map((feature) => {
  const prop = feature.properties || {};
  let name = prop.ADM2_EN || prop.name || '';
  if (name.toLowerCase() === "cox's bazar" || name.toLowerCase() === 'coxs bazar') name = "Cox's Bazar";
  if (name.toLowerCase() === 'chittagong') name = 'Chattogram';
  if (name.toLowerCase() === 'comilla') name = 'Cumilla';
  if (name.toLowerCase() === 'bogra') name = 'Bogura';
  if (name.toLowerCase() === 'jessore') name = 'Jashore';
  if (name.toLowerCase() === 'barisal') name = 'Barishal';
  if (name.toLowerCase() === 'nawabganj' || name.toLowerCase() === 'chapai nawabganj' || name.toLowerCase() === 'chapainawabganj') name = 'Chapainawabganj';
  if (name.toLowerCase() === 'sirajganj') name = 'Sirajgonj';
  if (name.toLowerCase() === 'moulvibazar') name = 'Moulvibazar';
  if (name.toLowerCase() === 'maulvibazar') name = 'Moulvibazar';

  let id = toId(name);
  if (id === 'coxs-bazar') id = 'cox-s-bazar';
  if (id === 'chapainawabganj') id = 'nawabganj';

  const info = infoDistricts.find(d => toId(d.name) === id || toId(d.name) === toId(name) || (id === 'nawabganj' && toId(d.name) === 'nawabganj')) || {};
  
  let division = prop.ADM1_EN || (info.division_id ? divMap[info.division_id] : 'Dhaka');
  if (division === 'Chittagong') division = 'Chattogram';
  if (division === 'Barisal') division = 'Barishal';

  const path = pathGenerator(feature) || '';
  const centroid = pathGenerator.centroid(feature) || [400, 500];
  const bounds = pathGenerator.bounds(feature) || [[0, 0], [800, 1000]];

  const lat = info.lat ? parseFloat(info.lat) : 23.5;
  const long = info.long ? parseFloat(info.long) : 90.0;
  const bn_name = info.bn_name || name;

  const isCoastal = coastalSet.has(id);
  const isHill = hillSet.has(id);
  const famousSpots = famousSpotsMap[id] || [`Famous attractions of ${name}`, `${division} Division Landmarks`];
  const tagline = taglinesMap[id] || `Explore the landscapes, culture, and rich heritage of ${name}.`;

  return {
    id,
    name,
    bn_name,
    division,
    lat,
    long,
    path,
    center: [Math.round(centroid[0] * 10) / 10, Math.round(centroid[1] * 10) / 10],
    bounds: [
      [Math.round(bounds[0][0] * 10) / 10, Math.round(bounds[0][1] * 10) / 10],
      [Math.round(bounds[1][0] * 10) / 10, Math.round(bounds[1][1] * 10) / 10]
    ],
    isCoastal,
    isHill,
    famousSpots,
    tagline
  };
});

compiled.sort((a, b) => a.name.localeCompare(b.name));

console.log('Compiled', compiled.length, 'districts with d3-geo projection.');
fs.writeFileSync('./src/data/compiledDistricts.json', JSON.stringify(compiled, null, 2), 'utf8');

const tsContent = `import type { District } from '../types';

export const DISTRICTS: District[] = ${JSON.stringify(compiled, null, 2)};

export function getDistrictById(id: string): District | undefined {
  return DISTRICTS.find((d) => d.id === id);
}

export function getDistrictsByDivision(division: string): District[] {
  return DISTRICTS.filter((d) => d.division === division);
}
`;

fs.writeFileSync('./src/data/districts.ts', tsContent, 'utf8');
console.log('Successfully written accurate SVG map to src/data/districts.ts');
