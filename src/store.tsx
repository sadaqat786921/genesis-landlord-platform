import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import * as D from './data';
import { VAT_START, type VatSetting } from './pricing';
import { seedRooms, type Room } from './rooms';
import type { Damage } from './damage';
import { useLocation, useNavigate } from 'react-router-dom';

/* Landlord portal: one landlord (Margaret Okafor) signed in. Only her homes and everything linked to them are loaded. */

export type Route =
  | 'home' | 'approvals' | 'messages' | 'properties' | 'tenants' | 'repairs' | 'safety'
  | 'rent' | 'invoices' | 'plan' | 'documents' | 'activity' | 'account';
export const ROUTES: Route[] = ['home', 'approvals', 'messages', 'properties', 'tenants', 'repairs', 'safety', 'rent', 'invoices', 'plan', 'documents', 'activity', 'account'];
type Setter<T> = (fn: (prev: T[]) => T[]) => void;

/* ---------- only this landlord's records ---------- */
const ME_LL = D.LANDLORDS.find(l => l.id === D.ME)!;
const PROPS = D.PROPERTIES.filter(p => p.managed && p.owner === D.ME);
const PIDS = new Set(PROPS.map(p => p.id));
const LEASED = new Set(PROPS.filter(p => p.arrangement === 'Leased').map(p => p.id));
/** Occupiers of a home leased to LSP are LSP's tenants, so their details are not shown to the owner. */
const TENANTS = D.TENANTS.filter(t => PIDS.has(t.property) && !LEASED.has(t.property));
/** Leased homes: the owner only sees work that is theirs under the lease (roof and structure). */
const JOBS = D.JOBS.filter(j => PIDS.has(j.property) && (!LEASED.has(j.property) || j.ownerRepair));
export const SCOPE = {
  properties: PROPS, tenants: TENANTS, jobs: JOBS,
  inspections: D.INSPECTIONS.filter(i => PIDS.has(i.property) && !LEASED.has(i.property)),
  safety: D.SAFETY.filter(c => PIDS.has(c.property)),
  rent: D.RENT.filter(r => TENANTS.some(t => t.id === r.tenant)),
  invoices: D.INVOICES.filter(i => i.toKind === 'Landlord' && i.to === D.ME),
  leasePays: D.LEASE_PAYS.filter(x => PIDS.has(x.property)),
  damages: D.DAMAGES.filter(d => PIDS.has(d.property) && !LEASED.has(d.property)),
};

interface Store {
  route: Route; detail: string | null; go: (r: Route, detail?: string | null) => void;
  toast: (msg: string) => void; toasts: { id: number; msg: string }[];
  log: (what: string, area: string, who?: string) => void; activity: D.Activity[];
  me: D.Landlord; setMe: (fn: (l: D.Landlord) => D.Landlord) => void;
  properties: D.Property[]; tenants: D.Tenant[]; contractors: D.Contractor[]; staff: D.Staff[];
  jobs: D.Job[]; setJobs: Setter<D.Job>;
  inspections: D.Inspection[]; safety: D.SafetyCert[]; rent: D.RentRow[];
  invoices: D.Invoice[]; setInvoices: Setter<D.Invoice>;
  /** Rooms of her homes (view only for the landlord) and tenant damage on her managed homes (view only). */
  rooms: Room[]; setRooms: Setter<Room>; damages: Damage[];
  leasePays: D.LeasePay[];
  requests: D.LLReq[]; setRequests: Setter<D.LLReq>;
  /** Message ids from LSP that the landlord has opened. */
  read: string[]; markRead: (ids: string[]) => void;
  vat: VatSetting;
}
const Ctx = createContext<Store>(null as unknown as Store);
export const useStore = () => useContext(Ctx);

function useList<T>(init: T[]): [T[], Setter<T>] {
  const [v, setV] = useState<T[]>(init);
  return [v, useCallback((fn: (prev: T[]) => T[]) => setV(prev => fn(prev)), [])];
}

/** Messages from LSP before this date count as read. */
const SEEN_BEFORE = D.parseDate('13 Oct 2026, 00:00').getTime();

export function StoreProvider({ children }: { children: ReactNode }) {
  const loc = useLocation(); const nav = useNavigate();
  const parts = loc.pathname.split('/').filter(Boolean);
  const route = (ROUTES.includes(parts[0] as Route) ? parts[0] : 'home') as Route;
  const detail = parts[1] ? decodeURIComponent(parts[1]) : null;
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const [activity, setActivity] = useState<D.Activity[]>(D.LL_ACTIVITY);
  const [me, setMeState] = useState<D.Landlord>(ME_LL);
  const [jobs, setJobs] = useList(SCOPE.jobs);
  const [invoices, setInvoices] = useList(SCOPE.invoices);
  const [requests, setRequests] = useList(D.LL_REQUESTS);
  const [rooms, setRooms] = useList(seedRooms(SCOPE.properties));
  const [read, setRead] = useState<string[]>(ME_LL.comms.filter(c => c.by !== D.ME_NAME && D.parseDate(c.at).getTime() < SEEN_BEFORE).map(c => c.id));

  const go = useCallback((r: Route, d: string | null = null) => { nav('/' + r + (d ? '/' + encodeURIComponent(d) : '')); window.scrollTo({ top: 0 }); }, [nav]);
  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  }, []);
  const log = useCallback((what: string, area: string, who: string = D.ME_NAME) => {
    setActivity(a => [{ id: 'H' + Date.now() + Math.random(), at: D.nowStamp(), who, what, area }, ...a]);
  }, []);
  const setMe = useCallback((fn: (l: D.Landlord) => D.Landlord) => setMeState(l => fn(l)), []);
  const markRead = useCallback((ids: string[]) => setRead(r => [...new Set([...r, ...ids])]), []);

  const value = useMemo(() => ({
    route, detail, go, toast, toasts, log, activity, me, setMe,
    properties: SCOPE.properties, tenants: SCOPE.tenants, contractors: D.CONTRACTORS, staff: D.STAFF,
    jobs, setJobs, inspections: SCOPE.inspections, safety: SCOPE.safety, rent: SCOPE.rent,
    invoices, setInvoices, rooms, setRooms, damages: SCOPE.damages, leasePays: SCOPE.leasePays, requests, setRequests, read, markRead, vat: VAT_START,
  }), [rooms, setRooms, route, detail, go, toast, toasts, log, activity, me, setMe, jobs, setJobs, invoices, setInvoices, requests, setRequests, read, markRead]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// ---------- lookups ----------
export const staff = (id?: string) => D.STAFF.find(s => s.id === id);
export const money = (n: number): string => n < 0 ? '−' + money(-n) : '£' + n.toLocaleString('en-GB', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
export function useLookups() {
  const s = useStore();
  return {
    prop: (id?: string) => s.properties.find(p => p.id === id),
    tenant: (id?: string) => s.tenants.find(t => t.id === id),
    contractor: (id?: string) => s.contractors.find(c => c.id === id),
  };
}
export type Lookups = ReturnType<typeof useLookups>;

export const rentStatus = (r: D.RentRow): { label: string; tone: D.Tone } => {
  if (r.paid >= r.amount) return { label: 'Paid', tone: 'ok' };
  const d = D.daysFrom(r.due);
  if (r.paid > 0) return d < 0 ? { label: 'Part-paid · late', tone: 'err' } : { label: 'Part-paid', tone: 'warn' };
  if (d < 0) return { label: `Late · ${-d} days`, tone: 'err' };
  if (d === 0) return { label: 'Due today', tone: 'info' };
  return { label: 'Due ' + r.due.replace(' 2026', ''), tone: 'neutral' };
};
