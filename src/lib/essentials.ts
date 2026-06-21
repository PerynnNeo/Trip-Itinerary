// Static "essentials & safety" content. Emergency numbers (112/119/1330) and the
// Singapore Embassy details are verified; hotel phone numbers should be added from
// your booking confirmations.

export interface PhoneItem {
  label: string;
  number: string;
  sub: string;
  danger?: boolean;
}

export const EMERGENCY: PhoneItem[] = [
  { label: 'Police', number: '112', sub: 'Crime · theft · danger', danger: true },
  { label: 'Fire · Ambulance · Medical', number: '119', sub: 'Medical emergency or fire', danger: true },
  { label: 'Korea Travel Helpline', number: '1330', sub: '24 h · English & live translation', danger: false },
  { label: 'Seoul Dasan Call Center', number: '120', sub: 'City info (some English)', danger: false },
];

export const EMBASSY = {
  name: 'Singapore Embassy · Seoul',
  address: '28F, Seoul Finance Center, 136 Sejong-daero, Jung-gu, Seoul 04520',
  korean: '서울 중구 세종대로 136 서울파이낸스센터 28층',
  phone: '+82-2-774-2464',
  hours: 'Mon–Fri 09:00–12:30 · 13:30–17:30',
  afterHours: '+65 6379 8800',
  afterHoursLabel: 'MFA Duty Office · 24 h from overseas',
};

export interface HotelItem {
  name: string;
  nights: string;
  address: string;
  korean: string;
}

export const HOTELS: HotelItem[] = [
  {
    name: 'New Seoul Hotel Myeongdong',
    nights: 'Nights 1–5',
    address: '29-1 Eulji-ro, Jung-gu, Seoul',
    korean: '서울 중구 을지로 29-1',
  },
  {
    name: 'Orakai Songdo Park Hotel',
    nights: 'Nights 6–7',
    address: '240 Incheon Tower-daero, Yeonsu-gu, Incheon',
    korean: '인천 연수구 인천타워대로 240',
  },
];

export const FLIGHTS = [
  {
    label: 'Return · SQ608',
    value: 'ICN T1 08:50 → Singapore Changi T2 14:25',
    sub: 'Thu 14 Nov · Singapore Airlines',
  },
];

export const TIPS: string[] = [
  'Dial 1330 for free 24 h English help and live translation — they can even speak to a taxi driver for you.',
  'Show a driver the Korean address above, or drop a pin in KakaoT / Naver Map.',
  'Carry your passport for tax-refund desks; T-money covers all subways and buses.',
];
