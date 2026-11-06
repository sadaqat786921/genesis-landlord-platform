import type { Property } from './data';

/* Rooms in a home: what each room is, its size and its photos. The same file is used in every Genesis portal.
   Demo photos are drawings in public/images/rooms. Photos people upload are kept as data URLs. */

export type RoomKind = 'Living room' | 'Kitchen' | 'Dining room' | 'Bedroom' | 'Bathroom' | 'Hallway' | 'Garden' | 'Other';
export const ROOM_KINDS: RoomKind[] = ['Living room', 'Kitchen', 'Dining room', 'Bedroom', 'Bathroom', 'Hallway', 'Garden', 'Other'];
export const FLOORS = ['Basement', 'Ground floor', '1st floor', '2nd floor', '3rd floor', 'Outside'];
export const CONDITIONS = ['Good', 'Fair', 'Poor'] as const;
export type RoomCondition = typeof CONDITIONS[number];

export interface Room {
  id: string; property: string; name: string; kind: RoomKind; floor: string;
  /** Metres. Height is ceiling height; 0 for outside spaces. */
  length: number; width: number; height: number;
  flooring: string; heating: string; windows: string; sockets: number; furnished: string;
  condition: RoomCondition; notes?: string; photos: string[];
  /** Shared houses: the lettable room this bedroom is (for example "Room 3"). */
  letRoom?: string;
  updated: string; by: string;
}

const IMG: Record<RoomKind, string> = { 'Living room': 'living', Kitchen: 'kitchen', 'Dining room': 'dining', Bedroom: 'bedroom', Bathroom: 'bathroom', Hallway: 'hallway', Garden: 'garden', Other: 'living' };
/** The two demo photos for a kind of room. */
export const demoPhotos = (k: RoomKind, flip = false) => flip ? [`images/rooms/${IMG[k]}-2.svg`, `images/rooms/${IMG[k]}-1.svg`] : [`images/rooms/${IMG[k]}-1.svg`, `images/rooms/${IMG[k]}-2.svg`];
export const roomCover = (r: Room) => r.photos[0] ?? `images/rooms/${IMG[r.kind]}-1.svg`;

const r1 = (n: number) => Math.round(n * 10) / 10;
/** Floor area in square metres and square feet. */
export const areaM2 = (r: Pick<Room, 'length' | 'width'>) => r1(r.length * r.width);
export const areaFt2 = (r: Pick<Room, 'length' | 'width'>) => Math.round(r.length * r.width * 10.7639);
export const ftIn = (m: number) => { const inches = Math.round(m * 39.3701); return `${Math.floor(inches / 12)}′${inches % 12}″`; };
export const sizeText = (r: Pick<Room, 'length' | 'width'>) => `${r.length.toFixed(2)} × ${r.width.toFixed(2)} m`;
export const conditionTone = (c: RoomCondition) => c === 'Good' ? 'ok' as const : c === 'Fair' ? 'warn' as const : 'err' as const;

