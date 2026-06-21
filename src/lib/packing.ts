// Packing checklist for the Seoul × Incheon trip (7–14 Nov 2026, ~5–12 °C).
// Rendered by PackingView; each traveller has their OWN list — ticks live in the
// synced trip state under "pk:{personKey}:{groupIndex}-{itemIndex}" keys.

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
      'Passport — valid 6+ months',
      'Flight tickets / boarding passes (checked in ~48 h before)',
      'e-Arrival Card QR — filed at e-arrivalcard.go.kr within 3 days of flying',
      'Travel insurance policy (saved offline)',
      'Credit / debit cards — bank notified',
      'Some KRW cash for day one (before T-money is loaded)',
      'T-money card (or buy at the airport)',
      'Hotel booking confirmations (saved offline)',
      'Photo / printout of your passport, kept separately',
    ],
  },
  {
    title: 'Tech & charging',
    icon: 'plug',
    tint: '#EAF2FF',
    items: [
      'Phone + charger',
      'Plug adapters — Korea is Type C/F, 220 V (SG Type G won’t fit)',
      'Power bank — in your carry-on, not checked luggage',
      'eSIM installed / pocket WiFi arranged',
      'Charging cables (USB-C / Lightning)',
      'Earphones',
      'Digicam + spare battery & memory card',
    ],
  },
  {
    title: 'Clothing — cold weather',
    icon: 'shirt',
    tint: '#F3EEFF',
    items: [
      'Outfits — about 8 (8 days / 7 nights in Korea)',
      'Jacket',
      'Undergarments',
      'Pajamas',
      'Slippers',
      'Umbrella',
      'Socks',
      'Scarf',
      'Gloves',
      'Thermal innerwear',
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
      'Luggage locks & tags',
    ],
  },
];

/** Total number of packing items across all groups. */
export const PACKING_TOTAL = PACKING.reduce((a, g) => a + g.items.length, 0);
