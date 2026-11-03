import { useState } from 'react';
import { Home, KeyRound, Wrench, ShieldCheck, ClipboardCheck, FileText, PoundSterling, MessageSquare, Download, Building2, CheckCircle2 } from 'lucide-react';
import { useStore, useLookups, money, rentStatus } from '../store';
import { CERT_KINDS, daysFrom, parseDate, type Property } from '../data';
import { Btn, Card, Chip, Empty, KV, Kpi, Note, PageTabs, Stat, When, Timeline, FilterBar, applyFlt, useFlt, yearsOf } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { DONE_JOB, homeType, managedHomes, leasedHomes, adminName, certTone, certLabel, InspectionModal, PlanModal, AskModal, needsMe, MiniJobList, statements } from './lib';
import { RepairTable } from './Repairs';
import { CertTable } from './Safety';
import { DocTable, docsFor } from './Documents';
import { leaseState, LeasePayTable } from './Rent';
import { feeOf, isLeased, LSP_NAME, pctText } from '../pricing';

export function Properties() {
  const s = useStore();
  if (s.detail && s.properties.some(p => p.id === s.detail)) return <PropertyPage id={s.detail} />;
  return <PropertyList />;
}

function HomeCard({ p }: { p: Property }) {
  const s = useStore();
  const open = s.jobs.filter(j => j.property === p.id && !DONE_JOB.includes(j.status)).length;
  const certs = s.safety.filter(c => c.property === p.id); const bad = certs.filter(c => ['Overdue', 'Missing'].includes(c.status)).length; const soon = certs.filter(c => ['Due soon', 'Booked'].includes(c.status) && c.days <= 30).length;
  const t = s.tenants.find(x => x.property === p.id && x.status !== 'Moved out'); const r = t ? s.rent.find(x => x.tenant === t.id) : undefined;
  const leased = isLeased(p);
  return <button className="kcard pcard" onClick={() => s.go('properties', p.id)}>
    <div className="photo" style={{ height: 140, backgroundImage: `url(${p.photo})` }}><span className="flex" style={{ gap: 6 }}>{leased && <Chip tone="brand" dot={false}>Leased to LSP</Chip>}<Chip tone={p.status === 'Let' ? 'ok' : 'warn'}>{p.status}</Chip></span></div>
    <div className="stack"><b style={{ fontSize: 14 }}>{p.address}</b><span className="caption">{p.area} · {homeType(p)}</span></div>
    <div className="flex between"><span className="small">{leased ? 'Leased to LSP' : t ? t.name : 'No tenant'}</span><b style={{ color: 'var(--text-brand)' }}>{money(leased ? p.lease!.rent : p.rent)}<span className="caption"> {leased ? 'to you' : 'pcm'}</span></b></div>
    <div className="pstats">
      <span><Wrench size={13} />{open ? `${open} open repair${open > 1 ? 's' : ''}` : 'No open repairs'}</span>
      <span className={bad ? 'bad' : soon ? 'soon' : 'good'}><ShieldCheck size={13} />{bad ? `${bad} safety issue${bad > 1 ? 's' : ''}` : soon ? `${soon} ending soon` : 'Safety in date'}</span>
      {!leased && r && <span className={rentStatus(r).tone === 'err' ? 'bad' : rentStatus(r).tone === 'ok' ? 'good' : 'soon'}><PoundSterling size={13} />Rent {rentStatus(r).label.toLowerCase()}</span>}
      {leased && <span><KeyRound size={13} />Lease to {p.lease!.end}</span>}
    </div>
  </button>;
}

