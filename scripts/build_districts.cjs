const fs = require('fs');

// Read raw geojson
const geojson = JSON.parse(fs.readFileSync('./src/data/bd-raw-geojson.json', 'utf8'));

// Read district info metadata
const infoRaw = JSON.parse(fs.readFileSync('./src/data/bd-districts-info.json', 'utf8'));
const infoDistricts = infoRaw.districts || [];

// Calculate bounding box of all coordinates
let minLng = Infinity, maxLng = -Infinity;
let minLat = Infinity, maxLat = -Infinity;

function traverseCoords(coords, cb) {
  if (typeof coords[0] === 'number') {
    cb(coords[0], coords[1]);
  } else {
    for (const c of coords) traverseCoords(c, cb);
  }
}

for (const feature of geojson.features) {
  traverseCoords(feature.geometry.coordinates, (lng, lat) => {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  });
}

console.log('Geo bounds:', { minLng, maxLng, minLat, maxLat });

// Mercator projection math
function latToMercatorY(latDeg) {
  const rad = (latDeg * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

const minMercY = latToMercatorY(minLat);
const maxMercY = latToMercatorY(maxLat);

// Target SVG viewport: 800 x 1000 with padding
const targetWidth = 800;
const targetHeight = 1000;
const paddingX = 45;
const paddingTop = 45;
const paddingBottom = 45;

const availableW = targetWidth - paddingX * 2;
const availableH = targetHeight - paddingTop - paddingBottom;

const scaleX = availableW / (maxLng - minLng);
const scaleY = availableH / (maxMercY - minMercY);
const scale = Math.min(scaleX, scaleY);

const offsetX = paddingX + (availableW - (maxLng - minLng) * scale) / 2;
const offsetY = paddingTop + (availableH - (maxMercY - minMercY) * scale) / 2;

function project(lng, lat) {
  const x = offsetX + (lng - minLng) * scale;
  const mercY = latToMercatorY(lat);
  const y = offsetY + (maxMercY - mercY) * scale;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

function ringToPath(ring) {
  if (!ring || ring.length === 0) return '';
  let d = '';
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = project(ring[i][0], ring[i][1]);
    d += (i === 0 ? `M${x},${y}` : `L${x},${y}`);
  }
  return d + 'Z';
}

function geometryToPath(geometry) {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map(ringToPath).join('');
  } else if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map(poly => poly.map(ringToPath).join('')).join('');
  }
  return '';
}

function computeCentroidAndBounds(geometry) {
  let sumX = 0, sumY = 0, count = 0;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  traverseCoords(geometry.coordinates, (lng, lat) => {
    const [x, y] = project(lng, lat);
    sumX += x;
    sumY += y;
    count++;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });

  return {
    center: [Math.round((sumX / count) * 10) / 10, Math.round((sumY / count) * 10) / 10],
    bounds: [
      [Math.round(minX * 10) / 10, Math.round(minY * 10) / 10],
      [Math.round(maxX * 10) / 10, Math.round(maxY * 10) / 10]
    ]
  };
}

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

  const path = geometryToPath(feature.geometry);
  const { center, bounds } = computeCentroidAndBounds(feature.geometry);

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
    center,
    bounds,
    isCoastal,
    isHill,
    famousSpots,
    tagline
  };
});

compiled.sort((a, b) => a.name.localeCompare(b.name));

console.log('Compiled', compiled.length, 'districts successfully!');
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
console.log('Successfully written src/data/districts.ts with', compiled.length, 'districts');