/* ---- demo rooms made from each home's type, bedrooms and bathrooms ---- */
function rand(seed: string) { let h = 2166136261; for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
const SPEC: Record<RoomKind, { l: [number, number]; w: [number, number]; flooring: string; heating: string; windows: string; sockets: number; furnished: string }> = {
  'Living room': { l: [4.2, 5.6], w: [3.4, 4.2], flooring: 'Oak-effect laminate', heating: 'Double radiator', windows: 'Bay window, double glazed', sockets: 6, furnished: 'Sofa, coffee table, curtains' },
  Kitchen: { l: [3.2, 4.4], w: [2.6, 3.4], flooring: 'Vinyl tiles', heating: 'Single radiator', windows: '1 window, double glazed', sockets: 6, furnished: 'Fitted units, oven, hob, fridge freezer, washing machine' },
  'Dining room': { l: [3.4, 4.2], w: [3.0, 3.6], flooring: 'Oak-effect laminate', heating: 'Single radiator', windows: '1 window, double glazed', sockets: 4, furnished: 'Table and 4 chairs' },
  Bedroom: { l: [3.0, 4.6], w: [2.6, 3.8], flooring: 'Carpet', heating: 'Single radiator', windows: '1 window, double glazed', sockets: 4, furnished: 'Double bed, wardrobe, chest of drawers' },
  Bathroom: { l: [2.2, 2.9], w: [1.7, 2.3], flooring: 'Ceramic tiles', heating: 'Heated towel rail', windows: 'Frosted window', sockets: 0, furnished: 'Bath with shower over, basin, WC, mirror' },
  Hallway: { l: [3.6, 5.2], w: [1.1, 1.5], flooring: 'Ceramic tiles', heating: 'Single radiator', windows: 'None', sockets: 2, furnished: 'Coat hooks, shoe rack' },
  Garden: { l: [8, 14], w: [5, 7.5], flooring: 'Lawn and patio', heating: 'None', windows: '—', sockets: 1, furnished: 'Bench, washing line, shed' },
  Other: { l: [2.4, 3.2], w: [2, 2.6], flooring: 'Carpet', heating: 'None', windows: 'None', sockets: 2, furnished: '—' },
};
export const roomDefaults = (k: RoomKind) => SPEC[k];

export function seedRooms(ps: Property[]): Room[] {
  const out: Room[] = [];
  ps.forEach(p => {
    const R = rand(p.id);
    const list: { name: string; kind: RoomKind; floor: string; letRoom?: string }[] = [];
    const fl = Math.min(3, Math.max(1, Math.ceil(+(p.address.match(/Flat (\d+)/)?.[1] ?? 2) / 2)));
    const up = p.type === 'Flat' ? FLOORS[fl + 1] : '1st floor';
    const down = p.type === 'Flat' ? up : 'Ground floor';
    list.push({ name: p.type === 'Flat' ? 'Entrance hall' : 'Hallway', kind: 'Hallway', floor: down });
    if (p.type === 'HMO') {
      list.push({ name: 'Shared lounge', kind: 'Living room', floor: 'Ground floor' }, { name: 'Shared kitchen', kind: 'Kitchen', floor: 'Ground floor' });
      for (let i = 1; i <= (p.rooms ?? p.beds); i++) list.push({ name: `Room ${i}`, kind: 'Bedroom', floor: i <= 2 ? 'Ground floor' : i <= 4 ? '1st floor' : '2nd floor', letRoom: `Room ${i}` });
      for (let i = 1; i <= p.baths; i++) list.push({ name: `Shared bathroom ${i}`, kind: 'Bathroom', floor: i === 1 ? 'Ground floor' : '1st floor' });
    } else {
      list.push({ name: 'Living room', kind: 'Living room', floor: down }, { name: 'Kitchen', kind: 'Kitchen', floor: down });
      if (p.type === 'House' && p.beds >= 3) list.push({ name: 'Dining room', kind: 'Dining room', floor: down });
      for (let i = 1; i <= p.beds; i++) list.push({ name: p.beds === 1 ? 'Bedroom' : `Bedroom ${i}`, kind: 'Bedroom', floor: up });
      for (let i = 1; i <= p.baths; i++) list.push({ name: p.baths === 1 ? 'Bathroom' : i === 1 ? 'Bathroom' : 'En-suite shower room', kind: 'Bathroom', floor: up });
    }
    if (p.type !== 'Flat') list.push({ name: 'Rear garden', kind: 'Garden', floor: 'Outside' });
    list.forEach((x, i) => {
      const sp = SPEC[x.kind]; const L = r1(sp.l[0] + R() * (sp.l[1] - sp.l[0])); const W = r1(sp.w[0] + R() * (sp.w[1] - sp.w[0]));
      const big = x.kind === 'Bedroom' && (x.name === 'Bedroom 1' || x.name === 'Bedroom');
      const cond: RoomCondition = R() > .86 ? 'Fair' : 'Good';
      out.push({
        id: `${p.id}-R${i + 1}`, property: p.id, name: x.name, kind: x.kind, floor: x.floor, letRoom: x.letRoom,
        length: big ? r1(Math.max(L, 4)) : L, width: big ? r1(Math.max(W, 3.3)) : W, height: x.kind === 'Garden' ? 0 : p.type === 'House' && x.floor === 'Ground floor' ? 2.6 : 2.4,
        flooring: sp.flooring, heating: sp.heating, windows: sp.windows, sockets: x.kind === 'Bedroom' && !big ? 3 : sp.sockets,
        furnished: x.kind === 'Bedroom' && !big ? 'Single bed, wardrobe, desk' : sp.furnished,
        condition: cond, notes: cond === 'Fair' ? (x.kind === 'Bathroom' ? 'Sealant round the bath is wearing. Booked to redo at the next visit.' : x.kind === 'Kitchen' ? 'One cupboard door is loose.' : 'Small marks on the walls. Fine for now.') : undefined,
        photos: demoPhotos(x.kind, i % 2 === 1), updated: p.added + ', 10:00', by: 'Move-in inventory',
      });
    });
  });
  return out;
}
