import { useRef, useState, type ReactNode } from 'react';
import { Plus, Camera, ChevronLeft, ChevronRight, X, Pencil, Trash2, Ruler, DoorOpen, ImagePlus, Upload } from 'lucide-react';
import { useStore } from '../store';
import { ME_NAME, nowStamp, type Property } from '../data';
import { Btn, Card, Chip, Drawer, Empty, Field, KV, Modal, Note, Select, Text, Area } from '../ui';
import { ROOM_KINDS, FLOORS, CONDITIONS, roomDefaults, areaM2, areaFt2, ftIn, sizeText, conditionTone, type Room, type RoomKind, type RoomCondition } from '../rooms';

/* Rooms of a home: a card per room with its photo and size. Click a room to see its photos, dimensions,
   a small floor plan and what is in it. Staff can add rooms, change them and add photos.
   The same file is used in every Genesis portal; `edit` decides who can change things. */

const r2 = (n: number) => Math.round(n * 100) / 100;

export function RoomsCard({ p, edit, occupant, title = 'Rooms', compact }: { p: Property; edit?: boolean; occupant?: (r: Room) => ReactNode; title?: string; compact?: boolean }) {
  const s = useStore();
  const rooms = s.rooms.filter(r => r.property === p.id);
  const [open, setOpen] = useState<string | null>(null); const [add, setAdd] = useState(false);
  const total = Math.round(rooms.filter(r => r.kind !== 'Garden').reduce((a, r) => a + r.length * r.width, 0) * 10) / 10;
  const photos = rooms.reduce((a, r) => a + r.photos.length, 0);
  const cur = rooms.find(r => r.id === open);
  return <Card title={title} sub={rooms.length ? `${rooms.length} rooms · ${total} m² inside (${Math.round(total * 10.7639)} sq ft) · ${photos} photos. Click a room to see its size and photos.` : 'No rooms added yet.'}
    action={edit && rooms.length > 0 && <Btn sm icon={<Plus size={14} />} onClick={() => setAdd(true)}>Add room</Btn>}>
    {rooms.length ? <div className={`roomtiles${compact ? ' sm' : ''}`}>
      {rooms.map(r => <button key={r.id} className="kcard roomtile" onClick={() => setOpen(r.id)}>
        <div className={`rt-photo${r.photos.length ? '' : ' none'}`} style={r.photos.length ? { backgroundImage: `url(${r.photos[0]})` } : undefined}>
          <Chip tone="neutral" dot={false}>{r.floor}</Chip>
          {r.photos.length ? <span className="rt-count"><Camera size={12} />{r.photos.length}</span> : <span className="rt-empty"><Camera size={20} />No photos yet</span>}
        </div>
        <div className="rt-body">
          <div className="flex between" style={{ gap: 8 }}><b className="ellip">{r.name}</b>{r.condition !== 'Good' && <Chip tone={conditionTone(r.condition)}>{r.condition}</Chip>}</div>
          <span className="rt-size"><Ruler size={13} />{r.kind === 'Garden' ? `${r.length} × ${r.width} m` : sizeText(r)} · {areaM2(r)} m²</span>
          {occupant ? occupant(r) : <span className="caption">{r.kind}{r.letRoom && r.letRoom !== r.name ? ` · ${r.letRoom}` : ''}</span>}
        </div>
      </button>)}
      {edit && <button className="kcard roomadd" onClick={() => setAdd(true)}><span className="tile t-brand" style={{ width: 40, height: 40 }}><Plus size={18} /></span><b>Add a room</b><span className="caption">Name, size and photos</span></button>}
    </div> : <Empty icon={<DoorOpen size={22} />}>{edit ? <span className="stack" style={{ alignItems: 'center', gap: 10 }}>No rooms yet. Add each room with its size and photos.<Btn sm icon={<Plus size={14} />} onClick={() => setAdd(true)}>Add the first room</Btn></span> : 'LSP has not added the rooms for this home yet.'}</Empty>}
    {cur && <RoomDrawer r={cur} p={p} edit={edit} occupant={occupant} onClose={() => setOpen(null)} />}
    {add && <RoomForm p={p} onClose={() => setAdd(false)} onSaved={id => { setAdd(false); setOpen(id); }} />}
  </Card>;
}

