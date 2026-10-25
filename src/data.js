/* Gulaab Beauty Lounge — site data. Services, prices, stylists and bridal packages live here.
   People, prices, numbers and the address are placeholders for this concept. */

export const img = (id, w = 800) => `/img/p/${id}-${w > 700 ? 1280 : 640}.webp`;

export const CONFIG = {
  name: 'Gulaab Beauty Lounge',
  // Empty for the concept so WhatsApp lets the visitor choose a chat.
  whatsappNumber: '',
  phoneDisplay: '+92 21 3537 0000',
  phoneHref: 'tel:+922135370000',
  instagram: '@gulaab.lounge',
  address: 'Suite 3, 18-C Zamzama Lane 2, DHA Phase 5, Karachi',
  hours: 'Tuesday – Sunday, 11 am – 9 pm · Closed Mondays',
  open: 11, close: 21, closedDay: 1, // Monday
};

export const CATEGORIES = ['Hair', 'Skin', 'Nails', 'Makeup & lashes', 'Mehndi', 'Bridal'];

export const SERVICES = [
  { id: 'cut-blowdry', cat: 'Hair', name: 'Cut & blow-dry', note: 'Wash, consultation, cut and a smooth finish', dur: 60, price: 3500, photo: '1700760934268-8aa0ef52ce0a' },
  { id: 'blowdry', cat: 'Hair', name: 'Blow-dry & styling', note: 'Sleek, bouncy or soft volume', dur: 45, price: 2000, photo: '1580618672591-eb180b1a973f' },
  { id: 'waves', cat: 'Hair', name: 'Soft curls or waves', note: 'Lasts through a long evening', dur: 60, price: 3000, photo: '1734111719430-fe4a3973f8af' },
  { id: 'colour', cat: 'Hair', name: 'Global colour', note: 'Root to tip, ammonia-free options', dur: 120, price: 9000, from: true, photo: '1605980625982-b128a7e7fde2' },
  { id: 'balayage', cat: 'Hair', name: 'Highlights & balayage', note: 'Hand-painted, with toner and gloss', dur: 180, price: 16000, from: true, photo: '1695527081848-1e46c06e6458' },
  { id: 'keratin', cat: 'Hair', name: 'Keratin smoothing', note: 'Frizz-free for up to four months', dur: 180, price: 18000, from: true, photo: '1785456439444-5132a64f0dd7' },
  { id: 'hair-spa', cat: 'Hair', name: 'Hair spa & mask', note: 'Steam, deep mask and scalp massage', dur: 60, price: 4500, photo: '1626383137804-ff908d2753a2' },

  { id: 'hydra-facial', cat: 'Skin', name: 'Hydrating facial', note: 'Cleanse, exfoliate, mask and massage', dur: 75, price: 6500, photo: '1643684391140-c5056cfd3436' },
  { id: 'gold-facial', cat: 'Skin', name: 'Gold glow facial', note: 'Our signature, a week before any event', dur: 90, price: 8500, photo: '1570172619644-dfd03ed5d881' },
  { id: 'clean-up', cat: 'Skin', name: 'Express clean-up', note: 'A quick reset for tired skin', dur: 40, price: 3000, photo: '1616394584738-fc6e612e71b9' },
  { id: 'threading', cat: 'Skin', name: 'Eyebrow threading', note: 'Shaped to suit your face', dur: 15, price: 400, photo: '1589710751893-f9a6770ad71b' },
  { id: 'waxing', cat: 'Skin', name: 'Full arms waxing', note: 'Gentle rica wax', dur: 30, price: 1800, photo: '1600334089648-b0d9d3028eb2' },

  { id: 'manicure', cat: 'Nails', name: 'Classic manicure', note: 'Shape, cuticles, massage and polish', dur: 45, price: 2200, photo: '1632345031435-8727f6897d53' },
  { id: 'pedicure', cat: 'Nails', name: 'Spa pedicure', note: 'Soak, scrub, mask and polish', dur: 60, price: 3200, photo: '1619607146034-5a05296c8f9a' },
  { id: 'gel', cat: 'Nails', name: 'Gel polish', note: 'Chip-free for up to three weeks', dur: 45, price: 3500, photo: '1607779097040-26e80aa78e66' },
  { id: 'nail-art', cat: 'Nails', name: 'Nail art', note: 'Per set, from simple to statement', dur: 60, price: 4500, from: true, photo: '1519014816548-bf5fe059798b' },

  { id: 'party-makeup', cat: 'Makeup & lashes', name: 'Party makeup', note: 'Skin prep, makeup and lashes', dur: 75, price: 9000, photo: '1773688189414-7637b9b138e1' },
  { id: 'soft-glam', cat: 'Makeup & lashes', name: 'Soft glam & hairstyling', note: 'For walimas, engagements and dinners', dur: 120, price: 14000, photo: '1596462502278-27bfdc403348' },
  { id: 'lashes', cat: 'Makeup & lashes', name: 'Lash extensions', note: 'Classic or hybrid, full set', dur: 90, price: 7000, photo: '1522335789203-aabd1fc54bc9' },

  { id: 'mehndi-hands', cat: 'Mehndi', name: 'Mehndi, both hands', note: 'Front and back, to the wrist', dur: 60, price: 3500, photo: '1623217509141-6f735087b50c' },
  { id: 'mehndi-bridal', cat: 'Mehndi', name: 'Bridal mehndi', note: 'Hands and feet, fine detail', dur: 180, price: 15000, photo: '1732118400647-a81e3b37be87' },

  { id: 'bridal-consult', cat: 'Bridal', name: 'Bridal consultation', note: 'Meet your artist, plan the look. Free', dur: 30, price: 0, photo: '1610047614301-13c63f00c032' },
  { id: 'bridal-trial', cat: 'Bridal', name: 'Bridal trial', note: 'A full rehearsal of your look', dur: 120, price: 12000, photo: '1684868268327-7e5590bcfbd6' },
];

