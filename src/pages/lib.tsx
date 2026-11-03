import { useState, type ReactNode } from 'react';
import { Download, Send, Eye, FileText, Image as ImageIcon, CheckCircle2, Landmark, Wrench } from 'lucide-react';
import { useStore, useLookups, money, rentStatus } from '../store';
import { PLAN, ME_NAME, CERT_KINDS, MONTHS, nowStamp, parseDate, fmtDate, daysFrom, type Job, type Line, type Invoice, type Inspection, type Property, type SafetyCert, type CertStatus, type Tone } from '../data';
import { feeOf, isLeased, LSP_NAME } from '../pricing';
import { Btn, Chip, Modal, Note, KV, Card, Empty, Field, Area } from '../ui';

/* Shared pieces for the landlord portal: what each status means to a landlord, money maths, and the LSP paper templates. */

export type S = ReturnType<typeof useStore>;
export const DONE_JOB = ['Approved', 'Invoiced', 'Declined'];
export const r2 = (n: number) => Math.round(n * 100) / 100;
const num = (n: number) => n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const ddmm = (x: string) => { const t = parseDate(x); return `${String(t.getDate()).padStart(2, '0')}/${String(t.getMonth() + 1).padStart(2, '0')}/${t.getFullYear()}`; };
export const adminName = (s: S, id?: string) => s.staff.find(x => x.id === id)?.name ?? 'LSP';
export const myAdmin = (s: S) => s.staff.find(x => x.id === s.me.admin);

/* ---------------- homes ---------------- */
export const managedHomes = (s: S) => s.properties.filter(p => !isLeased(p));
export const leasedHomes = (s: S) => s.properties.filter(p => isLeased(p));
export const homeType = (p: Property) => p.type === 'HMO' ? `Shared house · ${p.rooms} rooms` : `${p.beds} bed ${p.type.toLowerCase()}`;

/* ---------------- repairs, as the landlord sees them ---------------- */
/** Over the landlord's job limit (managed homes) or an owner repair under the lease: the landlord approves an invoice before work starts. */
export const needsMe = (j: Job) => j.status === 'Landlord approval' && !!j.landlordAsk;
export const limitOf = (s: S) => PLAN[s.me.plan].limit;
export const yourStep = (s: S, j: Job) => !!j.ownerRepair || (j.price > limitOf(s) && !isLeased(s.properties.find(p => p.id === j.property)));
export function jobView(j: Job): { label: string; tone: Tone } {
  return ({
    New: { label: 'LSP is checking it', tone: 'info' }, 'Waiting approval': { label: 'With LSP for approval', tone: 'info' }, 'Landlord approval': { label: 'Needs your approval', tone: 'warn' },
    'Ready to assign': { label: 'Booking a contractor', tone: 'info' }, Assigned: { label: 'Contractor booked', tone: 'brand' }, 'In progress': { label: 'Work in progress', tone: 'brand' },
    'Sent back': { label: 'Being put right', tone: 'warn' }, 'Proof uploaded': { label: 'LSP checking the work', tone: 'brand' }, Approved: { label: 'Work done', tone: 'ok' },
    Invoiced: { label: 'Done', tone: 'ok' }, Declined: { label: 'Not going ahead', tone: 'neutral' }, 'Quote sent': { label: 'Quote sent', tone: 'info' }, 'Quote accepted': { label: 'Quote accepted', tone: 'info' },
  } as Record<string, { label: string; tone: Tone }>)[j.status] ?? { label: j.status, tone: 'neutral' };
}
export const STEPS_A = ['Reported', 'Priced', 'Approved by LSP', 'Work in progress', 'Checked by LSP', 'Done'];
export const STEPS_B = ['Reported', 'Priced', 'Approved by LSP', 'Your approval', 'Work in progress', 'Checked by LSP', 'Done'];
export function stepAt(j: Job, mine: boolean) {
  const v = ({ New: 1, 'Waiting approval': 2, 'Landlord approval': 3, 'Ready to assign': 3, Assigned: 3, 'In progress': 3, 'Sent back': 3, 'Proof uploaded': 4, Approved: 5, Invoiced: 6, Declined: 1 } as Record<string, number>)[j.status] ?? 1;
  return mine && v >= 3 && j.status !== 'Landlord approval' ? v + 1 : v;
}
/** Short line on why a repair needs the landlord's decision. */
export const whyMe = (s: S, j: Job) => j.ownerRepair ? 'Owner repair under the lease (roof and structure)' : `Over your ${money(limitOf(s))} job limit on the ${s.me.plan}% plan`;