/* ---------- one room: photos, dimensions, floor plan and details ---------- */
function RoomDrawer({ r, p, edit, occupant, onClose }: { r: Room; p: Property; edit?: boolean; occupant?: (r: Room) => ReactNode; onClose: () => void }) {
  const s = useStore();
  const [i, setI] = useState(0); const [m, setM] = useState<'' | 'edit' | 'delete'>('');
  const ref = useRef<HTMLInputElement>(null);
  const n = r.photos.length; const at = Math.min(i, Math.max(0, n - 1));
  const upd = (patch: Partial<Room>, text: string) => { s.setRooms(rs => rs.map(x => x.id === r.id ? { ...x, ...patch, updated: nowStamp(), by: ME_NAME } : x)); s.log(`${text} · ${r.name}, ${p.address}`, 'Properties'); s.toast(text); };
  const addPhotos = (urls: string[]) => { upd({ photos: [...r.photos, ...urls] }, `${urls.length} photo${urls.length > 1 ? 's' : ''} added`); setI(n); };
  const occ = occupant?.(r);
  return <Drawer icon={<span className="tile t-brand"><DoorOpen size={18} /></span>} title={r.name} sub={`${r.kind} · ${r.floor} · ${p.address}`} onClose={onClose}
    footer={edit ? <><Btn kind="ghost" icon={<Trash2 size={16} />} onClick={() => setM('delete')}>Remove room</Btn><div className="grow" /><Btn kind="outline" icon={<Pencil size={16} />} onClick={() => setM('edit')}>Edit room</Btn><Btn icon={<ImagePlus size={16} />} onClick={() => ref.current?.click()}>Add photos</Btn></> : <Btn kind="outline" onClick={onClose}>Close</Btn>}>
    <div className="gallery">
      <div className={`gallery-main${n ? '' : ' none'}`} style={n ? { backgroundImage: `url(${r.photos[at]})` } : undefined}>
        {!n && <span className="rt-empty"><Camera size={26} />No photos yet{edit && <Btn sm kind="outline" icon={<ImagePlus size={14} />} onClick={() => ref.current?.click()}>Add photos</Btn>}</span>}
        {n > 1 && <><button className="gallery-nav l" aria-label="Previous photo" onClick={() => setI((at - 1 + n) % n)}><ChevronLeft size={18} /></button><button className="gallery-nav r" aria-label="Next photo" onClick={() => setI((at + 1) % n)}><ChevronRight size={18} /></button></>}
        {n > 0 && <span className="rt-count">{at + 1} / {n}</span>}
      </div>
      {(n > 1 || (edit && n > 0)) && <div className="gallery-thumbs">{r.photos.map((ph, k) => <span key={k} className={`gthumb${k === at ? ' on' : ''}`}>
        <button aria-label={`Photo ${k + 1}`} style={{ backgroundImage: `url(${ph})` }} onClick={() => setI(k)} />
        {edit && <button className="gthumb-x" aria-label="Remove photo" onClick={() => { upd({ photos: r.photos.filter((_, q) => q !== k) }, 'Photo removed'); setI(0); }}><X size={12} /></button>}</span>)}
        {edit && <button className="gthumb add" aria-label="Add photos" onClick={() => ref.current?.click()}><Plus size={18} /></button>}</div>}
    </div>
    <input ref={ref} type="file" accept="image/*" multiple hidden aria-label="Room photos" onChange={async e => { const urls = await readImages(e.target.files); e.target.value = ''; if (urls.length) addPhotos(urls); }} />

    <Card title="Dimensions" sub={r.kind === 'Garden' ? 'Measured at the widest points.' : 'Measured wall to wall at floor level.'}>
      <div className="grid g4 dims">
        <div className="mt stack"><span className="caption">Length</span><b>{r.length.toFixed(2)} m</b><span className="caption">{ftIn(r.length)}</span></div>
        <div className="mt stack"><span className="caption">Width</span><b>{r.width.toFixed(2)} m</b><span className="caption">{ftIn(r.width)}</span></div>
        <div className="mt stack"><span className="caption">Ceiling</span><b>{r.height ? `${r.height.toFixed(2)} m` : '—'}</b><span className="caption">{r.height ? ftIn(r.height) : 'outside'}</span></div>
        <div className="mt stack"><span className="caption">Floor area</span><b>{areaM2(r)} m²</b><span className="caption">{areaFt2(r)} sq ft</span></div>
      </div>
      <FloorPlan r={r} />
    </Card>
    <Card title="About this room">
      <KV rows={[['Type', r.kind], ['Floor', r.floor], ['Flooring', r.flooring || '—'], ['Heating', r.heating || '—'], ['Windows', r.windows || '—'], ['Sockets', String(r.sockets)], ['Furniture and fittings', r.furnished || '—'], ['Condition', <Chip tone={conditionTone(r.condition)}>{r.condition}</Chip>], ...(occ ? [['Who lives here', occ] as [string, ReactNode]] : [])]} />
      {r.notes && <Note tone={r.condition === 'Good' ? undefined : 'warn'}>{r.notes}</Note>}
      <span className="caption">Last updated {r.updated} · {r.by}</span>
    </Card>
    {m === 'edit' && <RoomForm p={p} room={r} onClose={() => setM('')} onSaved={() => setM('')} />}
    {m === 'delete' && <Modal title={`Remove ${r.name}?`} sub="The room and its photos come off this home. It is kept in History." onClose={() => setM('')}
      footer={<><Btn kind="outline" onClick={() => setM('')}>Cancel</Btn><Btn kind="danger" icon={<Trash2 size={16} />} onClick={() => { s.setRooms(rs => rs.filter(x => x.id !== r.id)); s.log(`Removed room "${r.name}" from ${p.address}`, 'Properties'); s.toast(`${r.name} removed`); onClose(); }}>Remove room</Btn></>}>
      <Note tone="warn">Only remove a room that no longer exists, for example after building work joined two rooms.</Note></Modal>}
  </Drawer>;
}

