import { useState } from 'react';
import { FileText, Download, Eye, FolderOpen } from 'lucide-react';
import { useStore, useLookups, type Lookups } from '../store';
import { Btn, Card, Chip, Empty, Kpi, FilterBar, applyFlt, useFlt, yearsOf } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { statements, InvoiceModal, InspectionModal, PlanModal, JobReportModal, type S } from './lib';
import { isLeased } from '../pricing';

export type DocKind = 'Certificate' | 'Tenancy' | 'Inspection report' | 'Invoice' | 'Statement' | 'Lease' | 'Agreement' | 'Property plan' | 'Repair report';
export interface Doc { id: string; name: string; kind: DocKind; home?: string; tenant?: string; date: string; note: string; view?: { type: 'inv' | 'insp' | 'plan' | 'job' | 'statement' | 'cert'; id: string } }

/** Every document the landlord can see, built from the records LSP holds. Pass a home to get only that home's documents. */
export function docsFor(s: S, L: Lookups, home?: string): Doc[] {
  const inHome = (p?: string) => !home || p === home;
  const out: Doc[] = [];
  s.safety.filter(c => inHome(c.property) && c.file).forEach(c => {
    out.push({ id: c.id, name: `${c.kind} certificate`, kind: 'Certificate', home: c.property, date: c.issued!.split(',')[0], note: `Ends ${c.expires} · ${c.file}`, view: { type: 'cert', id: c.id } });
    c.history.forEach((h, i) => out.push({ id: c.id + 'h' + i, name: `${c.kind} certificate (earlier version)`, kind: 'Certificate', home: c.property, date: h.issued.split(',')[0], note: `Ended ${h.expires} · ${h.file}` }));
  });
  s.tenants.filter(t => inHome(t.property)).forEach(t => {
    out.push({ id: 'TA' + t.id, name: `Tenancy agreement · ${t.name}`, kind: 'Tenancy', home: t.property, tenant: t.id, date: t.start, note: 'Signed by everyone' });
    out.push({ id: 'DP' + t.id, name: `Deposit protection certificate · ${t.name}`, kind: 'Tenancy', home: t.property, tenant: t.id, date: t.start, note: `${t.depositScheme} · ${t.depositRef}` });
  });
  s.inspections.filter(i => inHome(i.property) && i.status === 'Locked').forEach(i => out.push({ id: i.id, name: `${i.kind} inspection report`, kind: 'Inspection report', home: i.property, date: i.doneAt!.split(',')[0], note: 'Checked and locked by LSP', view: { type: 'insp', id: i.id } }));
  s.invoices.filter(i => inHome(s.jobs.find(j => j.id === i.job)?.property ?? s.properties.find(p => p.address === i.site)?.id)).forEach(i => out.push({ id: i.id, name: `Invoice ${i.id}`, kind: 'Invoice', home: s.jobs.find(j => j.id === i.job)?.property, date: i.issued, note: i.site ?? '', view: { type: 'inv', id: i.id } }));
  s.jobs.filter(j => inHome(j.property) && ['Approved', 'Invoiced'].includes(j.status)).forEach(j => out.push({ id: 'RR' + j.id, name: `Repair report · ${j.title}`, kind: 'Repair report', home: j.property, date: j.events[j.events.length - 1].at.split(',')[0], note: `${j.proof?.length ?? 0} photos`, view: { type: 'job', id: j.id } }));
  if (!home) statements(s).forEach(x => out.push({ id: 'ST' + x.key, name: `${x.month} statement`, kind: 'Statement', date: x.payDate, note: x.paid ? 'Paid' : 'Due', view: { type: 'statement', id: x.key } }));
  s.properties.filter(p => inHome(p.id)).forEach(p => {
    out.push({ id: 'PMP' + p.id, name: `Property Management Plan · ${p.address}`, kind: 'Property plan', home: p.id, date: '15 Oct 2026', note: 'Made from today\'s records', view: { type: 'plan', id: p.id } });
    if (isLeased(p)) out.push({ id: 'LS' + p.id, name: `Signed lease · ${p.lease!.ref}`, kind: 'Lease', home: p.id, date: p.lease!.start, note: p.lease!.doc ?? '' });
    else out.push({ id: 'AG' + p.id, name: `Management agreement · ${s.me.plan}% plan`, kind: 'Agreement', home: p.id, date: p.added, note: 'Signed by you and LSP' });
  });
  void L;
  return out;
}