/* ---------------- maintenance allowance ---------------- */
/** The yearly allowance from the agreement. Covered repairs use it once, when the work is done. */
export function allowanceOf(s: S) {
  const total = s.me.allowance ?? 0;
  const covered = s.jobs.filter(j => !j.ownerRepair && !yourStep(s, j));
  const posts = covered.filter(j => ['Approved', 'Invoiced'].includes(j.status)).map(j => ({ j, at: s.invoices.find(i => i.id === j.invoice)?.issued ?? j.reported.split(',')[0], amount: j.price }));
  const used = posts.reduce((a, x) => a + x.amount, 0);
  const committed = covered.filter(j => ['Ready to assign', 'Assigned', 'In progress', 'Sent back', 'Proof uploaded'].includes(j.status)).reduce((a, j) => a + j.price, 0);
  const waiting = covered.filter(j => ['New', 'Waiting approval'].includes(j.status) && j.price).reduce((a, j) => a + j.price, 0);
  const pct = total ? Math.round(used / total * 100) : 0; const pctAll = total ? Math.round((used + committed) / total * 100) : 0;
  return { total, used, committed, waiting, left: Math.max(0, total - used - committed), leftAfter: Math.max(0, total - used - committed), pct, pctAll, posts, renews: renewDate(s) };
}
export const allowTone = (pct: number) => pct >= 90 ? 'err' as const : pct >= 70 ? 'warn' as const : 'brand' as const;
/** Colour names the budget bar understands. */
export const barTone = (pct: number) => pct >= 90 ? 'err' : pct >= 70 ? 'warn' : 'ok';
export function renewDate(s: S) { const d = parseDate(s.me.start); d.setFullYear(d.getFullYear() + 1); return fmtDate(d); }

/* ---------------- safety ---------------- */
export const certTone = (st: CertStatus) => ({ Valid: 'ok', 'Due soon': 'warn', Overdue: 'err', Booked: 'info', 'Proof to check': 'brand', Missing: 'err' } as const)[st];
export const certLabel = (c: SafetyCert) => c.status === 'Booked' ? 'Renewal booked' : c.status === 'Proof to check' ? 'LSP checking' : c.status;
export const daysText = (c: SafetyCert) => c.status === 'Missing' ? 'No certificate' : c.days < 0 ? `${-c.days} days over` : c.days === 0 ? 'Ends today' : c.days > 365 ? `${Math.round(c.days / 365)} years left` : `${c.days} days left`;