function PropertyList() {
  const s = useStore();
  const [tab, setTab] = useState<'all' | 'managed' | 'leased'>('all');
  const managed = managedHomes(s); const leased = leasedHomes(s);
  const list = tab === 'managed' ? managed : tab === 'leased' ? leased : [...managed, ...leased];
  const certs = s.safety; const st = statements(s)[0];
  return <>
    <PageHeader crumbs={crumbsFor('properties', s.go)} title="Properties" action={<Btn kind="outline" icon={<Wrench size={18} />} onClick={() => s.go('repairs', 'new')}>Report a repair</Btn>} />
    <div className="grid g4">
      <Kpi icon={<Home size={18} />} tone="brand" label="Managed by LSP" value={managed.length} caption={`${s.me.plan}% plan`} active={tab === 'managed'} onClick={() => setTab('managed')} />
      <Kpi icon={<KeyRound size={18} />} tone="info" label="Leased to LSP" value={leased.length} caption="LSP pays you lease rent" active={tab === 'leased'} onClick={() => setTab('leased')} />
      <Kpi icon={<PoundSterling size={18} />} tone="ok" label="Rent this month" value={money(st?.received ?? 0)} caption={`of ${money(st?.due ?? 0)} due · managed homes`} onClick={() => s.go('rent')} />
      <Kpi icon={<ShieldCheck size={18} />} tone={certs.some(c => ['Overdue', 'Missing'].includes(c.status)) ? 'err' : 'ok'} label="Safety" value={`${certs.filter(c => c.status === 'Valid' || c.status === 'Booked').length} of ${certs.length}`} caption="certificates in date" onClick={() => s.go('safety')} />
    </div>
    <Card title="Your homes" sub="Click a home for its tenancy, repairs, safety checks, inspections, rent and documents." action={<PageTabs value={tab} onChange={setTab} items={[{ id: 'all', label: 'All', count: managed.length + leased.length }, { id: 'managed', label: 'Managed', count: managed.length }, { id: 'leased', label: 'Leased to LSP', count: leased.length }]} />}>
      <div className="grid g3">{list.map(p => <HomeCard key={p.id} p={p} />)}</div>
      {!list.length && <Empty icon={<Home size={22} />}>No homes here.</Empty>}
    </Card>
  </>;
}

