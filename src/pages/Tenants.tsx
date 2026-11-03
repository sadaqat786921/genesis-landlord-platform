import { useState } from 'react';
import { UserCheck, PoundSterling, CalendarClock, ShieldCheck, MessageSquare, Home } from 'lucide-react';
import { useStore, useLookups, money, rentStatus } from '../store';
import { daysFrom } from '../data';
import { Btn, Card, Chip, DetailHead, Empty, HSteps, KV, Kpi, Note, PageTabs, Avatar, Timeline } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { AskModal, adminName, MiniJobList, DONE_JOB, homeType, leasedHomes } from './lib';
import { DocTable, docsFor } from './Documents';

export function Tenants() {
  const s = useStore();
  if (s.detail && s.tenants.some(t => t.id === s.detail)) return <TenantPage id={s.detail} />;
  return <TenantList />;
}

function TenantList() {
  const s = useStore(); const L = useLookups();
  const live = s.tenants.filter(t => t.status !== 'Moved out');
  const owed = s.rent.filter(r => r.paid < r.amount);
  const ending = live.filter(t => daysFrom(t.end) <= 120);
  return <>
    <PageHeader crumbs={crumbsFor('tenants', s.go)} title="Tenants" />
    <div className="grid g4">
      <Kpi icon={<UserCheck size={18} />} tone="ok" label="Living in your homes" value={live.length} caption={`${s.tenants.filter(t => t.status === 'Moving out').length} moving out`} />
      <Kpi icon={<PoundSterling size={18} />} tone={owed.length ? 'err' : 'ok'} label="Rent owed" value={money(owed.reduce((a, r) => a + r.amount - r.paid, 0))} caption={owed.length ? 'LSP is chasing it' : 'all paid'} onClick={() => s.go('rent')} />
      <Kpi icon={<CalendarClock size={18} />} tone="info" label="Tenancies ending soon" value={ending.length} caption="in the next 4 months" />
      <Kpi icon={<ShieldCheck size={18} />} tone="ok" label="Deposits protected" value={`${live.filter(t => t.depositRef).length} of ${live.length}`} caption="in a government scheme" />
    </div>
    <Note>LSP looks after your tenants day to day: rent, repairs, checks and contact. To keep their details private, you see the tenancy and rent here. Ask LSP for anything else.</Note>
    <Card title="Your tenants" sub="Click a tenant for their tenancy, rent, deposit and documents.">
      <div className="tablewrap"><table className="t"><thead><tr><th>Tenant</th><th>Home</th><th>Tenancy</th><th>Rent</th><th>This month</th><th>Status</th></tr></thead><tbody>
        {s.tenants.map(t => { const r = s.rent.find(x => x.tenant === t.id); return <tr key={t.id} onClick={() => s.go('tenants', t.id)}>
          <td><span className="cell"><Avatar name={t.name} /><b className="strong">{t.name}</b></span></td><td>{L.prop(t.property)?.address}{t.room && <div className="caption">{t.room}</div>}</td><td>{t.start} to {t.end}</td><td>{money(t.rent)}</td>
          <td>{r ? <Chip tone={rentStatus(r).tone}>{rentStatus(r).label}</Chip> : '—'}</td><td><Chip tone={t.status === 'Live' ? 'ok' : t.status === 'Moving out' ? 'warn' : 'neutral'}>{t.status}</Chip></td></tr>; })}
      </tbody></table>{!s.tenants.length && <Empty icon={<UserCheck size={22} />}>No tenants yet.</Empty>}</div>
    </Card>
    {leasedHomes(s).length > 0 && <Card className="flat"><span className="flex small" style={{ gap: 8 }}><Home size={16} />{leasedHomes(s).map(p => p.address).join(', ')} {leasedHomes(s).length > 1 ? 'are' : 'is'} leased to LSP. LSP is the landlord there, so those occupiers are not listed.</span></Card>}
  </>;
}

