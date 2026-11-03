import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { X, Search, Check, Info, AlertTriangle, PhoneCall, Mail, StickyNote, Globe, Bot, MessageSquare, FileText, Upload, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { nowStamp, parseDate, fmtDate, MONTHS, type Comm, type DocStatus, type Tone } from './data';
import { ME_NAME } from './data';
import { staff, useStore } from './store';

export const I = { s: 18, w: 1.8 };

export function Chip({ tone = 'neutral', children, dot = true }: { tone?: Tone | 'accent'; children: ReactNode; dot?: boolean }) {
  return <span className={`chip ${tone}${dot ? '' : ' nodot'}`}>{children}</span>;
}
export function Count({ n }: { n: number | string }) { return <span className="count">{n}</span>; }

type BtnKind = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'success';
export function Btn({ kind = 'primary', sm, icon, children, onClick, disabled, type = 'button', title, block }: { kind?: BtnKind; sm?: boolean; icon?: ReactNode; children?: ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit'; title?: string; block?: boolean }) {
  return <button type={type} title={title} className={`btn ${kind === 'outline' ? 'line' : kind}${sm ? ' sm' : ''}${block ? ' fullw' : ''}`} onClick={onClick} disabled={disabled}>{icon}{children}</button>;
}
export function IBtn({ icon, onClick, sm, kind, dot, label }: { icon: ReactNode; onClick?: () => void; sm?: boolean; kind?: 'success' | 'danger'; dot?: boolean; label: string }) {
  return <button className={`ibtn${sm ? ' sm' : ''}${kind ? ' ' + kind : ''}`} onClick={onClick} aria-label={label} title={label}>{icon}{dot && <span className="dot" />}</button>;
}

export function Card({ title, sub, action, children, className = '', style }: { title?: ReactNode; sub?: ReactNode; action?: ReactNode; children?: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <section className={`card ${className}`} style={style}>
      {(title || action) && <div className="card-h"><div className="grow">{title && <h2 className="h2">{title}</h2>}{sub && <div className="small">{sub}</div>}</div>{action}</div>}
      {children}
    </section>
  );
}

export function Avatar({ id, name, size = '', photo }: { id?: string; name?: string; size?: '' | 'md' | 'lg' | 'xl'; photo?: string }) {
  const s = staff(id);
  const n = name ?? s?.name ?? '?';
  const p = photo ?? s?.photo;
  const ini = n.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const colors = ['#153D91', '#0B6FB8', '#1D7A4C', '#0E2E78', '#3B6FD4', '#001649'];
  const c = s?.color ?? colors[n.length % colors.length];
  return p ? <img className={`avatar ${size}`} src={p} alt="" /> : <span className={`avatar ${size}`} style={{ background: c }}>{ini}</span>;
}

export function Bar({ value, tone = 'ok' }: { value: number; tone?: 'ok' | 'err' | 'warn' | 'brand' | 'info' }) {
  return <div className={`bar ${tone}`}><i style={{ width: Math.max(0, Math.min(100, value)) + '%' }} /></div>;
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: any) => void; items: { id: T; label: ReactNode; count?: number }[] }) {
  return <div className="tabs" role="tablist">{items.map(i => <button key={i.id} role="tab" aria-selected={value === i.id} className={value === i.id ? 'on' : ''} onClick={() => onChange(i.id)}>{i.label}{i.count != null && <span className="count">{i.count}</span>}</button>)}</div>;
}
/** Underlined tabs used inside detail pages. */
export function PageTabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: any) => void; items: { id: T; label: string; count?: number }[] }) {
  return <div className="ptabs" role="tablist">{items.map(i => <button key={i.id} role="tab" aria-selected={value === i.id} className={value === i.id ? 'on' : ''} onClick={() => onChange(i.id)}>{i.label}{i.count != null && <span className="count">{i.count}</span>}</button>)}</div>;
}