export function DocTable({ list: all, hideHome }: { list: Doc[]; hideHome?: boolean }) {
  const s = useStore(); const L = useLookups(); const [f, setF] = useFlt(); const [open, setOpen] = useState<Doc | null>(null);
  const list = applyFlt(all, f, { text: d => `${d.name} ${d.note} ${L.prop(d.home)?.address ?? ''}`, type: d => d.kind, date: d => d.date });
  const dl = (d: Doc) => { s.log(`Downloaded ${d.name}${d.home ? ' for ' + L.prop(d.home)?.address : ''}`, 'Documents'); s.toast('Download started'); };
  const view = (d: Doc) => { if (!d.view) return dl(d); if (d.view.type === 'statement') return s.go('rent', d.view.id); if (d.view.type === 'cert') return s.go('safety', d.view.id); setOpen(d); };
  return <>
    <FilterBar f={f} set={setF} placeholder="Search documents" types={[...new Set(all.map(d => d.kind))]} typeLabel="All document types" years={yearsOf(all, d => d.date)} shown={list.length} total={all.length} />
    <div className="tablewrap"><table className="t"><thead><tr><th>Document</th>{!hideHome && <th>Home</th>}<th>Type</th><th>Date</th><th /></tr></thead><tbody>
      {list.map(d => <tr key={d.id} onClick={() => view(d)}>
        <td><span className="cell"><span className="tile t-brand" style={{ width: 32, height: 32 }}><FileText size={15} /></span><span className="stack"><b className="strong">{d.name}</b><span className="caption">{d.note}</span></span></span></td>
        {!hideHome && <td>{L.prop(d.home)?.address ?? 'All homes'}</td>}<td><Chip tone="neutral" dot={false}>{d.kind}</Chip></td><td>{d.date}</td>
        <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}><div className="flex" style={{ justifyContent: 'flex-end' }}>{d.view && <Btn sm kind="ghost" icon={<Eye size={14} />} onClick={() => view(d)}>View</Btn>}<Btn sm kind="ghost" icon={<Download size={14} />} onClick={() => dl(d)}>PDF</Btn></div></td></tr>)}
    </tbody></table>{!list.length && <Empty icon={<FolderOpen size={22} />}>No documents match.</Empty>}</div>
    {open?.view?.type === 'inv' && <InvoiceModal id={open.view.id} onClose={() => setOpen(null)} />}
    {open?.view?.type === 'insp' && <InspectionModal i={s.inspections.find(i => i.id === open.view!.id)!} onClose={() => setOpen(null)} />}
    {open?.view?.type === 'plan' && <PlanModal p={s.properties.find(p => p.id === open.view!.id)!} onClose={() => setOpen(null)} />}
    {open?.view?.type === 'job' && <JobReportModal j={s.jobs.find(j => j.id === open.view!.id)!} onClose={() => setOpen(null)} />}
  </>;
}

export function Documents() {
  const s = useStore(); const L = useLookups();
  const all = docsFor(s, L).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const count = (k: DocKind[]) => all.filter(d => k.includes(d.kind)).length;
  return <>
    <PageHeader crumbs={crumbsFor('documents', s.go)} title="Documents" />
    <div className="grid g4">
      <Kpi icon={<FileText size={18} />} tone="ok" label="Certificates" value={count(['Certificate'])} caption="current and earlier versions" onClick={() => s.go('safety')} />
      <Kpi icon={<FileText size={18} />} tone="brand" label="Tenancy and lease" value={count(['Tenancy', 'Lease', 'Agreement'])} caption="agreements and deposits" />
      <Kpi icon={<FileText size={18} />} tone="info" label="Reports and plans" value={count(['Inspection report', 'Repair report', 'Property plan'])} caption="checked and locked" />
      <Kpi icon={<FileText size={18} />} tone="neutral" label="Money" value={count(['Invoice', 'Statement'])} caption="invoices and statements" onClick={() => s.go('rent')} />
    </div>
    <Card title="All documents" sub="Everything LSP holds for your homes. Search, choose a type or a year, then view or download. Earlier versions are kept.">
      <DocTable list={all} />
    </Card>
  </>;
}
