import { Wrench, MessageSquare, PoundSterling, TriangleAlert, ShieldCheck, BadgePercent, CalendarDays, CircleCheck, ArrowRight, Home as HomeIcon, KeyRound, Phone } from 'lucide-react';
import { useStore, useLookups, money, rentStatus } from '../store';
import { daysFrom, ME_NAME, LSP_PHONE } from '../data';
import { Btn, Card, Chip, Kpi, Note, Empty } from '../ui';
import { PageHeader } from '../Shell';
import { needsMe, allowanceOf, allowTone, statements, managedHomes, leasedHomes, whyMe, DONE_JOB, MiniJobList, homeType, myAdmin } from './lib';
import { isLeased } from '../pricing';

export default function HomePage() {
  const s = useStore(); const L = useLookups();
  const st = statements(s)[0];
  const waiting = s.jobs.filter(needsMe);
  const al = allowanceOf(s);
  const late = s.rent.filter(r => r.paid < r.amount && daysFrom(r.due) < 0);
  const certs = s.safety; const okCerts = certs.filter(c => c.status === 'Valid' || c.status === 'Booked').length;
  const soon = certs.filter(c => ['Due soon', 'Booked', 'Overdue', 'Missing'].includes(c.status) && c.days <= 30);
  const open = s.jobs.filter(j => !DONE_JOB.includes(j.status) && !needsMe(j));
  const unread = s.me.comms.filter(c => c.by !== ME_NAME && !s.read.includes(c.id)).length;
  const coming = [
    ...s.inspections.filter(i => i.status !== 'Locked' && daysFrom(i.date) >= 0).map(i => ({ d: i.date, t: `${i.kind} visit · ${i.time}`, p: L.prop(i.property)?.address ?? '', go: () => s.go('properties', i.property), c: 't-info' })),
    ...certs.filter(c => c.days >= 0 && c.days <= 60).map(c => ({ d: c.expires, t: `${c.kind} ends`, p: L.prop(c.property)?.address ?? '', go: () => s.go('safety', c.id), c: 't-warn' })),
    ...(st && !st.paid ? [{ d: st.payDate, t: `Rent payout · ${money(st.pay)}`, p: `To ${s.me.bank}`, go: () => s.go('rent', st.key), c: 't-ok' }] : []),
    ...s.leasePays.filter(x => x.paid < x.amount && daysFrom(x.due) >= 0).map(x => ({ d: x.due, t: `Lease payment from LSP · ${money(x.amount)}`, p: L.prop(x.property)?.address ?? '', go: () => s.go('properties', x.property), c: 't-brand' })),
  ].sort((a, b) => daysFrom(a.d) - daysFrom(b.d)).slice(0, 5);
  const dueAll = st?.due ?? 0, inAll = st?.received ?? 0;
  return <>
    <PageHeader title={`Good morning, ${s.me.name.split(' ')[0]}`} action={<div className="flex"><Btn kind="outline" icon={<MessageSquare size={18} />} onClick={() => s.go('messages')}>Message LSP</Btn><Btn icon={<Wrench size={18} />} onClick={() => s.go('repairs', 'new')}>Report a repair</Btn></div>} />
    <div className="row">
      <div className="hero grow">
        <div className="col grow" style={{ gap: 14 }}>
          <span className="chip-dark" style={{ alignSelf: 'flex-start' }}>{st?.month ?? 'This month'} · paid to you on {st?.payDate.replace(' 2026', '')}</span>
          <div className="flex" style={{ alignItems: 'flex-end', gap: 10 }}><span className="big">{money(st?.pay ?? 0)}</span><span className="chip accent nodot" style={{ marginBottom: 12 }}>{st?.paid ? 'Paid' : 'On its way'}</span></div>
          <p style={{ margin: 0, color: '#C3CDE4', fontSize: 13, fontWeight: 500, maxWidth: 440 }}>Rent received {money(inAll)} of {money(dueAll)}, less LSP's {s.me.plan}% fee{st?.vatOn ? ' and VAT' : ''}{st?.repairs ? ' and repairs' : ''}. Paid into {s.me.bank}.</p>
          <div className="flex" style={{ gap: 12 }}>{[[String(s.properties.length), 'Your homes'], [`${dueAll ? Math.round(inAll / dueAll * 100) : 100}%`, 'Rent received'], [String(open.length), 'Repairs under way']].map(([v, l]) => <div className="mtile" key={l}><b>{v}</b><span>{l}</span></div>)}</div>
        </div>
        <div className="gring"><svg viewBox="0 0 176 176"><circle cx="88" cy="88" r="80" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="14" /><circle cx="88" cy="88" r="80" fill="none" stroke="#5BAF00" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 80 * Math.min(1, al.total ? al.left / al.total : 0)} 999`} transform="rotate(-90 88 88)" /></svg>
          <div className="stack" style={{ alignItems: 'center' }}><BadgePercent size={22} color="#5BAF00" /><b style={{ fontSize: 13 }}>{money(al.left)} left</b><span style={{ fontSize: 10.5, color: '#AEBBDA' }}>maintenance allowance</span></div></div>
      </div>
      <Card title="Needs your decision" sub="Repairs that can't start until you approve them." action={<Chip tone={waiting.length ? 'warn' : 'ok'}>{waiting.length} waiting</Chip>} style={{ width: 400, flex: 'none' }}>
        {waiting.map(j => <div className="lrow" key={j.id}>
          <span className="tile t-white" style={{ width: 36, height: 36 }}>{j.ownerRepair ? <KeyRound size={18} /> : <Wrench size={18} />}</span>
          <button className="stack grow" style={{ border: 0, background: 'none', textAlign: 'left', padding: 0, minWidth: 0 }} onClick={() => s.go('approvals', j.id)}><span className="flex" style={{ gap: 6 }}><b className="ellip">{j.title}</b><b style={{ color: 'var(--warn)' }}>{money(j.price)}</b></span><span className="caption ellip">{L.prop(j.property)?.address} · {whyMe(s, j)}</span></button>
          <Btn sm onClick={() => s.go('approvals', j.id)}>Review</Btn>
        </div>)}
        {!waiting.length && <Note tone="ok">Nothing waiting for you.</Note>}
        <button className="btn ghost sm" onClick={() => s.go('approvals')}>Open Needs my approval</button>
      </Card>
    </div>
    <div className="grid g4">
      <Kpi icon={<PoundSterling size={18} />} tone="ok" label="Rent this month" value={money(inAll)} caption={`of ${money(dueAll)} due`} onClick={() => s.go('rent')} />
      <Kpi icon={<TriangleAlert size={18} />} tone="err" label="Rent owed" value={money(late.reduce((a, r) => a + r.amount - r.paid, 0))} caption={late.length ? `${late.length} tenant · LSP is chasing it` : 'Nothing owed'} onClick={() => s.go('rent')} />
      <Kpi icon={<ShieldCheck size={18} />} tone={soon.length ? 'warn' : 'ok'} label="Safety certificates" value={`${okCerts} of ${certs.length}`} caption={soon.length ? `${soon.length} ending in 30 days` : 'all in date'} onClick={() => s.go('safety')} />
      <Kpi icon={<BadgePercent size={18} />} tone={allowTone(al.pctAll)} label="Maintenance allowance" value={money(al.left)} caption={`left of ${money(al.total)} after approved work · renews ${al.renews}`} onClick={() => s.go('plan')} />
    </div>
    <div className="row">
      <Card title="Your homes" className="grow" action={<Btn sm kind="ghost" onClick={() => s.go('properties')}>All homes</Btn>}>
        <div className="divlist">{[...managedHomes(s), ...leasedHomes(s)].map(p => { const t = s.tenants.find(x => x.property === p.id && x.status !== 'Moved out'); const r = t ? s.rent.find(x => x.tenant === t.id) : undefined; const n = s.jobs.filter(j => j.property === p.id && !DONE_JOB.includes(j.status)).length; return (
          <button key={p.id} className="item click" onClick={() => s.go('properties', p.id)}>
            <span className="photo" style={{ width: 64, height: 48, borderRadius: 10, flex: 'none', backgroundImage: `url(${p.photo})` }} />
            <div className="stack grow"><b>{p.address}</b><span className="caption">{homeType(p)} · {isLeased(p) ? `Leased to LSP · ${money(p.lease!.rent)} a month to you` : t ? `${t.name} · ${money(p.rent)} pcm` : 'Empty'}</span></div>
            {n > 0 && <span className="caption"><Wrench size={12} style={{ verticalAlign: -2 }} /> {n}</span>}
            {isLeased(p) ? <Chip tone="brand" dot={false}>Leased to LSP</Chip> : r ? <Chip tone={rentStatus(r).tone}>{rentStatus(r).label}</Chip> : <Chip tone="neutral">{p.status}</Chip>}
          </button>); })}</div>
      </Card>
      <Card title="Coming up" action={<CalendarDays size={18} color="#667085" />} style={{ width: 340, flex: 'none' }}>
        {coming.map(c => { const [d, m] = c.d.split(' '); return <button key={c.t + c.d} className="item click" style={{ padding: 0 }} onClick={c.go}><span className={`datetile ${c.c}`}><b>{d}</b><span>{m.toUpperCase()}</span></span><div className="stack"><b>{c.t}</b><span className="caption">{c.p}</span></div></button>; })}
        {!coming.length && <span className="caption">Nothing booked.</span>}
      </Card>
    </div>
    <div className="row">
      <Card title="Repairs under way" sub="Reported by you, your tenants or LSP. LSP books the contractor and checks the work." className="grow" action={<Btn sm kind="ghost" onClick={() => s.go('repairs')}>All repairs</Btn>}>
        <MiniJobList jobs={open.slice(0, 4)} empty="No repairs under way." />
      </Card>
      <Card title="Your Office Admin" style={{ width: 340, flex: 'none' }}>
        {myAdmin(s) ? <div className="flex"><img className="avatar md" src={myAdmin(s)!.photo ?? 'images/av3.jpg'} alt="" /><div className="stack grow"><b>{myAdmin(s)!.name}</b><span className="caption">Looks after your homes at LSP</span></div></div> : <Empty>LSP looks after your homes.</Empty>}
        <Btn kind="outline" icon={<MessageSquare size={16} />} onClick={() => s.go('messages')}>{unread ? `Messages · ${unread} new` : 'Send a message'}</Btn>
        <Note>Emergency, like no heating or a leak? Call LSP on {LSP_PHONE} and report it here too.</Note>
        <button className="btn ghost sm" onClick={() => s.go('activity')}><Phone size={14} /> See everything LSP did this month <ArrowRight size={14} /></button>
      </Card>
    </div>
    {waiting.length > 0 && <Card className="flat"><span className="flex small" style={{ gap: 8 }}><CircleCheck size={16} color="var(--warn)" />No reply is not a yes. LSP won't book work that needs your approval until you approve it here.</span></Card>}
    {!s.properties.length && <Empty icon={<HomeIcon size={22} />}>No homes yet.</Empty>}
  </>;
}