export function MiniSearch({ value, onChange, placeholder = 'Search' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <label className="minisearch"><Search size={16} strokeWidth={1.8} /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} /></label>;
}

export function Drawer({ title, sub, onClose, children, footer, icon }: { title: ReactNode; sub?: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; icon?: ReactNode }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="scrim" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-label={typeof title === 'string' ? title : 'Details'}>
        <div className="drawer-h">{icon}<div className="grow"><h2 className="h2" style={{ fontSize: 18 }}>{title}</h2>{sub && <div className="small" style={{ marginTop: 4 }}>{sub}</div>}</div><IBtn sm icon={<X size={16} />} onClick={onClose} label="Close" /></div>
        <div className="drawer-b">{children}</div>
        {footer && <div className="drawer-f">{footer}</div>}
      </aside>
    </div>
  );
}

export function Modal({ title, sub, onClose, children, footer, wide }: { title: string; sub?: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="modal-scrim" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal${wide ? ' wide' : ''}`} role="dialog" aria-label={title}>
        <div className="flex" style={{ alignItems: 'flex-start' }}><div className="grow"><h2 className="h2" style={{ fontSize: 18 }}>{title}</h2>{sub && <div className="small" style={{ marginTop: 4 }}>{sub}</div>}</div><IBtn sm icon={<X size={16} />} onClick={onClose} label="Close" /></div>
        {children}
        {footer && <div className="flex" style={{ justifyContent: 'flex-end', marginTop: 4, flexWrap: 'wrap' }}>{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) { return <label className="field"><span>{label}</span>{children}{hint && <em className="caption" style={{ fontStyle: 'normal' }}>{hint}</em>}</label>; }
export function Text({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input className="input" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}
export function Area({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <textarea className="input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}
export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string; disabled?: boolean }[] }) {
  return <select className="input" value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}</select>;
}

export function KV({ rows }: { rows: [string, ReactNode][] }) {
  return <dl className="kv">{rows.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>;
}
export function Note({ tone, children }: { tone?: 'warn' | 'err' | 'ok'; children: ReactNode }) {
  const ic = tone === 'err' || tone === 'warn' ? <AlertTriangle size={16} /> : tone === 'ok' ? <Check size={16} /> : <Info size={16} />;
  return <div className={`note${tone ? ' ' + tone : ''}`}>{ic}<span>{children}</span></div>;
}
export function Steps({ items, at }: { items: readonly string[]; at: number }) {
  return <div className="steps">{items.map((s, i) => <div key={s} className={`step${i < at ? ' done' : i === at ? ' now' : ''}`}><span className="dotn">{i < at ? <Check size={14} /> : i + 1}</span><div style={{ paddingTop: 5, fontWeight: i === at ? 700 : 600, color: i > at ? 'var(--text-tertiary)' : undefined }}>{s}</div></div>)}</div>;
}
/** Horizontal step-by-step progress for a flow. */
export function HSteps({ items, at, stopped }: { items: readonly string[]; at: number; stopped?: string }) {
  return <div className="hsteps">{items.map((s, i) => <div key={s} className={`hs${i < at ? ' done' : i === at ? (stopped ? ' stop' : ' now') : ''}`}>
    <span className="hs-dot">{i < at ? <Check size={14} /> : i === at && stopped ? <X size={14} /> : i + 1}</span>
    <span className="hs-l">{s}</span>{i === at && stopped && <span className="hs-s">{stopped}</span>}
  </div>)}</div>;
}
export function Empty({ children, icon }: { children: ReactNode; icon?: ReactNode }) { return <div className="empty">{icon && <div className="empty-ic">{icon}</div>}{children}</div>; }

export function Toasts() {
  const { toasts } = useStore();
  return <div className="toasts" aria-live="polite">{toasts.map(t => <div key={t.id} className="toast"><Check size={16} />{t.msg}</div>)}</div>;
}

export function Reason({ title, sub, cta = 'Confirm', danger, onClose, onDone, placeholder = 'Type the reason. It is saved in History.', options, label = 'Reason' }: { title: string; sub?: string; cta?: string; danger?: boolean; onClose: () => void; onDone: (reason: string) => void; placeholder?: string; options?: string[]; label?: string }) {
  const [pick, setPick] = useState(options?.[0] ?? '');
  const [r, setR] = useState('');
  const text = options ? (pick + (r.trim() ? ' · ' + r.trim() : '')) : r.trim();
  return <Modal title={title} sub={sub} onClose={onClose} footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn kind={danger ? 'danger' : 'primary'} disabled={!text} onClick={() => onDone(text)}>{cta}</Btn></>}>
    {options && <Field label={label}><Select value={pick} onChange={setPick} options={options.map(o => ({ value: o, label: o }))} /></Field>}
    <Field label={options ? 'Note (optional)' : label}><textarea className="input" value={r} onChange={e => setR(e.target.value)} placeholder={placeholder} /></Field>
  </Modal>;
}

export function Confirm({ title, sub, cta = 'Confirm', danger, onClose, onConfirm, children }: { title: string; sub?: string; cta?: string; danger?: boolean; onClose: () => void; onConfirm: () => void; children?: ReactNode }) {
  return <Modal title={title} sub={sub} onClose={onClose} footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn kind={danger ? 'danger' : 'primary'} onClick={onConfirm}>{cta}</Btn></>}>{children}</Modal>;
}

export function Kpi({ icon, tone, label, value, caption, onClick, spark, active }: { icon: ReactNode; tone: 'info' | 'brand' | 'ok' | 'err' | 'warn' | 'neutral'; label: string; value: ReactNode; caption: ReactNode; onClick?: () => void; spark?: string; active?: boolean }) {
  const Tag = onClick ? 'button' : 'div';
  return <Tag className={`kpi${active ? ' on' : ''}`} onClick={onClick}>
    <div className="flex" style={{ gap: 10 }}><span className={`tile t-${tone}`}>{icon}</span><span className="label grow">{label}</span>{onClick && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="1.8" strokeLinecap="round"><path d="M7 17 17 7M8 7h9v9" /></svg>}</div>
    <div className="flex" style={{ alignItems: 'flex-end' }}><div className="stack grow"><span className="v">{value}</span><span className="caption">{caption}</span></div>
      {spark && <svg width="80" height="22" viewBox="0 0 80 22" fill="none"><path d={spark} style={{ stroke: `var(--${tone === 'brand' ? 'text-brand' : tone})` }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}</div>
  </Tag>;
}

/* ---------- detail page building blocks ---------- */
export function DetailHead({ media, title, chips, meta, aside }: { media?: ReactNode; title: ReactNode; chips?: ReactNode; meta?: [string, ReactNode][]; aside?: ReactNode }) {
  return <section className="card dhead">
    {media}
    <div className="stack grow" style={{ gap: 10 }}>
      <div className="flex wrap" style={{ gap: 10 }}><h2 className="dtitle">{title}</h2>{chips}</div>
      {meta && <div className="dmeta">{meta.map(([k, v]) => <div key={k}><span className="caption">{k}</span><b>{v}</b></div>)}</div>}
    </div>
    {aside}
  </section>;
}
export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: Tone }) {
  return <div className={`stat${tone ? ' s-' + tone : ''}`}><span className="caption">{label}</span><b>{value}</b>{sub && <span className="caption">{sub}</span>}</div>;
}
/** The highlighted "what to do next" card on every detail page. */
export function ActionCard({ title = 'Next step', text, children, tone = 'brand' }: { title?: string; text?: ReactNode; children?: ReactNode; tone?: 'brand' | 'ok' | 'warn' | 'neutral' }) {
  return <section className={`card actioncard a-${tone}`}><span className="caption-strong" style={{ textTransform: 'uppercase', letterSpacing: '.06em' }}>{title}</span>{text && <div className="body-strong" style={{ lineHeight: 1.5 }}>{text}</div>}{children && <div className="col" style={{ gap: 8 }}>{children}</div>}</section>;
}
export const docTone = (st: DocStatus): Tone => ({ Verified: 'ok', Uploaded: 'info', Missing: 'warn', Rejected: 'err', Expired: 'err' } as const)[st];
export function DocRow({ name, status, meta, children }: { name: string; status?: DocStatus; meta?: ReactNode; children?: ReactNode }) {
  return <div className="doc"><span className={`tile t-${status ? docTone(status) : 'brand'}`} style={{ width: 34, height: 34 }}><FileText size={16} /></span><div className="stack grow"><b>{name}</b>{meta && <span className="caption">{meta}</span>}</div>{status && <Chip tone={docTone(status)}>{status}</Chip>}{children}</div>;
}

/** Date over time, for table cells. */
export function When({ at }: { at: string }) { const [d, t] = at.split(', '); return <span className="stack"><b className="small" style={{ color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{d}</b>{t && <span className="caption">{t}</span>}</span>; }

export function Timeline({ items }: { items: { at: string; text: ReactNode; by?: string; tone?: Tone }[] }) {
  return <div className="tl">{items.map((it, i) => <div key={i} className={`tl-i${it.tone ? ' tl-' + it.tone : ''}`}><span className="tl-dot" /><div className="stack grow"><b>{it.text}</b><span className="caption">{it.at}{it.by ? ' · ' + it.by : ''}</span></div></div>)}</div>;
}

/* ---------- communication log ---------- */
const chIcon = { Email: Mail, Call: PhoneCall, Note: StickyNote, Portal: Globe, System: Bot, SMS: MessageSquare };
export const sortComms = (a: Comm[]) => [...a].sort((x, y) => parseDate(y.at).getTime() - parseDate(x.at).getTime());
export function CommsLog({ items, onAdd, to, emptyText = 'No calls, emails or notes yet.' }: { items: Comm[]; onAdd?: (c: Comm) => void; to?: string; emptyText?: string }) {
  const [mode, setMode] = useState<'' | 'Call' | 'Email' | 'Note'>('');
  return <>
    {onAdd && <div className="flex wrap"><Btn sm kind="outline" icon={<PhoneCall size={14} />} onClick={() => setMode('Call')}>Log a call</Btn><Btn sm kind="outline" icon={<Mail size={14} />} onClick={() => setMode('Email')}>Send email</Btn><Btn sm kind="ghost" icon={<StickyNote size={14} />} onClick={() => setMode('Note')}>Add note</Btn></div>}
    {items.length ? <div className="comms">{sortComms(items).map(c => { const Ic = chIcon[c.channel]; return <div key={c.id} className="comm">
      <span className={`tile ${c.dir === 'in' ? 't-ok' : c.channel === 'System' ? 't-neutral' : 't-info'}`} style={{ width: 34, height: 34 }}><Ic size={16} /></span>
      <div className="stack grow" style={{ gap: 3 }}>
        <div className="flex between" style={{ alignItems: 'flex-start' }}><b>{c.subject ?? (c.channel === 'Call' ? 'Phone call' : c.channel === 'Note' ? 'Note' : c.channel === 'Portal' ? 'From the portal' : c.channel === 'System' ? 'Update' : c.channel)}</b><span className="caption" style={{ whiteSpace: 'nowrap' }}>{c.at}</span></div>
        <span className="small" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.text}</span>
        <span className="caption flex" style={{ gap: 4 }}>{c.dir === 'in' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}{c.channel} · {c.by}</span>
      </div></div>; })}</div> : <Empty>{emptyText}</Empty>}
    {mode && <CommModal mode={mode} to={to} onClose={() => setMode('')} onSave={x => { onAdd?.(x); setMode(''); }} />}
  </>;
}
export function CommModal({ mode, to, onClose, onSave, presetSubject = '', presetText = '' }: { mode: 'Call' | 'Email' | 'Note'; to?: string; onClose: () => void; onSave: (c: Comm) => void; presetSubject?: string; presetText?: string }) {
  const [subject, setSubject] = useState(presetSubject); const [text, setText] = useState(presetText); const [outcome, setOutcome] = useState('Spoke to them');
  const title = mode === 'Email' ? 'Send an email' : mode === 'Call' ? 'Log a phone call' : 'Add a note';
  const save = () => onSave({ id: 'cm' + Date.now(), at: nowStamp(), by: ME_NAME, channel: mode, dir: 'out', subject: mode === 'Email' ? subject : mode === 'Call' ? `Phone call · ${outcome}` : undefined, text });
  return <Modal title={title} sub={mode === 'Email' ? 'Sent from LSP’s Outlook. A copy is saved here.' : 'Saved with the date and time, so the whole team can see it.'} onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn icon={mode === 'Email' ? <Mail size={16} /> : <Check size={16} />} disabled={!text.trim() || (mode === 'Email' && !subject.trim())} onClick={save}>{mode === 'Email' ? 'Send email' : 'Save'}</Btn></>}>
    {mode === 'Email' && <><Field label="To"><input className="input" value={to ?? ''} readOnly /></Field><Field label="Subject"><Text value={subject} onChange={setSubject} placeholder="e.g. Next steps" /></Field></>}
    {mode === 'Call' && <Field label="Outcome"><Select value={outcome} onChange={setOutcome} options={['Spoke to them', 'No answer, left voicemail', 'Asked to call back', 'Wrong number'].map(x => ({ value: x, label: x }))} /></Field>}
    <Field label={mode === 'Email' ? 'Message' : mode === 'Call' ? 'What was discussed' : 'Note'}><textarea className="input" style={{ height: 120 }} value={text} onChange={e => setText(e.target.value)} placeholder={mode === 'Call' ? 'e.g. Confirmed the viewing on Friday at 5pm' : 'Type here'} /></Field>
  </Modal>;
}

/* ---------- uploads ---------- */
export const dateLabel = (v: string) => { if (!v) return ''; const d = new Date(v); return isNaN(d.getTime()) ? v : fmtDate(d); };
export const dateTimeLabel = (v: string) => { const d = new Date(v); if (isNaN(d.getTime())) return v; return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
export function UploadModal({ title, sub, withIssued, withExpiry, extra, cta = 'Upload', onClose, onSave, accept = '.pdf,.jpg,.jpeg,.png' }: { title: string; sub?: string; withIssued?: boolean; withExpiry?: boolean; extra?: ReactNode; cta?: string; onClose: () => void; onSave: (v: { file: string; issued: string; expires: string }) => void; accept?: string }) {
  const [file, setFile] = useState(''); const [issued, setIssued] = useState('2026-10-15T10:00'); const [expires, setExpires] = useState('2027-10-15');
  const ref = useRef<HTMLInputElement>(null);
  return <Modal title={title} sub={sub} onClose={onClose} footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn icon={<Upload size={16} />} disabled={!file} onClick={() => onSave({ file, issued: dateTimeLabel(issued), expires: dateLabel(expires) })}>{cta}</Btn></>}>
    <button type="button" className="dropzone" onClick={() => ref.current?.click()}>
      <Upload size={22} />{file ? <><b>{file}</b><span className="caption">Click to choose a different file</span></> : <><b>Choose a file to upload</b><span className="caption">PDF, JPG or PNG · up to 10 MB</span></>}
    </button>
    <input ref={ref} type="file" accept={accept} hidden onChange={e => setFile(e.target.files?.[0]?.name ?? '')} aria-label="File" />
    {(withIssued || withExpiry) && <div className="grid g2">
      {withIssued && <Field label="Date and time done"><input className="input" type="datetime-local" value={issued} onChange={e => setIssued(e.target.value)} /></Field>}
      {withExpiry && <Field label="Expiry date"><input className="input" type="date" value={expires} onChange={e => setExpires(e.target.value)} /></Field>}
    </div>}
    {extra}
  </Modal>;
}

/** Photo picker that returns a data URL so the picture shows straight away. */
export function PhotoPicker({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return <div className="photopick">
    <button type="button" className="dropzone" style={value ? { backgroundImage: `url(${value})`, color: '#fff' } : undefined} onClick={() => ref.current?.click()}>
      {!value && <><Upload size={22} /><b>Upload property photo</b><span className="caption">JPG or PNG. Shown on the property card.</span></>}
      {value && <span className="photopick-tag">Change photo</span>}
    </button>
    <input ref={ref} type="file" accept="image/*" hidden aria-label="Property photo" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => onChange(String(r.result)); r.readAsDataURL(f); }} />
  </div>;
}

/* ---------- list filters: search, type, and a date range or year ---------- */
export interface Flt { q: string; type: string; from: string; to: string; year: string }
export const NO_FILTER: Flt = { q: '', type: 'all', from: '', to: '', year: 'all' };
export function useFlt() { return useState<Flt>(NO_FILTER); }
const dOf = (v?: string) => { if (!v) return null; const d = parseDate(v.split(', ')[0]); return isNaN(d.getTime()) ? null : d; };
/** Keep the rows that match the search text, the type and the dates. */
export function applyFlt<T>(list: T[], f: Flt, get: { text: (x: T) => string; type?: (x: T) => string; date?: (x: T) => string | undefined }): T[] {
  const q = f.q.trim().toLowerCase();
  const from = f.from ? new Date(f.from + 'T00:00').getTime() : null, to = f.to ? new Date(f.to + 'T23:59').getTime() : null;
  return list.filter(x => {
    if (q && !get.text(x).toLowerCase().includes(q)) return false;
    if (f.type !== 'all' && get.type && get.type(x) !== f.type) return false;
    if (get.date && (from !== null || to !== null || f.year !== 'all')) {
      const d = dOf(get.date(x)); if (!d) return false;
      if (from !== null && d.getTime() < from) return false;
      if (to !== null && d.getTime() > to) return false;
      if (f.year !== 'all' && String(d.getFullYear()) !== f.year) return false;
    }
    return true;
  });
}
export const yearsOf = <T,>(list: T[], date: (x: T) => string | undefined) => [...new Set(list.map(x => dOf(date(x))?.getFullYear()).filter(Boolean) as number[])].sort((a, b) => b - a).map(String);
/** One row of filters above a list: search, type and a year picker (the client wants a year, not a date range). */
export function FilterBar({ f, set, placeholder = 'Search', types, typeLabel = 'All types', mode = 'year', years, shown, total, search = true }: { f: Flt; set: (f: Flt) => void; placeholder?: string; types?: string[]; typeLabel?: string; mode?: 'range' | 'year' | 'none'; years?: string[]; shown?: number; total?: number; search?: boolean }) {
  const active = f.q || f.type !== 'all' || f.from || f.to || f.year !== 'all';
  return <div className="fbar">
    {search && <MiniSearch value={f.q} onChange={q => set({ ...f, q })} placeholder={placeholder} />}
    {types && types.length > 1 && <select className="fsel" aria-label={typeLabel} value={f.type} onChange={e => set({ ...f, type: e.target.value })}><option value="all">{typeLabel}</option>{types.map(t => <option key={t} value={t}>{t}</option>)}</select>}
    {mode === 'year' && <select className="fsel" aria-label="Year" value={f.year} onChange={e => set({ ...f, year: e.target.value })}><option value="all">All years</option>{(years ?? []).map(y => <option key={y} value={y}>{y}</option>)}</select>}
    {active && <button className="link fclear" onClick={() => set(NO_FILTER)}>Clear</button>}
    {shown !== undefined && total !== undefined && active && <span className="caption fcount">{shown} of {total}</span>}
  </div>;
}
