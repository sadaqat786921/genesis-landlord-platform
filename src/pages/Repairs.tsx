import { useRef, useState } from 'react';
import { Plus, Wrench, Clock, CheckCircle2, AlertTriangle, MessageSquare, FileText, Upload, ArrowRight, Receipt, Image as ImageIcon, KeyRound } from 'lucide-react';
import { useStore, useLookups, money } from '../store';
import { ME_NAME, LSP_PHONE, nowStamp, type Job } from '../data';
import { ActionCard, Btn, Card, Chip, DetailHead, Empty, Field, HSteps, KV, Kpi, Note, Select, Tabs, Text, Area, Timeline, FilterBar, applyFlt, useFlt, yearsOf, When } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { DONE_JOB, jobView, needsMe, yourStep, STEPS_A, STEPS_B, stepAt, whyMe, limitOf, adminName, JobReportModal, InvoiceModal, AskModal, invoiceView, homeType, coverOf } from './lib';
import { isLeased } from '../pricing';

export function Repairs() {
  const s = useStore();
  if (s.detail === 'new') return <ReportRepair />;
  if (s.detail && s.jobs.some(j => j.id === s.detail)) return <RepairPage id={s.detail} />;
  return <RepairList />;
}

/** The repair table, used here and on each property page. Search, type of work and year. */
export function RepairTable({ list: all, hideHome }: { list: Job[]; hideHome?: boolean }) {
  const s = useStore(); const L = useLookups(); const [f, setF] = useFlt();
  const list = applyFlt(all, f, { text: j => `${j.title} ${j.category} ${j.by} ${L.prop(j.property)?.address ?? ''} ${jobView(j).label}`, type: j => j.category, date: j => j.reported });
  return <>{all.length > 2 && <FilterBar f={f} set={setF} placeholder="Search repairs" types={[...new Set(all.map(j => j.category))].sort()} typeLabel="All types of work" years={yearsOf(all, j => j.reported)} shown={list.length} total={all.length} />}
    <div className="tablewrap"><table className="t"><thead><tr><th>Repair</th>{!hideHome && <th>Home</th>}<th>Reported</th><th>Cost</th><th>Status</th><th /></tr></thead><tbody>
      {list.map(j => { const v = jobView(j); return <tr key={j.id} onClick={() => s.go(needsMe(j) ? 'approvals' : 'repairs', j.id)}>
        <td><span className="cell"><span className={`tile ${needsMe(j) ? 't-warn' : j.urgent && !DONE_JOB.includes(j.status) ? 't-err' : 't-info'}`} style={{ width: 32, height: 32 }}>{j.ownerRepair ? <KeyRound size={15} /> : <Wrench size={15} />}</span><span className="stack"><b className="strong">{j.title}</b><span className="caption">{j.category}{j.area ? ' · ' + j.area : ''} · {j.by}</span></span></span></td>
        {!hideHome && <td>{L.prop(j.property)?.address}</td>}
        <td><When at={j.reported} /></td>
        <td>{j.price ? <span className="stack"><b>{money(j.price)}</b><span className="caption">{j.status === 'Waiting approval' ? 'LSP deciding' : !coverOf(s, j).pays ? 'Covered by your plan' : coverOf(s, j).covered ? `You pay ${money(coverOf(s, j).pays)}` : 'Paid by you'}</span></span> : <span className="muted">Being priced</span>}</td>
        <td><Chip tone={v.tone}>{v.label}</Chip></td>
        <td style={{ textAlign: 'right' }}>{needsMe(j) ? <Btn sm>Review</Btn> : <ArrowRight size={16} color="#98A2B3" />}</td></tr>; })}
    </tbody></table>{!list.length && <Empty icon={<Wrench size={22} />}>No repairs here.</Empty>}</div></>;
}