/** A simple floor plan drawn to scale, with the length and width marked. */
function FloorPlan({ r }: { r: Room }) {
  const W = 300, H = 170, pad = 34;
  const k = Math.min((W - pad * 2) / r.length, (H - pad * 2) / r.width);
  const w = r.length * k, h = r.width * k, x = (W - w) / 2, y = (H - h) / 2 + 4;
  const outside = r.kind === 'Garden';
  return <div className="plan2d" aria-label={`Floor plan, ${sizeText(r)}`}>
    <svg viewBox={`0 0 ${W} ${H}`} role="img">
      <rect x={x} y={y} width={w} height={h} rx={outside ? 10 : 2} className={outside ? 'pl-out' : 'pl-room'} />
      {!outside && <><path d={`M${x + 14} ${y + h} h22`} className="pl-gap" /><path d={`M${x + 14} ${y + h} a22 22 0 0 1 22 -22`} className="pl-door" /></>}
      {!outside && r.windows !== 'None' && <path d={`M${x + w * .35} ${y} h${w * .3}`} className="pl-win" />}
      <path d={`M${x} ${y - 14} h${w}`} className="pl-dim" /><path d={`M${x} ${y - 19} v10 M${x + w} ${y - 19} v10`} className="pl-dim" />
      <text x={x + w / 2} y={y - 19} textAnchor="middle" className="pl-t">{r.length.toFixed(2)} m</text>
      <path d={`M${x - 14} ${y} v${h}`} className="pl-dim" /><path d={`M${x - 19} ${y} h10 M${x - 19} ${y + h} h10`} className="pl-dim" />
      <text x={x - 19} y={y + h / 2} textAnchor="middle" transform={`rotate(-90 ${x - 19} ${y + h / 2})`} className="pl-t" dy="-4">{r.width.toFixed(2)} m</text>
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" className="pl-a">{areaM2(r)} m²</text>
    </svg>
    <span className="caption"><Ruler size={12} style={{ verticalAlign: -2 }} /> Drawn to scale. {outside ? '' : 'Door and window positions are a guide.'}</span>
  </div>;
}