type PTab = 'overview' | 'tenancy' | 'repairs' | 'safety' | 'inspections' | 'rent' | 'lease' | 'payments' | 'documents' | 'history';
function PropertyPage({ id }: { id: string }) {
  const s = useStore(); const L = useLookups(); const p = s.properties.find(x => x.id === id)!; const leased = isLeased(p);
  const [tab, setTab] = useState<PTab>('overview'); const [m, setM] = useState<'' | 'plan' | 'ask' | string>('');
  const tenants = s.tenants.filter(t => t.property === id && t.status !== 'Moved out');
  const jobs = s.jobs.filter(j => j.property === id); const open = jobs.filter(j => !DONE_JOB.includes(j.status));
  const certs = s.safety.filter(c => c.property === id).sort((a, b) => a.days - b.days);
  const insp = s.inspections.filter(i => i.property === id).sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
  const upcoming = insp.filter(i => i.status !== 'Locked' && daysFrom(i.date) >= 0).sort((a, b) => daysFrom(a.date) - daysFrom(b.date));
  const okCerts = certs.filter(c => c.status === 'Valid' || c.status === 'Booked').length;
  const pays = s.leasePays.filter(x => x.property === id); const owed = pays.filter(x => daysFrom(x.due) <= 0).reduce((a, x) => a + x.amount - x.paid, 0);
  const docs = docsFor(s, L, id);
  const tabs: { id: PTab; label: string; count?: number }[] = leased
    ? [{ id: 'overview', label: 'Overview' }, { id: 'lease', label: 'Lease' }, { id: 'payments', label: 'Lease payments', count: pays.length }, { id: 'repairs', label: 'Owner repairs', count: jobs.length }, { id: 'safety', label: 'Safety checks', count: certs.length }, { id: 'documents', label: 'Documents', count: docs.length }, { id: 'history', label: 'History' }]
    : [{ id: 'overview', label: 'Overview' }, { id: 'tenancy', label: 'Tenancy', count: tenants.length }, { id: 'repairs', label: 'Repairs', count: jobs.length }, { id: 'safety', label: 'Safety checks', count: certs.length }, { id: 'inspections', label: 'Inspections', count: insp.length }, { id: 'rent', label: 'Rent' }, { id: 'documents', label: 'Documents', count: docs.length }, { id: 'history', label: 'History' }];
  const f = feeOf(p.rent, s.me.plan, s.vat);
  const insp1 = typeof m === 'string' && m.startsWith('I') ? s.inspections.find(i => i.id === m) : undefined;
  return <>
    <PageHeader crumbs={crumbsFor('properties', s.go, p.address)} back={() => s.go('properties')} title={p.address}
      action={<div className="flex"><Btn kind="ghost" icon={<MessageSquare size={16} />} onClick={() => setM('ask')}>Ask LSP</Btn><Btn kind="outline" icon={<FileText size={16} />} onClick={() => setM('plan')}>Property plan</Btn><Btn icon={<Wrench size={16} />} onClick={() => s.go('repairs', 'new')}>{leased ? 'Report an owner repair' : 'Report a repair'}</Btn></div>} />
    <section className="card phero">
      <div className="photo" style={{ backgroundImage: `url(${p.photo})` }} />
      <div className="stack grow" style={{ gap: 12 }}>
        <div className="flex wrap" style={{ gap: 10 }}><h2 className="dtitle">{p.address}</h2>{leased && <Chip tone="brand" dot={false}><KeyRound size={12} /> Leased to LSP</Chip>}<Chip tone={p.status === 'Let' ? 'ok' : 'warn'}>{p.status}</Chip></div>
        <span className="small">{p.area}</span>
        <div className="dmeta">{(leased
          ? [['Arrangement', `Leased to ${LSP_NAME}`], ['Landlord to the occupiers', 'LSP'], ['Lease rent to you', `${money(p.lease!.rent)} ${p.lease!.frequency.toLowerCase()}`], ['Lease', `${p.lease!.start} to ${p.lease!.end}`], ['Office Admin', adminName(s, p.admin)]]
          : [['Type', homeType(p)], ['Rent', money(p.rent) + ' pcm'], ['Plan', `${s.me.plan}% · fee ${money(f.net)} a month`], ['Office Admin', adminName(s, p.admin)], ['With LSP since', p.added]]).map(([k, v]) => <div key={k}><span className="caption">{k}</span><b>{v}</b></div>)}</div>
        <div className="grid g4" style={{ gap: 12 }}>
          {leased ? <Stat label="Owed to you by LSP" value={money(owed)} tone={owed ? 'warn' : 'ok'} sub={owed ? 'LSP pays it whatever the tenant pays' : 'all paid'} /> : <Stat label="Tenant" value={tenants[0]?.name ?? 'Empty'} tone={tenants.length ? 'ok' : 'warn'} sub={tenants[0] ? `until ${tenants[0].end}` : undefined} />}
          <Stat label={leased ? 'Owner repairs' : 'Open repairs'} value={open.length} tone={open.some(needsMe) ? 'warn' : open.length ? 'info' : 'ok'} sub={open.some(needsMe) ? 'one needs you' : undefined} />
          <Stat label="Safety" value={`${okCerts} of ${certs.length} in date`} tone={certs.some(c => ['Overdue', 'Missing'].includes(c.status)) ? 'err' : okCerts < certs.length ? 'warn' : 'ok'} />
          {leased ? <Stat label="Lease ends" value={p.lease!.end} sub={`Break ${p.lease!.breakDate}`} /> : <Stat label="Next inspection" value={upcoming[0] ? upcoming[0].date.replace(' 2026', '') : 'None booked'} sub={upcoming[0]?.kind} />}
        </div>
      </div>
    </section>
    <PageTabs value={tab} onChange={setTab} items={tabs} />

    {tab === 'overview' && !leased && <div className="grid g2">
      <Card title="Tenancy" action={<Btn sm kind="ghost" onClick={() => setTab('tenancy')}>Open</Btn>}>{tenants.length ? tenants.map(t => { const r = s.rent.find(x => x.tenant === t.id); return <button key={t.id} className="item click" style={{ padding: 0 }} onClick={() => s.go('tenants', t.id)}><span className="tile t-ok"><Home size={16} /></span><div className="stack grow"><b>{t.name}</b><span className="caption">{t.start} to {t.end} · {money(t.rent)} pcm</span></div>{r && <Chip tone={rentStatus(r).tone}>{rentStatus(r).label}</Chip>}</button>; }) : <Note>No tenant at the moment. LSP is finding one.</Note>}</Card>
      <Card title="Fee and maintenance" sub="What you pay LSP for this home each month.">
        <div className="feebox">
          <div><span>Monthly rent</span><b>{money(p.rent)}</b></div>
          <div><span>LSP fee · {s.me.plan}%</span><b>{money(f.net)}</b></div>
          <div className={f.on ? 'vat' : 'muted2'}><span>VAT · {f.on ? `${f.rate}%` : 'not charged'}</span><b>{money(f.on ? f.vat : 0)}</b></div>
          <div className="tot"><span>You pay LSP</span><b>{money(f.total)}<em>{f.on ? ` · ${pctText(f.incl)} incl. VAT` : ''}</em></b></div>
        </div>
        <span className="caption">Repairs under {money(200)} are covered by your plan and use your maintenance allowance. <button className="link" onClick={() => s.go('plan')}>See my plan</button></span>
      </Card>
      <Card title="Open repairs" action={<Btn sm kind="ghost" onClick={() => setTab('repairs')}>See all {jobs.length}</Btn>}><MiniJobList jobs={open} empty="No open repairs." /></Card>
      <Card title="Safety checks" action={<Btn sm kind="ghost" onClick={() => setTab('safety')}>Open</Btn>}><div className="certgrid">{CERT_KINDS.filter(k => certs.some(c => c.kind === k)).map(k => { const c = certs.find(x => x.kind === k)!; return <button key={k} className={`certcell c-${certTone(c.status)}`} onClick={() => s.go('safety', c.id)}><b>{k}</b><span>{c.status === 'Missing' ? 'No certificate' : 'Ends ' + c.expires}</span><Chip tone={certTone(c.status)}>{certLabel(c)}</Chip></button>; })}</div></Card>
    </div>}
    {tab === 'overview' && leased && <div className="grid g2">
      <Card title="Lease to LSP" sub={`${LSP_NAME} rents this home from you and is the landlord to the people living there. There is no management fee.`}>
        <div className="feebox">
          <div><span>Lease rent to you</span><b>{money(p.lease!.rent)}</b></div>
          <div className="muted2"><span>Management fee</span><b>Not applicable · leased to LSP</b></div>
          <div className="tot"><span>Paid on day {p.lease!.dueDay} each month to</span><b>{p.lease!.payTo}</b></div>
        </div>
        <span className="caption">LSP pays you whatever the occupiers pay LSP. Their details stay with LSP.</span>
      </Card>
      <Card title="Lease payments" action={<Btn sm kind="ghost" onClick={() => setTab('payments')}>All {pays.length}</Btn>}>
        <div className="divlist">{[...pays].reverse().slice(0, 3).map(x => <div key={x.id} className="item"><span className="tile t-brand" style={{ width: 32, height: 32 }}><PoundSterling size={15} /></span><div className="stack grow"><b>{x.month} · {money(x.amount)}</b><span className="caption">Due {x.due}{x.paid ? ` · ${money(x.paid)} paid` : ''}</span></div><Chip tone={leaseState(x).tone}>{leaseState(x).label}</Chip></div>)}</div>
      </Card>
      <Card title="Who is responsible"><KV rows={[['You (owner)', p.lease!.ownerDoes], ['LSP', p.lease!.lspDoes]]} /><span className="caption">LSP asks you before any owner repair. <button className="link" onClick={() => setTab('repairs')}>Owner repairs</button></span></Card>
      <Card title="Safety checks" sub="LSP keeps these in date as the landlord to the occupiers."><div className="certgrid">{certs.map(c => <button key={c.id} className={`certcell c-${certTone(c.status)}`} onClick={() => s.go('safety', c.id)}><b>{c.kind}</b><span>Ends {c.expires}</span><Chip tone={certTone(c.status)}>{certLabel(c)}</Chip></button>)}</div></Card>
    </div>}

    {tab === 'tenancy' && <TenancyTab p={p} />}
    {tab === 'repairs' && <Card title={leased ? 'Owner repairs' : 'Repairs'} sub={leased ? `Only work that is yours under the lease (${p.lease!.ownerDoes.toLowerCase()}). LSP handles everything else.` : 'Everything reported for this home, with the cost and where it is.'}><RepairTable list={jobs} hideHome /></Card>}
    {tab === 'safety' && <Card title="Safety checks" sub="Certificates for this home. LSP books renewals and checks the evidence before marking them done."><CertTable list={certs} hideHome /></Card>}
    {tab === 'inspections' && <Card title="Inspections" sub="Move-in, routine and move-out reports. Finished reports are checked and locked by LSP.">
      <InspList list={insp} onOpen={x => setM(x)} /></Card>}
    {tab === 'rent' && <RentTab p={p} />}
    {tab === 'lease' && <LeaseInfo p={p} />}
    {tab === 'payments' && <Card title="Lease payments from LSP" sub="LSP pays the lease rent on its own schedule, whatever the occupiers pay. Part payments carry forward."><LeasePayTable list={pays} /></Card>}
    {tab === 'documents' && <Card title="Documents" sub="Everything for this home. Search, filter by type or year, and download."><DocTable list={docs} hideHome /></Card>}
    {tab === 'history' && <HomeHistory p={p} />}
    {m === 'plan' && <PlanModal p={p} onClose={() => setM('')} />}
    {m === 'ask' && <AskModal title="Ask LSP about this home" about={`Question about ${p.address}`} onClose={() => setM('')} />}
    {insp1 && <InspectionModal i={insp1} onClose={() => setM('')} />}
  </>;
}

