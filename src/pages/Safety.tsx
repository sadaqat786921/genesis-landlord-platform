import { useState } from 'react';
import { ShieldCheck, Download, AlertTriangle, CalendarClock, CheckCircle2, FileText, ClipboardCheck, MessageSquare } from 'lucide-react';
import { useStore, useLookups } from '../store';
import { type SafetyCert } from '../data';
import { Btn, Card, Chip, Drawer, Empty, KV, Kpi, Note, Timeline, FilterBar, applyFlt, useFlt, yearsOf, When } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { certTone, certLabel, daysText, InspectionModal, AskModal } from './lib';
import { InspList } from './Properties';

/** Certificates table with search, certificate type and year (year the certificate was done). */
export function CertTable({ list: all, hideHome }: { list: SafetyCert[]; hideHome?: boolean }) {
  const s = useStore(); const L = useLookups(); const [f, setF] = useFlt();
  const list = applyFlt(all, f, { text: c => `${c.kind} ${L.prop(c.property)?.address ?? ''} ${certLabel(c)}`, type: c => c.kind, date: c => c.issued ?? c.expires });
  return <>{all.length > 2 && <FilterBar f={f} set={setF} placeholder="Search certificates" types={[...new Set(all.map(c => c.kind))]} typeLabel="All certificates" years={yearsOf(all, c => c.issued ?? c.expires)} shown={list.length} total={all.length} />}
    <div className="tablewrap"><table className="t"><thead><tr><th>Certificate</th>{!hideHome && <th>Home</th>}<th>Done</th><th>Ends</th><th>Time left</th><th>Status</th><th /></tr></thead><tbody>
      {list.map(c => <tr key={c.id} onClick={() => s.go('safety', c.id)}>
        <td><span className="cell"><span className={`tile t-${certTone(c.status)}`} style={{ width: 32, height: 32 }}><ShieldCheck size={15} /></span><span className="stack"><b className="strong">{c.kind}</b><span className="caption">{L.contractor(c.contractor)?.name ?? '—'}</span></span></span></td>
        {!hideHome && <td>{L.prop(c.property)?.address}</td>}
        <td>{c.issued ? <When at={c.issued} /> : <span className="muted">—</span>}</td><td>{c.expires}</td><td>{daysText(c)}</td>
        <td><Chip tone={certTone(c.status)}>{certLabel(c)}</Chip></td>
        <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>{c.file && <Btn sm kind="ghost" icon={<Download size={14} />} onClick={() => { s.log(`Downloaded the ${c.kind.toLowerCase()} certificate for ${L.prop(c.property)?.address}`, 'Safety'); s.toast('Download started'); }}>PDF</Btn>}</td></tr>)}
    </tbody></table>{!list.length && <Empty icon={<ShieldCheck size={22} />}>No certificates here.</Empty>}</div></>;
}

export function Safety() {
  const s = useStore();
  const [insp, setInsp] = useState<string | null>(null);
  const open = s.detail ? s.safety.find(c => c.id === s.detail) : undefined;
  const C = s.safety;
  const upcoming = s.inspections.filter(i => i.status !== 'Locked');
  return <>
    <PageHeader crumbs={crumbsFor('safety', s.go)} title="Safety & Compliance" />
    <div className="grid g4">
      <Kpi icon={<CheckCircle2 size={18} />} tone="ok" label="In date" value={C.filter(c => c.status === 'Valid').length} caption={`of ${C.length} certificates`} />
      <Kpi icon={<CalendarClock size={18} />} tone="info" label="Renewal booked" value={C.filter(c => c.status === 'Booked').length} caption="LSP booked the visit" />
      <Kpi icon={<AlertTriangle size={18} />} tone="warn" label="Ending in 30 days" value={C.filter(c => c.days >= 0 && c.days <= 30).length} caption="LSP books the renewal" />
      <Kpi icon={<AlertTriangle size={18} />} tone="err" label="Overdue or missing" value={C.filter(c => ['Overdue', 'Missing'].includes(c.status)).length} caption="LSP is acting on it" />
    </div>
    <Note>LSP books every check, reminds you before a certificate ends, and checks the evidence before marking it done. A booking alone does not count as done.</Note>
    <Card title="Certificates" sub="Gas safety, electrical (EICR), energy (EPC) and fire alarm certificates for all your homes. Click one for its history and earlier versions.">
      <CertTable list={[...C].sort((a, b) => a.days - b.days)} />
    </Card>
    <Card title="Inspections and safety visits" sub="Booked visits and finished reports. LSP arranges access with your tenant.">
      <InspList list={[...upcoming, ...s.inspections.filter(i => i.status === 'Locked')]} onOpen={setInsp} />
    </Card>
    {open && <CertDrawer c={open} onClose={() => s.go('safety')} />}
    {insp && <InspectionModal i={s.inspections.find(i => i.id === insp)!} onClose={() => setInsp(null)} />}
    {!C.length && <Empty icon={<ClipboardCheck size={22} />}>No certificates yet.</Empty>}
  </>;
}

function CertDrawer({ c, onClose }: { c: SafetyCert; onClose: () => void }) {
  const s = useStore(); const L = useLookups(); const [ask, setAsk] = useState(false); const p = L.prop(c.property);
  const visit = s.inspections.find(i => i.property === c.property && i.kind === c.kind && i.status !== 'Locked');
  return <Drawer title={`${c.kind} · ${p?.address}`} sub={`${certLabel(c)} · ${daysText(c)}`} icon={<span className={`tile t-${certTone(c.status)}`}><FileText size={18} /></span>} onClose={onClose}
    footer={<><Btn kind="ghost" icon={<MessageSquare size={16} />} onClick={() => setAsk(true)}>Ask LSP</Btn>{c.file && <Btn icon={<Download size={16} />} onClick={() => { s.log(`Downloaded the ${c.kind.toLowerCase()} certificate for ${p?.address}`, 'Safety'); s.toast('Download started'); }}>Download certificate</Btn>}</>}>
    <Card className="flat"><KV rows={[['Home', p?.address ?? ''], ['Done', c.issued ?? 'No certificate on file'], ['Ends', c.expires], ['By', L.contractor(c.contractor)?.name ?? '—'], ['File', c.file ?? '—'], ['Status', certLabel(c)]]} /></Card>
    {visit && <Note>Renewal visit booked for {visit.date} at {visit.time} with {L.contractor(visit.inspector)?.name}. The new certificate shows here once LSP has checked it.</Note>}
    {['Due soon', 'Overdue', 'Missing'].includes(c.status) && !visit && <Note tone="warn">LSP is booking the renewal and will tell you the date.</Note>}
    <Card className="flat" title="Earlier versions" sub="Kept when a certificate is renewed.">
      {c.history.length ? <div className="divlist">{c.history.map(h => <div key={h.file} className="item"><FileText size={16} color="var(--text-brand)" /><div className="stack grow"><b>{h.file}</b><span className="caption">Done {h.issued} · ended {h.expires} · {h.by}</span></div><Btn sm kind="ghost" icon={<Download size={14} />} onClick={() => s.toast('Download started')}>PDF</Btn></div>)}</div> : <span className="caption">No earlier versions.</span>}
    </Card>
    {c.reminders.length > 0 && <Card className="flat" title="Reminders sent"><Timeline items={c.reminders.map(r => ({ at: r.at, text: `Reminder to ${r.to}` }))} /></Card>}
    {ask && <AskModal title="Ask LSP about this certificate" about={`Question about the ${c.kind.toLowerCase()} certificate at ${p?.address}`} onClose={() => setAsk(false)} />}
  </Drawer>;
}