/* ---------- add or change a room ---------- */
async function readImages(fl: FileList | null): Promise<string[]> {
  const fs = Array.from(fl ?? []).filter(f => f.type.startsWith('image/'));
  return Promise.all(fs.map(f => new Promise<string>(res => { const rd = new FileReader(); rd.onload = () => res(String(rd.result)); rd.readAsDataURL(f); })));
}
function RoomForm({ p, room, onClose, onSaved }: { p: Property; room?: Room; onClose: () => void; onSaved: (id: string) => void }) {
  const s = useStore(); const ref = useRef<HTMLInputElement>(null);
  const d0 = roomDefaults(room?.kind ?? 'Bedroom');
  const [f, setF] = useState({ name: room?.name ?? '', kind: (room?.kind ?? 'Bedroom') as RoomKind, floor: room?.floor ?? (p.type === 'Flat' ? '1st floor' : 'Ground floor'), length: room ? String(room.length) : '', width: room ? String(room.width) : '', height: room ? String(room.height || '') : '2.4', flooring: room?.flooring ?? d0.flooring, heating: room?.heating ?? d0.heating, windows: room?.windows ?? d0.windows, sockets: String(room?.sockets ?? d0.sockets), furnished: room?.furnished ?? d0.furnished, condition: (room?.condition ?? 'Good') as RoomCondition, notes: room?.notes ?? '', letRoom: room?.letRoom ?? '' });
  const [photos, setPhotos] = useState<string[]>(room?.photos ?? []);
  const set = (k: keyof typeof f, v: string) => setF(x => ({ ...x, [k]: v }));
  const pickKind = (v: string) => { const k = v as RoomKind; const d = roomDefaults(k); setF(x => room ? { ...x, kind: k } : { ...x, kind: k, flooring: d.flooring, heating: d.heating, windows: d.windows, sockets: String(d.sockets), furnished: d.furnished, height: k === 'Garden' ? '' : x.height || '2.4', floor: k === 'Garden' ? 'Outside' : x.floor === 'Outside' ? 'Ground floor' : x.floor }); };
  const L = +f.length, Wd = +f.width; const okSize = L > 0 && Wd > 0 && L < 60 && Wd < 60;
  const dup = s.rooms.some(r => r.property === p.id && r.id !== room?.id && r.name.trim().toLowerCase() === f.name.trim().toLowerCase());
  const ok = f.name.trim() && okSize && !dup;
  const save = () => {
    const data: Omit<Room, 'id'> = { property: p.id, name: f.name.trim(), kind: f.kind, floor: f.floor, length: r2(L), width: r2(Wd), height: f.kind === 'Garden' ? 0 : r2(+f.height || 0), flooring: f.flooring, heating: f.heating, windows: f.windows, sockets: Math.max(0, Math.round(+f.sockets || 0)), furnished: f.furnished, condition: f.condition, notes: f.notes.trim() || undefined, letRoom: p.type === 'HMO' && f.kind === 'Bedroom' ? (f.letRoom || undefined) : undefined, photos, updated: nowStamp(), by: ME_NAME };
    if (room) { s.setRooms(rs => rs.map(x => x.id === room.id ? { ...x, ...data } : x)); s.log(`Updated room "${data.name}" at ${p.address} (${sizeText(data)})`, 'Properties'); s.toast(`${data.name} saved`); onSaved(room.id); return; }
    const id = `${p.id}-R${Date.now() % 100000}`;
    s.setRooms(rs => [...rs, { id, ...data }]);
    s.log(`Added room "${data.name}" to ${p.address}: ${sizeText(data)}, ${areaM2(data)} m², ${photos.length} photos`, 'Properties'); s.toast(`${data.name} added`); onSaved(id);
  };
  return <Modal wide title={room ? `Edit ${room.name}` : 'Add a room'} sub={`${p.address}. Sizes in metres. The area works itself out.`} onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn icon={room ? <Pencil size={16} /> : <Plus size={16} />} disabled={!ok} onClick={save}>{room ? 'Save changes' : 'Add room'}</Btn></>}>
    <div className="grid g3">
      <Field label="Room name"><Text value={f.name} onChange={v => set('name', v)} placeholder="e.g. Bedroom 2" /></Field>
      <Field label="Type of room"><Select value={f.kind} onChange={pickKind} options={ROOM_KINDS.map(k => ({ value: k, label: k }))} /></Field>
      <Field label="Floor"><Select value={f.floor} onChange={v => set('floor', v)} options={FLOORS.map(k => ({ value: k, label: k }))} /></Field>
    </div>
    {dup && <Note tone="err">This home already has a room called {f.name.trim()}.</Note>}
    <div className="grid g4">
      <Field label="Length (m)"><Text value={f.length} onChange={v => set('length', v)} placeholder="e.g. 4.2" /></Field>
      <Field label="Width (m)"><Text value={f.width} onChange={v => set('width', v)} placeholder="e.g. 3.6" /></Field>
      <Field label="Ceiling height (m)"><Text value={f.kind === 'Garden' ? '' : f.height} onChange={v => set('height', v)} placeholder={f.kind === 'Garden' ? 'Outside' : 'e.g. 2.4'} /></Field>
      <Field label="Floor area"><div className="ro">{okSize ? `${areaM2({ length: L, width: Wd })} m² · ${areaFt2({ length: L, width: Wd })} sq ft` : '—'}</div></Field>
    </div>
    <div className="grid g3">
      <Field label="Flooring"><Text value={f.flooring} onChange={v => set('flooring', v)} /></Field>
      <Field label="Heating"><Text value={f.heating} onChange={v => set('heating', v)} /></Field>
      <Field label="Windows"><Text value={f.windows} onChange={v => set('windows', v)} /></Field>
    </div>
    <div className="grid g3">
      <Field label="Sockets"><Text value={f.sockets} onChange={v => set('sockets', v)} /></Field>
      <Field label="Condition"><Select value={f.condition} onChange={v => set('condition', v)} options={CONDITIONS.map(k => ({ value: k, label: k }))} /></Field>
      {p.type === 'HMO' && f.kind === 'Bedroom' ? <Field label="Lettable room"><Select value={f.letRoom} onChange={v => set('letRoom', v)} options={[{ value: '', label: 'Not let on its own' }, ...Array.from({ length: p.rooms ?? 0 }, (_, k) => ({ value: `Room ${k + 1}`, label: `Room ${k + 1}` }))]} /></Field> : <div />}
    </div>
    <Field label="Furniture and fittings"><Text value={f.furnished} onChange={v => set('furnished', v)} placeholder="e.g. Double bed, wardrobe" /></Field>
    <Field label="Notes (optional)"><Area value={f.notes} onChange={v => set('notes', v)} placeholder="e.g. Small crack above the door, checked at the last inspection" /></Field>
    <div className="field"><span>Photos</span>
      <div className="photogrid">
        {photos.map((ph, k) => <span key={k} className="pg-ph" style={{ backgroundImage: `url(${ph})` }}>{k === 0 && <em>Cover</em>}<button className="gthumb-x" aria-label="Remove photo" onClick={() => setPhotos(x => x.filter((_, q) => q !== k))}><X size={12} /></button></span>)}
        <button type="button" className="dropzone pg-add" onClick={() => ref.current?.click()}><Upload size={18} /><b>Add photos</b><span className="caption">JPG or PNG</span></button>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple hidden aria-label="Room photos" onChange={async e => { const urls = await readImages(e.target.files); e.target.value = ''; setPhotos(x => [...x, ...urls]); }} />
      <span className="caption">The first photo is the cover on the room card.</span>
    </div>
  </Modal>;
}