export function InspList({ list, onOpen, hideHome }: { list: ReturnType<typeof useStore>['inspections']; onOpen: (id: string) => void; hideHome?: boolean }) {
  const L = useLookups(); const [f, setF] = useFlt();
  const rows = applyFlt(list, f, { text: i => `${i.kind} ${i.summary ?? ''} ${L.prop(i.property)?.address ?? ''}`, type: i => i.kind, date: i => i.date });
  return <>{list.length > 2 && <FilterBar f={f} set={setF} placeholder="Search inspections" types={[...new Set(list.map(i => i.kind))]} typeLabel="All inspection types" years={yearsOf(list, i => i.date)} shown={rows.length} total={list.length} />}
    <div className="tablewrap"><table className="t"><thead><tr><th>Inspection</th>{!hideHome && <th>Home</th>}<th>Date</th><th>Inspector</th><th>Result</th><th /></tr></thead><tbody>
      {rows.map(i => <tr key={i.id} onClick={() => onOpen(i.id)}><td><span className="cell"><span className="tile t-info" style={{ width: 32, height: 32 }}><ClipboardCheck size={15} /></span><span className="stack"><b className="strong">{i.kind}</b><span className="caption">{i.scope}{i.room ? ' · ' + i.room : ''}</span></span></span></td>{!hideHome && <td>{L.prop(i.property)?.address}</td>}<td><When at={i.doneAt ?? `${i.date}, ${i.time}`} /></td><td>{L.contractor(i.inspector)?.name ?? 'Being booked'}</td>
        <td>{i.status === 'Locked' ? <Chip tone="ok">Checked · locked</Chip> : <Chip tone="info">Booked</Chip>}</td><td style={{ textAlign: 'right' }}><Btn sm kind="ghost">{i.status === 'Locked' ? 'View report' : 'Details'}</Btn></td></tr>)}
    </tbody></table>{!rows.length && <Empty icon={<ClipboardCheck size={22} />}>No inspections.</Empty>}</div></>;
}