export const STYLISTS = [
  { id: 'sana', name: 'Sana Mirza', role: 'Cuts and colour', years: 11, tone: '#e8a0b0', cats: ['Hair'] },
  { id: 'hira', name: 'Hira Jamal', role: 'Skin and facials', years: 8, tone: '#f0c2a8', cats: ['Skin'] },
  { id: 'aiman', name: 'Aiman Shah', role: 'Makeup and bridal', years: 12, tone: '#d98aa0', cats: ['Makeup & lashes', 'Bridal', 'Hair'] },
  { id: 'rabia', name: 'Rabia Khan', role: 'Nails and mehndi', years: 7, tone: '#e6b7c8', cats: ['Nails', 'Mehndi', 'Skin'] },
];

export const BRIDAL = [
  {
    id: 'kali', name: 'Kali', meaning: 'The bud', price: 65000, for: 'A nikah or an intimate mehndi', events: 1,
    lead: 'One beautiful event, done properly.',
    includes: [['makeup', 'Bridal makeup & hairstyling for 1 event'], ['dupatta', 'Dupatta setting and jewellery fixing'], ['lashes', 'Lashes'], ['kit', 'Touch-up kit to take home']],
  },
  {
    id: 'gul', name: 'Gul', meaning: 'The flower', price: 115000, for: 'Mehndi and baraat', events: 2, popular: true,
    lead: 'Two events, a trial, and skin that glows.',
    includes: [['makeup', 'Bridal makeup & hairstyling for 2 events'], ['trial', 'One trial session'], ['dupatta', 'Dupatta setting and jewellery fixing'], ['facial', 'Gold glow facial, a week before'], ['lashes', 'Lashes'], ['kit', 'Touch-up kit to take home']],
  },
  {
    id: 'gulaab', name: 'Gulaab', meaning: 'Full bloom', price: 185000, for: 'Mehndi, baraat and walima', events: 3,
    lead: 'Every event, every detail, start to finish.',
    includes: [['makeup', 'Bridal makeup & hairstyling for 3 events'], ['trial', 'Two trial sessions'], ['dupatta', 'Dupatta setting and jewellery fixing'], ['facial', 'Two pre-bridal facials'], ['manipedi', 'Manicure & pedicure'], ['mehndi', 'Bridal mehndi, hands and feet'], ['lashes', 'Lashes'], ['family', 'Makeup for 2 family members'], ['kit', 'Touch-up kit to take home']],
  },
];

// rows for the full comparison table
export const BRIDAL_ROWS = [
  ['Events covered', (p) => `${p.events}`],
  ['Trial sessions', (p) => ({ kali: '—', gul: '1', gulaab: '2' })[p.id]],
  ['Pre-bridal facials', (p) => ({ kali: '—', gul: '1', gulaab: '2' })[p.id]],
  [['manipedi', 'Manicure & pedicure'], (p) => (p.id === 'gulaab' ? 'Included' : '—')],
  ['Bridal mehndi', (p) => (p.id === 'gulaab' ? 'Hands & feet' : 'Add Rs 15,000')],
  ['Family makeup', (p) => (p.id === 'gulaab' ? '2 people' : '—')],
  ['Dupatta & jewellery setting', () => 'Included'],
  ['Deposit to confirm', (p) => `Rs ${Math.round(p.price * 0.3).toLocaleString('en-PK')}`],
];

export const QUOTES = [
  { text: 'I finally knew the price before I walked in. And the blow-dry lasted three days.', who: 'Mahnoor, Clifton' },
  { text: 'Aiman did my baraat look and my mother cried before I even reached the stage.', who: 'Areeba, DHA' },
  { text: 'Booked a pedicure online at midnight. No DMs, no waiting for a reply.', who: 'Fiza, PECHS' },
];

export const rs = (n) => (n === 0 ? 'Free' : 'Rs ' + Math.round(n).toLocaleString('en-PK'));
export const mins = (m) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} hr${m % 60 ? ` ${m % 60} min` : ''}`);
