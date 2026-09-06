import fs from 'fs';
import path from 'path';
import https from 'https';

const images = {
  // Sundarbans Mangrove / Sixty Dome Mosque, Bagerhat
  khulna: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=400&q=80',
  // Birishiri China Clay Lake, Durgapur, Netrokona / Mymensingh
  mymensingh: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
  // Somapura Mahavihara / Paharpur Monastery, Rajshahi
  rajshahi: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=400&q=80',
  // Kantajew Temple / Tajhat Palace, Rangpur
  rangpur: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80',
  // Sreemangal Tea Estates / Ratargul Swamp, Sylhet
  sylhet: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80',
};

console.log('Images configured');