/* ---------------- monthly statements (managed homes only) ---------------- */
export const PAY_DAY = 20;
export interface StatementRow { home: Property; tenant: string; due: number; received: number }
export interface Statement { key: string; month: string; rows: StatementRow[]; due: number; received: number; fee: number; vat: number; vatOn: boolean; repairs: number; bills: Invoice[]; pay: number; paid: boolean; payDate: string }
const monthStart = (m: string) => parseDate('1 ' + m);
export function statements(s: S): Statement[] {
  const homes = managedHomes(s); const out: Statement[] = [];
  const first = homes.reduce((a, p) => Math.min(a, parseDate(p.added).getTime()), Infinity);
  const d = new Date(first); d.setDate(1);
  while (d.getTime() <= new Date(2026, 9, 1).getTime()) {
    const month = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`; const ms = monthStart(month).getTime();
    const rows: StatementRow[] = [];
    homes.forEach(p => s.tenants.filter(t => t.property === p.id && parseDate(t.start).getTime() <= ms && parseDate(t.end).getTime() >= ms).forEach(t => {
      const rr = s.rent.find(r => r.tenant === t.id && r.month === month);
      rows.push({ home: p, tenant: t.name, due: t.rent, received: rr ? rr.paid : t.rent });
    }));
    const due = rows.reduce((a, r) => a + r.due, 0), received = rows.reduce((a, r) => a + r.received, 0);
    const f = feeOf(received, s.me.plan, s.vat);
    const current = month === 'Oct 2026';
    const bills = s.invoices.filter(i => !i.covered && i.amount > i.paid === current && chargeable(s, i) && (current ? !i.reportedPaid : (i.paidAt ?? '').includes(month.split(' ')[0])));
    const repairs = bills.reduce((a, i) => a + (current ? i.amount - i.paid : i.amount), 0);
    const pay = Math.max(0, r2(received - r2(f.net) - r2(f.vat) - repairs));
    out.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, month, rows, due, received, fee: r2(f.net), vat: r2(f.vat), vatOn: f.on, repairs, bills, pay, paid: !current, payDate: `${PAY_DAY} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` });
    d.setMonth(d.getMonth() + 1);
  }
  return out.reverse();
}
/** An invoice only becomes payable once the work behind it is finished. Invoices still waiting for approval are never charged. */
export function chargeable(s: S, i: Invoice) { const j = i.job ? s.jobs.find(x => x.id === i.job) : undefined; return !j || j.status === 'Invoiced'; }
export function invoiceView(s: S, i: Invoice): { label: string; tone: Tone } {
  const j = i.job ? s.jobs.find(x => x.id === i.job) : undefined;
  if (i.covered) return { label: 'Covered by your plan', tone: 'ok' };
  if (j?.status === 'Landlord approval') return { label: 'Needs your approval', tone: 'warn' };
  if (j?.status === 'Declined') return { label: 'Declined · nothing to pay', tone: 'neutral' };
  if (i.paid >= i.amount) return { label: 'Paid', tone: 'ok' };
  if (j && j.status !== 'Invoiced') return { label: 'Approved · charged when done', tone: 'info' };
  if (i.reportedPaid) return { label: 'Payment sent · LSP checking', tone: 'info' };
  if (i.overdue) return { label: `Overdue · ${money(i.amount - i.paid)}`, tone: 'err' };
  return { label: `To pay · ${money(i.amount - i.paid)}`, tone: 'warn' };
}

/* ---------------- company details and the LSP paper template ---------------- */
export const COMPANY = {
  name: 'Landlord Service Plans Limited', address: ['1 Upper Street', 'London N1 0PQ'], email: 'accounts@lsp.co.uk',
  reg: 'Company Registration No. 13940065', bank: ['Sort Code: 04-03-70', 'Account No.: 45338201'],
};
/** Opens the browser's print dialog for the document only (Save as PDF). */
export function downloadPdf(s: S, name: string) {
  s.toast(`${name} ready. Choose "Save as PDF" to download.`);
  document.body.classList.add('printdoc');
  setTimeout(() => { try { window.print(); } catch { /* preview frames may block printing */ } document.body.classList.remove('printdoc'); }, 60);
}
export function DocSheet({ kind, to, meta, site, lines, foot, stamp, children, vatNo }: {
  vatNo?: string; kind: string; to: { label: string; rows: string[] }; meta: [string, string][]; site?: string; lines?: Line[];
  foot?: [string, string][]; stamp?: { text: string; tone: 'ok' | 'info' | 'warn' }; children?: ReactNode;
}) {
  const total = lines ? r2(lines.reduce((a, l) => a + l.qty * l.rate, 0)) : 0;
  return <div className="docwrap"><div className="paper">
    <div className="doc-h">
      <div className="stack" style={{ gap: 2 }}><b className="doc-co">{COMPANY.name}</b>{COMPANY.address.map(a => <span key={a}>{a}</span>)}<span>{COMPANY.email}</span><span className="doc-reg">{COMPANY.reg}</span>{vatNo && <span className="doc-reg">VAT no. {vatNo}</span>}</div>
      <img src="images/logo.svg" alt="Landlord Service Plans" className="doc-logo" />
    </div>
    <div className="doc-title">{kind}{stamp && <span className={`doc-stamp s-${stamp.tone}`}>{stamp.text}</span>}</div>
    <div className="doc-top">
      <div className="stack" style={{ gap: 2 }}><span className="doc-lab">{to.label}</span>{to.rows.filter(Boolean).map((r, i) => <span key={i} className={i === 0 ? 'strong' : ''}>{r}</span>)}
        {site && <><span className="doc-lab" style={{ marginTop: 14 }}>Site address</span><span>{site}</span></>}</div>
      <div className="doc-meta">{meta.map(([k, v]) => <div key={k}><span className="doc-lab">{k}</span><span>{v}</span></div>)}</div>
    </div>
    {lines && <>
      <table className="doc-t"><thead><tr><th>Product or service</th><th>Description</th><th className="r">Qty</th><th className="r">Rate</th><th className="r">Amount</th></tr></thead>
        <tbody>{lines.map((l, i) => <tr key={i}><td>{l.activity}</td><td>{l.desc}</td><td className="r">{l.qty}</td><td className="r">{num(l.rate)}</td><td className="r">{num(r2(l.qty * l.rate))}</td></tr>)}</tbody></table>
      <div className="doc-tot">{(foot ?? [['Balance due', '£' + num(total)]]).map(([k, v], i, a) => <div key={k} className={i === a.length - 1 ? 'big' : ''}><span>{k}</span><b>{v}</b></div>)}</div>
    </>}
    {children}
    <div className="doc-f"><div className="stack" style={{ gap: 2 }}><span>{COMPANY.name}</span>{COMPANY.bank.map(b => <span key={b}>{b}</span>)}</div><span>Page 1 of 1</span></div>
  </div></div>;
}
export const invoiceLines = (i: Invoice): Line[] => i.items.map(x => ({ activity: x.activity ?? 'Services', desc: x.desc, qty: x.qty ?? 1, rate: x.rate ?? x.amount }));

/** The invoice as the landlord sees it: the LSP paper, plus how to pay or why there is nothing to pay. */
export function InvoiceModal({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useStore(); const i = s.invoices.find(x => x.id === id)!; const st = invoiceView(s, i);
  const j = i.job ? s.jobs.find(x => x.id === i.job) : undefined;
  const [tell, setTell] = useState(false);
  const left = i.amount - i.paid; const toPay = !i.covered && left > 0 && chargeable(s, i) && !i.reportedPaid;
  return <Modal wide title={`Invoice ${i.id}`} sub={`${i.site ?? ''} · ${st.label}`} onClose={onClose}
    footer={<>
      <Btn kind="outline" icon={<Download size={16} />} onClick={() => { s.log(`Downloaded invoice ${i.id}`, 'Invoices'); downloadPdf(s, `Invoice ${i.id}`); }}>Download PDF</Btn>
      {j && needsMe(j) && <Btn icon={<CheckCircle2 size={16} />} onClick={() => { onClose(); s.go('approvals', j.id); }}>Open approval</Btn>}
      {toPay && <Btn icon={<Landmark size={16} />} onClick={() => setTell(true)}>I've paid by bank transfer</Btn>}
      {!toPay && !(j && needsMe(j)) && <Btn kind="outline" onClick={onClose}>Close</Btn>}
    </>}>
    <div className="flex wrap" style={{ gap: 8 }}><Chip tone={st.tone}>{st.label}</Chip>{i.paidAt && !i.covered && <span className="caption">Paid {i.paidAt}</span>}{j && <button className="link small" onClick={() => { onClose(); s.go('repairs', j.id); }}>Repair: {j.title}</button>}</div>
    {i.covered && <Note tone="ok">Covered by your {s.me.plan}% plan. Nothing to pay. {money(i.amount)} was used from your maintenance allowance.</Note>}
    {toPay && <Note>Taken from your next rent payout on {PAY_DAY} Oct, or pay by bank transfer to {COMPANY.bank.join(', ')} using {i.id} as the reference.</Note>}
    {i.reportedPaid && left > 0 && <Note>You told LSP you paid on {i.reportedPaid}. LSP checks the bank, then marks it paid.</Note>}
    <DocSheet kind="INVOICE" to={{ label: 'Invoice to', rows: [s.me.name, ...s.me.billing.split(', ')] }} site={i.site}
      meta={[['Invoice', i.id.replace('INV-', '')], ['Date', ddmm(i.issued)], ['Terms', i.terms === 'Straight away' ? 'Due on receipt' : 'Net ' + i.terms.replace(' days', '')], ['Due date', ddmm(i.due)]]}
      lines={invoiceLines(i)} vatNo={i.vat ? i.vatNo : undefined}
      foot={[...(i.vat ? [['Subtotal', '£' + num(r2(i.amount - i.vat))], [`VAT ${i.vatRate ?? 20}%`, '£' + num(i.vat)]] as [string, string][] : []), ...(i.covered ? [['Total', '£' + num(i.amount)], ['Covered by plan', '−£' + num(i.amount)], ['Balance due', '£0.00']] as [string, string][] : i.paid > 0 ? [['Total', '£' + num(i.amount)], ['Paid', '−£' + num(i.paid)], ['Balance due', '£' + num(left)]] as [string, string][] : [['Balance due', '£' + num(i.amount)]] as [string, string][])]}
      stamp={i.covered ? { text: 'COVERED', tone: 'ok' } : left <= 0 ? { text: 'PAID', tone: 'ok' } : j && needsMe(j) ? { text: 'FOR APPROVAL', tone: 'warn' } : { text: 'SENT', tone: 'info' }}>{i.note && <p className="doc-note">{i.note}</p>}</DocSheet>
    {tell && <Modal title="Tell LSP you've paid" sub="LSP checks the bank and marks the invoice paid. Nothing changes until they do." onClose={() => setTell(false)}
      footer={<><Btn kind="outline" onClick={() => setTell(false)}>Cancel</Btn><Btn icon={<Send size={16} />} onClick={() => {
        const at = nowStamp(); s.setInvoices(is => is.map(x => x.id === i.id ? { ...x, reportedPaid: at } : x));
        s.setMe(l => ({ ...l, comms: [...l.comms, { id: 'cm' + Date.now(), at, by: ME_NAME, channel: 'Portal', dir: 'in', subject: `Paid invoice ${i.id}`, text: `I have paid ${money(left)} for invoice ${i.id} by bank transfer, reference ${i.id}.` }] }));
        s.log(`Told LSP you paid invoice ${i.id} (${money(left)}) by bank transfer`, 'Invoices'); s.toast('Sent. LSP will check the bank.'); setTell(false);
      }}>Send to LSP</Btn></>}>
      <KV rows={[['Invoice', i.id], ['Amount', money(left)], ['Paid to', COMPANY.bank.join(' · ')], ['Reference', i.id]]} />
    </Modal>}
  </Modal>;
}

/** Repair report for the landlord: what happened, when, and the photo proof. No internal costs. */
export function JobReportModal({ j, onClose }: { j: Job; onClose: () => void }) {
  const s = useStore(); const L = useLookups(); const p = L.prop(j.property); const c = L.contractor(j.contractor);
  const inv = j.invoice ? s.invoices.find(i => i.id === j.invoice) : undefined;
  return <Modal wide title={`Repair report · ${j.title}`} sub={`${p?.address} · every step with the date and time, and the photo proof.`} onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Close</Btn><Btn icon={<Download size={16} />} onClick={() => { s.log(`Downloaded the repair report for ${j.title}`, 'Repairs'); downloadPdf(s, `Repair report ${j.id}`); }}>Download PDF</Btn></>}>
    <DocSheet kind="REPAIR REPORT" to={{ label: 'Prepared for', rows: [s.me.name, `${s.me.plan}% plan`] }} site={p ? `${p.address}, ${p.area}` : ''}
      meta={[['Repair', j.id], ['Status', jobView(j).label], ['Reported', j.reported], ['Office Admin', adminName(s, j.admin)]]}>
      <div className="doc-sec"><span className="doc-lab">The repair</span><b>{j.title}</b><span>{j.note ?? 'No details given.'}</span>
        <div className="doc-kv"><span>Reported by</span><b>{j.by}</b><span>Contractor</span><b>{c?.name ?? 'Not booked yet'}</b><span>Cost</span><b>{j.price ? money(j.price) : 'Not priced yet'}</b><span>Invoice</span><b>{inv ? `${inv.id} · ${invoiceView(s, inv).label}` : 'Not invoiced'}</b></div></div>
      <div className="doc-sec"><span className="doc-lab">What happened</span>{j.events.map((e, i) => <div key={i} className="doc-ev"><span>{e.at}</span><span>{e.text}<em> · {e.by}</em></span></div>)}</div>
      <div className="doc-sec"><span className="doc-lab">Photo proof</span>{j.proof?.length ? <div className="doc-ph">{j.proof.map((x, i) => <div key={i} style={{ backgroundImage: `url(images/home${(i % 3) + 1}.jpg)` }}><span>{x}</span></div>)}</div> : <span className="caption"><ImageIcon size={12} style={{ verticalAlign: -2 }} /> Photos are added when the work is finished.</span>}</div>
    </DocSheet>
  </Modal>;
}

/** Locked inspection report: rooms, condition, meters and keys. */
export function InspectionModal({ i, onClose }: { i: Inspection; onClose: () => void }) {
  const s = useStore(); const L = useLookups(); const p = L.prop(i.property);
  return <Modal wide title={`${i.kind} inspection · ${p?.address}`} sub={i.doneAt ? `Done ${i.doneAt}. Checked and locked by LSP.` : `Booked for ${i.date}, ${i.time}.`} onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Close</Btn>{i.doneAt && <Btn icon={<Download size={16} />} onClick={() => { s.log(`Downloaded the ${i.kind.toLowerCase()} inspection report for ${p?.address}`, 'Inspections'); downloadPdf(s, `Inspection report ${i.id}`); }}>Download PDF</Btn>}</>}>
    {!i.doneAt ? <><KV rows={[['When', `${i.date}, ${i.time}`], ['What', `${i.kind} · ${i.scope}`], ['Who', L.contractor(i.inspector)?.name ?? 'LSP is booking someone'], ['Note', i.notes ?? '—']]} /><Note>LSP arranges access with the tenant. You get the report here once it is checked.</Note></>
      : <DocSheet kind="INSPECTION REPORT" to={{ label: 'Prepared for', rows: [s.me.name] }} site={p ? `${p.address}, ${p.area}` : ''}
        meta={[['Inspection', i.id], ['Type', i.kind], ['Done', i.doneAt], ['Inspector', L.contractor(i.inspector)?.name ?? '—']]}>
        <div className="doc-sec"><span className="doc-lab">Summary</span><span>{i.summary ?? 'No summary.'}</span></div>
        <div className="doc-sec"><span className="doc-lab">Rooms</span><table className="doc-t sm"><thead><tr><th>Room</th><th>Condition</th><th>Photos</th><th>Notes</th></tr></thead><tbody>{i.rooms.map(r => <tr key={r.name}><td>{r.name}</td><td>{r.condition}</td><td>{r.photos}</td><td>{r.note}</td></tr>)}</tbody></table></div>
        <div className="doc-sec"><span className="doc-lab">Meters and keys</span><div className="doc-kv"><span>Gas</span><b>{i.meters.gas ?? '—'}</b><span>Electric</span><b>{i.meters.electric ?? '—'}</b><span>Water</span><b>{i.meters.water ?? '—'}</b><span>Keys</span><b>{i.keys}</b></div></div>
      </DocSheet>}
  </Modal>;
}

/* ---------------- Property Management Plan (view and download) ---------------- */
const NR = 'Not recorded';
export function PlanModal({ p, onClose }: { p: Property; onClose: () => void }) {
  const s = useStore(); const L = useLookups(); const at = nowStamp();
  const tenants = s.tenants.filter(t => t.property === p.id && t.status !== 'Moved out');
  const certs = s.safety.filter(c => c.property === p.id);
  const insp = s.inspections.filter(i => i.property === p.id).sort((a, b) => parseDate(b.doneAt ?? b.date).getTime() - parseDate(a.doneAt ?? a.date).getTime());
  const open = s.jobs.filter(j => j.property === p.id && !DONE_JOB.includes(j.status));
  const leased = isLeased(p);
  const tables: { title: string; cols: string[]; rows: string[][] }[] = [
    { title: 'Compliance schedule', cols: ['Certificate', 'Status', 'Done', 'Due date', 'Who'], rows: CERT_KINDS.filter(k => certs.some(c => c.kind === k)).map(k => { const c = certs.find(x => x.kind === k)!; return [k, certLabel(c), c.issued ? c.issued.split(',')[0] : NR, c.issued ? c.expires : NR, L.contractor(c.contractor)?.name ?? '—']; }) },
    ...(leased ? [] : [{ title: 'Inspection summary', cols: ['Inspection', 'Date', 'Findings', 'Inspector'], rows: insp.map(i => [i.kind, i.doneAt ? i.doneAt.split(',')[0] : `Booked ${i.date}`, i.summary ?? (i.doneAt ? NR : 'Visit to take place'), L.contractor(i.inspector)?.name ?? 'Not booked']) }]),
    { title: 'Maintenance and actions', cols: ['Item', 'Status', 'Cost'], rows: open.map(j => [j.title, jobView(j).label, j.price ? money(j.price) : NR]) },
    { title: 'Responsibilities', cols: ['What', 'Who'], rows: leased ? [['Landlord to the occupiers', LSP_NAME], ['Day-to-day repairs, safety checks, inspections, finding tenants', LSP_NAME], [p.lease!.ownerDoes, `${s.me.name} (owner)`]] : [['Day-to-day management', `LSP · ${adminName(s, p.admin)}`], ['Repairs over the job limit', `${s.me.name} approves (over ${money(limitOf(s))} per job)`], ['Safety checks and inspections', 'LSP books them and checks the evidence']] },
  ];
  return <Modal wide title={`Property Management Plan · ${p.address}`} sub="Made from the records LSP holds for this home today. Anything not on file says “Not recorded”." onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Close</Btn><Btn icon={<Download size={16} />} onClick={() => { s.log(`Downloaded the Property Management Plan for ${p.address}`, 'Documents'); downloadPdf(s, `Plan ${p.address}`); }}>Download PDF</Btn></>}>
    <DocSheet kind="PROPERTY MANAGEMENT PLAN" to={{ label: leased ? 'Owner' : 'Landlord', rows: [s.me.name, ...s.me.billing.split(', '), leased ? 'Leased to LSP' : `${s.me.plan}% plan`] }} site={`${p.address}, ${p.area}`}
      meta={[['Plan ref', `PMP-${p.id}`], ['Updated', at], ['Office Admin', adminName(s, p.admin)]]}>
      <div className="doc-sec"><span className="doc-lab">Property and tenancy</span><div className="doc-kv two">{[['Property', `${homeType(p)} · ${p.baths} bath`], ['Occupancy', p.status], ...(leased ? [['Arrangement', `Leased to LSP · ${p.lease!.start} to ${p.lease!.end}`], ['Lease rent', `${money(p.lease!.rent)} ${p.lease!.frequency.toLowerCase()}`]] : [['Rent', `${money(p.rent)} pcm`], ...(tenants.length ? tenants.map(t => ['Tenancy', `${t.name} · ${t.start} to ${t.end}`]) : [['Tenancy', 'No current tenancy']])])].flatMap(([k, v], i) => [<span key={'k' + i}>{k}</span>, <b key={'v' + i}>{v}</b>])}</div></div>
      {tables.map(t => <div key={t.title} className="doc-sec"><span className="doc-lab">{t.title}</span>{t.rows.length ? <table className="doc-t sm"><thead><tr>{t.cols.map(c => <th key={c}>{c}</th>)}</tr></thead><tbody>{t.rows.map((r, i) => <tr key={i}>{r.map((c, k) => <td key={k} className={c === NR ? 'nr' : ''}>{c}</td>)}</tr>)}</tbody></table> : <span className="caption">Nothing open.</span>}</div>)}
    </DocSheet>
  </Modal>;
}

/* ---------------- small shared blocks ---------------- */
/** Rent this month for one tenant, as a short line. */
export function RentLine({ tenant }: { tenant: string }) {
  const s = useStore(); const r = s.rent.find(x => x.tenant === tenant); if (!r) return null; const st = rentStatus(r);
  return <span className="flex" style={{ gap: 8 }}><span className="caption">{money(r.paid)} of {money(r.amount)}</span><Chip tone={st.tone}>{st.label}</Chip></span>;
}
/** Ask LSP something about a record. Saved in Messages with the date and time. */
export function AskModal({ title, about, onClose, onSent }: { title: string; about: string; onClose: () => void; onSent?: (text: string) => void }) {
  const s = useStore(); const [t, setT] = useState('');
  return <Modal title={title} sub={`Goes to ${myAdmin(s)?.name ?? 'LSP'} (your Office Admin). You'll see the reply in Messages.`} onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn icon={<Send size={16} />} disabled={!t.trim()} onClick={() => {
      s.setMe(l => ({ ...l, comms: [...l.comms, { id: 'cm' + Date.now(), at: nowStamp(), by: ME_NAME, channel: 'Portal', dir: 'in', subject: about, text: t.trim() }] }));
      s.log(`Sent a message: ${about}`, 'Messages'); s.toast('Message sent to LSP'); onSent?.(t.trim()); onClose();
    }}>Send</Btn></>}>
    <Field label="About"><input className="input" readOnly value={about} /></Field>
    <Field label="Your message"><Area value={t} onChange={setT} placeholder="Type your question" /></Field>
  </Modal>;
}
export function MiniJobList({ jobs, empty = 'No repairs.' }: { jobs: Job[]; empty?: string }) {
  const s = useStore(); const L = useLookups();
  return jobs.length ? <div className="divlist">{jobs.map(j => { const v = jobView(j); return <button key={j.id} className="item click" onClick={() => s.go(needsMe(j) ? 'approvals' : 'repairs', j.id)}><span className={`tile ${needsMe(j) ? 't-warn' : j.urgent && !DONE_JOB.includes(j.status) ? 't-err' : 't-info'}`} style={{ width: 32, height: 32 }}><Wrench size={15} /></span><div className="stack grow"><b>{j.title}</b><span className="caption">{L.prop(j.property)?.address} · {j.reported.split(',')[0]}{j.price ? ' · ' + money(j.price) : ''}</span></div><Chip tone={v.tone}>{v.label}</Chip></button>; })}</div> : <Empty icon={<Wrench size={22} />}>{empty}</Empty>;
}
export function ViewBtn({ onClick, label = 'View' }: { onClick: () => void; label?: string }) { return <Btn sm kind="ghost" icon={<Eye size={14} />} onClick={onClick}>{label}</Btn>; }
export function DocIcon() { return <span className="tile t-brand" style={{ width: 32, height: 32 }}><FileText size={15} /></span>; }
export function SectionNote({ children }: { children: ReactNode }) { return <Card className="flat"><span className="small">{children}</span></Card>; }
export { rentStatus, daysFrom };
