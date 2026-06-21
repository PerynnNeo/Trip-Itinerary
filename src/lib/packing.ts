// Packing checklist for the Seoul × Incheon trip (7–14 Nov 2026, ~5–12 °C).
// Rendered by PackingView; each item is checkable and the ticks live in the
// shared trip state under "pk:{groupIndex}-{itemIndex}" keys. "×3" means one each
// for Jolin, Perris and Perynn.

export interface PackGroup {
  title: string;
  /** icon name from src/lib/icons.tsx */
  icon: string;
  /** soft background tint for the group card header */
  tint: string;
  items: string[];
}

export const PACKING: PackGroup[] = [
  {
    title: 'Documents & money',
    icon: 'wallet',
    tint: '#FFF7E8',
    items: [
      'Passports — valid 6+ months ×3',
      'Flight tickets / boarding passes (checked in ~48 h before)',
      'e-Arrival Card QR — filed at e-arrivalcard.go.kr within 3 days of flying ×3',
      'Travel insurance policy (saved offline)',
      'Credit / debit cards — bank notified',
      'Some KRW cash for day one (before T-money is loaded)',
      'T-money cards (or buy at the airport)',
      'Hotel booking confirmations (saved offline)',
      'Photo / printout of each passport, kept separately',
    ],
  },
  {
    title: 'Tech & charging',
    icon: 'plug',
    tint: '#EAF2FF',
    items: [
      'Phones + chargers ×3',
      'Plug adapters — Korea is Type C/F, 220 V (SG Type G won’t fit)',
      'Power bank — in your carry-on, not checked luggage',
      'eSIM installed / pocket WiFi arranged',
      'Charging cables (USB-C / Lightning)',
      'Earphones',
      'Camera + spare battery & memory card (for the hanbok shoot)',
    ],
  },
  {
    title: 'Clothing — cold weather',
    icon: 'shirt',
    tint: '#F3EEFF',
    items: [
      'Warm padded jacket / coat ×3',
      'Thermal innerwear (Heattech) base layers',
      'Sweaters / long-sleeve tops',
      'Jeans / warm trousers',
      'Comfortable walking shoes — you walk a lot ×3',
      'Flat shoes to wear under the hanbok',
      'Scarf, gloves & beanie',
      'Warm socks & underwear (8 days)',
      'One smart-casual outfit (Samwon Garden dinner)',
      'Sleepwear',
      'Packable umbrella / light rain layer',
    ],
  },
  {
    title: 'Toiletries & health',
    icon: 'health',
    tint: '#FFF0F0',
    items: [
      'Personal medications — in your carry-on',
      'Mini first-aid: plasters, painkillers, motion-sickness tablets',
      'Skincare + a richer moisturiser (cold, dry air)',
      'Lip balm & hand cream',
      'Sunscreen',
      'Toothbrush, toothpaste, deodorant',
      'Glasses / contact lenses + solution',
      'Menstrual supplies',
      'Hand sanitiser & wet wipes',
      'Hairbrush & hair ties',
    ],
  },
  {
    title: 'Shopping & hauls',
    icon: 'shopping',
    tint: '#FFF0F6',
    items: [
      'A foldable empty bag / spare duffel for purchases',
      'Reusable tote for daily shopping',
      'Luggage scale (dodge excess-baggage fees on the way home)',
      'Ziplock bags (snacks, liquids, skincare samples)',
      'Laundry / shoe bag',
    ],
  },
  {
    title: 'Carry-on & flight comfort',
    icon: 'plane',
    tint: '#E9FBF2',
    items: [
      'Neck pillow & eye mask (midnight flight)',
      'Empty water bottle (fill after security)',
      'Snacks for the flight',
      'A change of clothes / essentials in your carry-on',
      'Luggage locks & tags',
    ],
  },
];

/** Total number of packing items across all groups. */
export const PACKING_TOTAL = PACKING.reduce((a, g) => a + g.items.length, 0);