function RepairList() {
  const s = useStore();
  const [tab, setTab] = useState<'open' | 'you' | 'done' | 'all'>('open');
  const J = s.jobs;
  const list = J.filter(j => tab === 'all' ? true : tab === 'you' ? needsMe(j) : tab === 'done' ? DONE_JOB.includes(j.status) : !DONE_JOB.includes(j.status));
  return <>
    <PageHeader crumbs={crumbsFor('repairs', s.go)} title="Repairs" action={<Btn icon={<Plus size={18} />} onClick={() => s.go('repairs', 'new')}>Report a repair</Btn>} />
    <div className="grid g4">
      <Kpi icon={<Wrench size={18} />} tone="info" label="Under way" value={J.filter(j => !DONE_JOB.includes(j.status) && !needsMe(j)).length} caption="LSP is handling them" active={tab === 'open'} onClick={() => setTab('open')} />
      <Kpi icon={<Clock size={18} />} tone="warn" label="Needs your approval" value={J.filter(needsMe).length} caption="over your job limit" active={tab === 'you'} onClick={() => setTab('you')} />
      <Kpi icon={<CheckCircle2 size={18} />} tone="ok" label="Finished" value={J.filter(j => ['Approved', 'Invoiced'].includes(j.status)).length} caption="with photo proof" active={tab === 'done'} onClick={() => setTab('done')} />
      <Kpi icon={<AlertTriangle size={18} />} tone="err" label="Emergencies" value={J.filter(j => j.urgent && !DONE_JOB.includes(j.status)).length} caption={`call ${LSP_PHONE}`} />
    </div>
    <Card title="Your repairs" sub={`Repairs under ${money(limitOf(s))} are covered by your ${s.me.plan}% plan and LSP gets them approved. Over that, LSP asks you first.`} action={<Tabs value={tab} onChange={setTab} items={[{ id: 'open', label: 'Open' }, { id: 'you', label: 'Needs you', count: J.filter(needsMe).length }, { id: 'done', label: 'Finished' }, { id: 'all', label: 'All', count: J.length }]} />}>
      <RepairTable list={list} />
    </Card>
  </>;
}