const MOVE = ['Notice given', 'Inspection booked', 'Inspection done', 'Deposit returned', 'Moved out'];
function TenantPage({ id }: { id: string }) {
  const s = useStore(); const L = useLookups(); const t = s.tenants.find(x => x.id === id)!; const p = L.prop(t.property)!;
  const [tab, setTab] = useState<'tenancy' | 'rent' | 'issues' | 'documents'>('tenancy'); const [ask, setAsk] = useState(false);
  const r = s.rent.find(x => x.tenant === id); const issues = s.jobs.filter(j => j.tenant === id);
  const docs = docsFor(s, L, t.property).filter(d => d.tenant === id || d.kind === 'Tenancy');
  const left = daysFrom(t.end);
  return <>
    <PageHeader crumbs={crumbsFor('tenants', s.go, t.name)} back={() => s.go('tenants')} title={t.name} action={<Btn kind="outline" icon={<MessageSquare size={16} />} onClick={() => setAsk(true)}>Ask LSP about this tenancy</Btn>} />
    <DetailHead media={<Avatar name={t.name} size="xl" />} title={t.name} chips={<><Chip tone={t.status === 'Live' ? 'ok' : t.status === 'Moving out' ? 'warn' : 'neutral'}>{t.status}</Chip>{r && <Chip tone={rentStatus(r).tone}>{rentStatus(r).label}</Chip>}</>}
      meta={[['Home', p.address], ['Tenancy', `${t.start} to ${t.end}`], ['Rent', `${money(t.rent)} pcm`], ['Office Admin', adminName(s, p.admin)]]} />
    {t.moveOut && <Card title="Moving out" sub={`Leaving on ${t.moveOut.date}. ${t.moveOut.reason}`}><HSteps items={MOVE} at={t.moveOut.step} /></Card>}
    <PageTabs value={tab} onChange={setTab} items={[{ id: 'tenancy', label: 'Tenancy' }, { id: 'rent', label: 'Rent' }, { id: 'issues', label: 'Repairs reported', count: issues.length }, { id: 'documents', label: 'Documents', count: docs.length }]} />
    {tab === 'tenancy' && <div className="grid g2">
      <Card title="Tenancy"><KV rows={[['Home', `${p.address} · ${homeType(p)}`], ['Start and end', `${t.start} to ${t.end}`], ['Time left', left > 0 ? `${Math.round(left / 30)} months` : 'Ended'], ['Rent', `${money(t.rent)} a month, due on day ${t.rentDay}`], ['Agreement', 'Signed by everyone · in Documents']]} />
        {left <= 120 && left > 0 && <Note>The tenancy ends within 4 months. LSP will ask you whether to renew.</Note>}</Card>
      <Card title="Deposit"><KV rows={[['Amount', money(t.deposit)], ['Scheme', t.depositScheme], ['Reference', t.depositRef], ['Protected', 'Yes · certificate in Documents']]} /></Card>
      <Card title="Checks done by LSP" sub="LSP checked ID, right to rent and references before the tenancy started."><span className="small">The documents themselves stay with LSP to keep them private.</span></Card>
      <Card title="Contact"><span className="small">LSP is your tenant's contact for rent, repairs and visits. Use “Ask LSP about this tenancy” and {adminName(s, p.admin)} will reply.</span></Card>
    </div>}
    {tab === 'rent' && <Card title="Rent" sub="What LSP recorded from the bank. Part payments carry forward.">
      {r ? <><KV rows={[['Month', r.month], ['Due', r.due], ['Rent', money(r.amount)], ['Received', money(r.paid)], ['Still owed', r.amount > r.paid ? money(r.amount - r.paid) : '—'], ['Status', rentStatus(r).label]]} />
        {r.history.length > 0 && <Timeline items={r.history.map(h => ({ at: h.date, text: `${money(h.amount)} received · ${h.note}` }))} />}
        {r.reminders.length > 0 && <Note>LSP sent {r.reminders.length} reminder{r.reminders.length > 1 ? 's' : ''}. Last one {r.reminders[r.reminders.length - 1].at}.</Note>}</> : <Empty icon={<PoundSterling size={22} />}>No rent recorded yet.</Empty>}
      <Btn kind="ghost" onClick={() => s.go('rent')}>See your statements</Btn>
    </Card>}
    {tab === 'issues' && <Card title="Repairs reported by this tenant"><MiniJobList jobs={issues} empty="Nothing reported." />{issues.some(j => !DONE_JOB.includes(j.status)) && <span className="caption">LSP keeps the tenant updated.</span>}</Card>}
    {tab === 'documents' && <Card title="Documents" sub="Tenancy agreement, deposit certificate and inspection reports."><DocTable list={docs} hideHome /></Card>}
    {ask && <AskModal title="Ask LSP about this tenancy" about={`Question about ${t.name}'s tenancy at ${p.address}`} onClose={() => setAsk(false)} />}
  </>;
}