function TenancyTab({ p }: { p: Property }) {
  const s = useStore(); const tenants = s.tenants.filter(t => t.property === p.id);
  return <div className="grid g2">{tenants.map(t => { const r = s.rent.find(x => x.tenant === t.id); return <Card key={t.id} title={t.name} sub={t.status === 'Live' ? 'Living here now' : t.status} action={<Btn sm kind="ghost" onClick={() => s.go('tenants', t.id)}>Open</Btn>}>
    <KV rows={[['Tenancy', `${t.start} to ${t.end}`], ['Rent', `${money(t.rent)} a month, due on day ${t.rentDay}`], ['This month', r ? `${money(r.paid)} of ${money(r.amount)} · ${rentStatus(r).label}` : '—'], ['Deposit', `${money(t.deposit)} · protected with ${t.depositScheme}`], ['Deposit reference', t.depositRef], ['Agreement', 'Signed by everyone · in Documents']]} />
  </Card>; })}{!tenants.length && <Card><Note>No tenant at the moment. LSP is finding one and will tell you when someone is approved.</Note></Card>}</div>;
}

function RentTab({ p }: { p: Property }) {
  const s = useStore(); const rows = statements(s).map(st => ({ st, row: st.rows.find(r => r.home.id === p.id) })).filter(x => x.row);
  const [f, setF] = useFlt(); const list = applyFlt(rows, f, { text: x => x.st.month, date: x => '1 ' + x.st.month });
  return <Card title="Rent for this home" sub="What was due and what LSP received each month. Your full statement covers all your homes." action={<Btn sm kind="ghost" onClick={() => s.go('rent')}>Statements</Btn>}>
    <FilterBar f={f} set={setF} search={false} years={yearsOf(rows, x => '1 ' + x.st.month)} />
    <div className="tablewrap"><table className="t"><thead><tr><th>Month</th><th>Tenant</th><th>Due</th><th>Received</th><th>Owed</th><th>Paid to you</th></tr></thead><tbody>
      {list.map(({ st, row }) => <tr key={st.key} onClick={() => s.go('rent', st.key)}><td><b className="strong">{st.month}</b></td><td>{row!.tenant}</td><td>{money(row!.due)}</td><td>{money(row!.received)}</td><td>{row!.due > row!.received ? <b style={{ color: 'var(--err)' }}>{money(row!.due - row!.received)}</b> : '—'}</td><td><Chip tone={st.paid ? 'ok' : 'info'}>{st.paid ? `Paid ${st.payDate.replace(' 2026', '')}` : `Due ${st.payDate.replace(' 2026', '')}`}</Chip></td></tr>)}
    </tbody></table></div>
  </Card>;
}