/* ---------------- report a repair ---------------- */
function ReportRepair() {
  const s = useStore(); const L = useLookups();
  const homes = s.properties;
  const [f, setF] = useState({ property: homes.find(p => !isLeased(p))?.id ?? homes[0].id, area: '', title: '', category: 'General' as Job['category'], note: '', urgency: 'Routine', access: 'Please arrange it with the tenant', phone: s.me.phone });
  const [photos, setPhotos] = useState<string[]>([]); const ref = useRef<HTMLInputElement>(null);
  const p = L.prop(f.property)!; const leased = isLeased(p);
  const submit = () => {
    const id = 'J' + (Date.now() % 100000); const at = nowStamp();
    s.setJobs(js => [{ id, title: f.title, property: f.property, managed: true, cost: 0, price: 0, status: 'New', urgent: f.urgency === 'Emergency', reported: at, by: `Landlord · ${ME_NAME}`, admin: p.admin, category: f.category, note: f.note.trim() || undefined, area: f.area || undefined, access: f.access, photos, ownerRepair: leased || undefined, comms: [],
      events: [{ at, by: ME_NAME, text: `Reported from the landlord portal${f.urgency !== 'Routine' ? ` as ${f.urgency.toLowerCase()}` : ''}${photos.length ? ` with ${photos.length} photo${photos.length > 1 ? 's' : ''}` : ''}` }] }, ...js]);
    s.log(`Reported a repair: ${f.title} at ${p.address}`, 'Repairs');
    s.toast(`Sent to ${adminName(s, p.admin)} at LSP`); s.go('repairs', id);
  };
  return <>
    <PageHeader crumbs={crumbsFor('repairs', s.go, 'Report a repair')} back={() => s.go('repairs')} title="Report a repair" />
    <div className="dgrid">
      <Card title="What needs fixing" sub="LSP checks it, gets a price and tells you what happens next. Your tenant can also report repairs from their own portal.">
        <div className="grid g2">
          <Field label="Home"><Select value={f.property} onChange={v => setF({ ...f, property: v })} options={homes.map(h => ({ value: h.id, label: `${h.address}${isLeased(h) ? ' (leased to LSP)' : ''}` }))} /></Field>
          <Field label="Room or area"><Text value={f.area} onChange={v => setF({ ...f, area: v })} placeholder="e.g. Kitchen, front garden" /></Field>
        </div>
        {leased && <Note>This home is leased to LSP. LSP handles day-to-day repairs. Report only work that is yours under the lease: {p.lease!.ownerDoes.toLowerCase()}.</Note>}
        <Field label="What is wrong"><Text value={f.title} onChange={v => setF({ ...f, title: v })} placeholder="e.g. Back door lock is stiff" /></Field>
        <div className="grid g2">
          <Field label="Type of work"><Select value={f.category} onChange={v => setF({ ...f, category: v as Job['category'] })} options={(['Plumbing', 'Heating', 'Electrical', 'Roofing', 'Locks & doors', 'Damp', 'General'] as const).map(x => ({ value: x, label: x }))} /></Field>
          <Field label="How urgent"><Select value={f.urgency} onChange={v => setF({ ...f, urgency: v })} options={[{ value: 'Routine', label: 'Routine · within 28 days' }, { value: 'Urgent', label: 'Urgent · within 7 days' }, { value: 'Emergency', label: 'Emergency · today (no heat, water, unsafe)' }]} /></Field>
        </div>
        {f.urgency === 'Emergency' && <Note tone="err">For an emergency, also call LSP now on {LSP_PHONE}.</Note>}
        <Field label="Details"><Area value={f.note} onChange={v => setF({ ...f, note: v })} placeholder="What you saw, when it started, anything already tried" /></Field>
        <div className="grid g2">
          <Field label="Access"><Select value={f.access} onChange={v => setF({ ...f, access: v })} options={['Please arrange it with the tenant', 'I will let the contractor in', 'Key held by LSP'].map(x => ({ value: x, label: x }))} /></Field>
          <Field label="Your phone for questions"><Text value={f.phone} onChange={v => setF({ ...f, phone: v })} /></Field>
        </div>
        <Field label="Photos or documents"><div className="flex wrap">{photos.map(x => <Chip key={x} tone="neutral" dot={false}>{x}</Chip>)}<Btn sm kind="outline" icon={<Upload size={14} />} onClick={() => ref.current?.click()}>Add photos</Btn></div></Field>
        <input ref={ref} type="file" accept="image/*,.pdf" multiple hidden aria-label="Photos" onChange={e => { const fs = Array.from(e.target.files ?? []); if (fs.length) setPhotos(ps => [...ps, ...fs.map(x => x.name.replace(/\.[^.]+$/, ''))]); }} />
        <div className="flex" style={{ justifyContent: 'flex-end' }}><Btn kind="outline" onClick={() => s.go('repairs')}>Cancel</Btn><Btn icon={<Wrench size={16} />} disabled={!f.title.trim()} onClick={submit}>Send to LSP</Btn></div>
      </Card>
      <div className="col">
        <ActionCard title="What happens next" text={<span className="stack" style={{ gap: 8, fontWeight: 600 }}><span>1. {adminName(s, p.admin)} checks it and gets a price.</span><span>2. Under {money(limitOf(s))}: covered by your plan. Your Office Admin approves it and books the contractor.</span><span>3. Over {money(limitOf(s))}: LSP's Supervisor covers it under your plan, or sends you a quote first showing what your plan covers and what you pay.</span><span>4. A contractor does the work and uploads photos.</span><span>5. LSP checks the photos. You can see them here.</span></span>} />
        <Card title="Home"><div className="flex"><span className="photo" style={{ width: 72, height: 54, borderRadius: 10, flex: 'none', backgroundImage: `url(${p.photo})` }} /><div className="stack"><b>{p.address}</b><span className="caption">{homeType(p)} · {p.area}</span></div></div></Card>
      </div>
    </div>
  </>;
}

/* ---------------- one repair ---------------- */
function RepairPage({ id }: { id: string }) {
  const s = useStore(); const L = useLookups(); const j = s.jobs.find(x => x.id === id)!;
  const p = L.prop(j.property)!; const c = L.contractor(j.contractor); const inv = j.invoice ? s.invoices.find(i => i.id === j.invoice) : undefined;
  const [m, setM] = useState<'' | 'report' | 'inv' | 'ask'>('');
  const mine = yourStep(s, j); const v = jobView(j); const done = DONE_JOB.includes(j.status);
  const next = (() => {
    switch (j.status) {
      case 'New': return `${adminName(s, j.admin)} is checking it and getting a price.`;
      case 'Waiting approval': return `Priced at ${money(j.price)}. That is over your ${money(limitOf(s))} job limit, so LSP's Supervisor decides: cover it under your plan, or send you a quote first.`;
      case 'Landlord approval': return j.landlordAsk ? `Waiting for you to approve quote ${j.quoteNo}. Your plan covers ${money(coverOf(s, j).covered)}, you pay ${money(coverOf(s, j).pays)}.` : `LSP is preparing a quote for you. Your plan covers ${money(coverOf(s, j).covered)}, you pay ${money(coverOf(s, j).pays)}.`;
      case 'Ready to assign': case 'Assigned': return `${c?.name ?? 'A contractor'} has the job. LSP arranges access${j.access ? ` (${j.access.toLowerCase()})` : ''}.`;
      case 'In progress': return `${c?.name} is doing the work. They upload photos when it is finished.`;
      case 'Sent back': return `LSP asked ${c?.name} to put something right before it is signed off.`;
      case 'Proof uploaded': return `${c?.name} has finished. LSP is checking the photos.`;
      case 'Approved': case 'Invoiced': return !coverOf(s, j).pays ? `Finished and checked. Covered by your plan: ${money(j.price)} from your maintenance allowance.` : j.invoice ? `Finished and checked. Invoice ${j.invoice} ${inv ? '· ' + invoiceView(s, inv).label.toLowerCase() : ''}.` : `Finished and checked. LSP sends the invoice for the ${money(coverOf(s, j).pays)} you pay.`;
      default: return j.declined ?? 'Not going ahead.';
    }
  })();
  return <>
    <PageHeader crumbs={crumbsFor('repairs', s.go, j.title)} back={() => s.go('repairs')} title={j.title}
      action={<div className="flex"><Btn kind="ghost" icon={<MessageSquare size={16} />} onClick={() => setM('ask')}>Ask LSP</Btn>{(done || j.proof?.length) && <Btn kind="outline" icon={<FileText size={16} />} onClick={() => setM('report')}>Repair report</Btn>}{needsMe(j) && <Btn icon={<CheckCircle2 size={16} />} onClick={() => s.go('approvals', id)}>Review and approve</Btn>}</div>} />
    <DetailHead media={<span className={`tile ${needsMe(j) ? 't-warn' : j.urgent && !done ? 't-err' : 't-info'}`} style={{ width: 64, height: 64, borderRadius: 18 }}><Wrench size={28} /></span>} title={j.title}
      chips={<><Chip tone={v.tone}>{v.label}</Chip>{j.urgent && <Chip tone="err">Emergency</Chip>}{j.ownerRepair && <Chip tone="brand" dot={false}>Owner repair</Chip>}<Chip tone="neutral" dot={false}>{j.category}</Chip></>}
      meta={[['Home', p.address], ['Reported', j.reported], ['By', j.by], ['Office Admin', adminName(s, j.admin)]]} />
    <Card><HSteps items={mine ? STEPS_B : STEPS_A} at={stepAt(j, mine)} stopped={j.status === 'Declined' ? 'Not going ahead' : undefined} /></Card>
    <div className="dgrid">
      <div className="col">
        {(j.proof?.length || j.status === 'Proof uploaded') && <Card title="Photo proof" sub={j.status === 'Proof uploaded' ? 'Uploaded by the contractor. LSP is checking them.' : 'Checked by LSP and kept with the repair.'}>
          <div className="photos">{(j.proof ?? []).map((x, i) => <div key={x + i} className="ph" style={{ backgroundImage: `url(images/home${(i % 3) + 1}.jpg)` }}><span>{x}</span></div>)}</div></Card>}
        <Card title="What's wrong"><p style={{ margin: 0, lineHeight: 1.6 }}>{j.note ?? 'No details given.'}</p>
          {j.photos?.length ? <div className="photos">{j.photos.map((x, i) => <div key={x} className="ph" style={{ backgroundImage: `url(images/home${((i + 1) % 3) + 1}.jpg)` }}><span>{x}</span></div>)}</div> : null}
          <KV rows={[['Reported by', j.by], ['Reported on', j.reported], ['Room or area', j.area ?? '—'], ['Type of work', j.category], ...(j.access ? [['Access', j.access] as [string, string]] : [])]} /></Card>
        {inv && <Card title="Invoice" sub={invoiceView(s, inv).label}><div className="lrow"><Receipt size={18} color="var(--text-brand)" /><div className="stack grow"><b>{inv.id}</b><span className="caption">{money(inv.amount)} · issued {inv.issued}</span></div><Chip tone={invoiceView(s, inv).tone}>{invoiceView(s, inv).label}</Chip><Btn sm kind="ghost" onClick={() => setM('inv')}>View</Btn></div></Card>}
        <Card title="Repair history" sub="Every step, with the date and time."><Timeline items={[...j.events].reverse().map(e => ({ at: e.at, text: e.text, by: e.by }))} /></Card>
      </div>
      <div className="col">
        <ActionCard tone={needsMe(j) ? 'warn' : done ? (j.status === 'Declined' ? 'neutral' : 'ok') : 'brand'} title={needsMe(j) ? 'Needs your approval' : done ? 'Where it is' : 'What happens next'} text={next}>
          {needsMe(j) && <Btn block icon={<CheckCircle2 size={16} />} onClick={() => s.go('approvals', id)}>Review and approve</Btn>}
          {done && j.status !== 'Declined' && <Btn block kind="outline" icon={<FileText size={16} />} onClick={() => setM('report')}>Download repair report</Btn>}
          <Btn block kind="ghost" icon={<MessageSquare size={16} />} onClick={() => setM('ask')}>Ask LSP about it</Btn>
        </ActionCard>
        <Card title="Cost">{j.price > 0 && j.status !== 'Waiting approval' && <div className="covsplit"><div><span className="caption">Total</span><b>{money(j.price)}</b></div><div className="ok"><span className="caption">Plan covers</span><b>{money(coverOf(s, j).covered)}</b></div><div className="you"><span className="caption">You pay</span><b>{money(coverOf(s, j).pays)}</b></div></div>}<KV rows={[['Cost', j.price ? money(j.price) : 'Being priced'], ['Who pays', !j.price ? '—' : j.status === 'Waiting approval' ? 'LSP\'s Supervisor is deciding' : j.ownerRepair ? 'You, as the owner under the lease' : !coverOf(s, j).pays ? `Covered by your ${s.me.plan}% plan` : `Your plan covers ${money(coverOf(s, j).covered)}, you pay ${money(coverOf(s, j).pays)}`], ...(coverOf(s, j).covered && j.price && j.status !== 'Waiting approval' ? [['Allowance', `${money(coverOf(s, j).covered)} used once, when the work is done`] as [string, string]] : [])]} />
          {mine && needsMe(j) && <span className="caption">{whyMe(s, j)}.</span>}</Card>
        <Card title="Contractor">{c ? <><div className="flex"><span className="tile t-info"><Wrench size={16} /></span><div className="stack grow"><b>{c.name}</b><span className="caption">{c.trade} · checked by LSP, documents in date</span></div></div><span className="caption">LSP talks to the contractor for you. Use “Ask LSP” for anything about the work.</span></> : <span className="caption">LSP chooses a checked contractor once the price is agreed.</span>}</Card>
        <Card title="Home"><button className="item click" style={{ padding: 0 }} onClick={() => s.go('properties', p.id)}><span className="photo" style={{ width: 72, height: 54, borderRadius: 10, flex: 'none', backgroundImage: `url(${p.photo})` }} /><div className="stack grow"><b>{p.address}</b><span className="caption">{homeType(p)}</span></div><ArrowRight size={16} color="#98A2B3" /></button></Card>
      </div>
    </div>
    {m === 'report' && <JobReportModal j={j} onClose={() => setM('')} />}
    {m === 'inv' && inv && <InvoiceModal id={inv.id} onClose={() => setM('')} />}
    {m === 'ask' && <AskModal title="Ask LSP about this repair" about={`Question about ${j.title} at ${p.address}`} onClose={() => setM('')} onSent={t => s.setJobs(js => js.map(x => x.id === id ? { ...x, events: [...x.events, { at: nowStamp(), by: ME_NAME, text: `Asked a question: ${t}` }] } : x))} />}
    {!j.photos?.length && !j.proof?.length && j.status === 'New' && <Card className="flat"><span className="flex small" style={{ gap: 8 }}><ImageIcon size={16} />Photos help LSP price it faster. Send them with “Ask LSP”.</span></Card>}
  </>;
}