function LeaseInfo({ p }: { p: Property }) {
  const s = useStore(); const ls = p.lease!;
  return <div className="grid g2">
    <Card title="Lease terms" sub={`Reference ${ls.ref}`}><KV rows={[['Start and end', `${ls.start} to ${ls.end}`], ['Rent review', ls.review], ['Break date', ls.breakDate], ['Notice', ls.notice], ['Lease rent', `${money(ls.rent)} ${ls.frequency.toLowerCase()}, due on day ${ls.dueDay}`], ['Paid to', ls.payTo], ['Permitted use', ls.use], ['Subletting', ls.sublet]]} /></Card>
    <div className="col">
      <Card title="Who is responsible"><KV rows={[['You (owner)', ls.ownerDoes], ['LSP', ls.lspDoes]]} /><Note>LSP is the landlord to the occupiers. Their names, contact details and rent stay with LSP.</Note></Card>
      <Card title="Signed lease">{ls.doc ? <div className="lrow"><FileText size={18} color="var(--text-brand)" /><div className="stack grow"><b>{ls.doc}</b><span className="caption">Signed by you and LSP · started {ls.start}</span></div><Btn sm kind="ghost" icon={<Download size={14} />} onClick={() => { s.log(`Downloaded the signed lease for ${p.address}`, 'Documents'); s.toast('Download started'); }}>PDF</Btn></div> : <Empty icon={<FileText size={22} />}>No signed lease on file yet.</Empty>}</Card>
      <Card title="Maintenance" sub="LSP sets a budget for day-to-day repairs as part of the lease. It is LSP's, not yours."><span className="small"><Building2 size={14} style={{ verticalAlign: -2 }} /> Roof and structure repairs come to you to approve in “Needs my approval”.</span></Card>
    </div>
  </div>;
}

function HomeHistory({ p }: { p: Property }) {
  const s = useStore(); const [f, setF] = useFlt();
  const all = [
    ...s.jobs.filter(j => j.property === p.id).flatMap(j => j.events.map(e => ({ at: e.at, text: `${j.title}: ${e.text}`, by: e.by }))),
    ...s.safety.filter(c => c.property === p.id && c.issued).map(c => ({ at: c.issued!, text: `${c.kind} certificate done, ends ${c.expires}`, by: s.contractors.find(x => x.id === c.contractor)?.name ?? 'LSP' })),
    ...s.inspections.filter(i => i.property === p.id && i.doneAt).map(i => ({ at: i.doneAt!, text: `${i.kind} inspection done and locked`, by: s.contractors.find(x => x.id === i.inspector)?.name ?? 'LSP' })),
    ...s.tenants.filter(t => t.property === p.id).map(t => ({ at: t.start, text: `${t.name} moved in`, by: 'LSP' })),
    { at: p.added, text: isLeased(p) ? `Leased to LSP (${p.lease!.ref})` : `Joined LSP on the ${s.me.plan}% plan`, by: 'LSP' },
  ].sort((a, b) => parseDate(b.at).getTime() - parseDate(a.at).getTime());
  const list = applyFlt(all, f, { text: x => `${x.text} ${x.by}`, date: x => x.at });
  return <Card title="History" sub="Everything that happened at this home, with the date and time. Nothing is deleted.">
    <FilterBar f={f} set={setF} placeholder="Search history" years={yearsOf(all, x => x.at)} shown={list.length} total={all.length} />
    <Timeline items={list} />{!list.length && <Empty icon={<CheckCircle2 size={22} />}>Nothing matches.</Empty>}
  </Card>;
}
