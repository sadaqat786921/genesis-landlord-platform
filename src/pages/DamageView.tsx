import { useState } from 'react';
import { Hammer, Download } from 'lucide-react';
import { useStore, money } from '../store';
import { parseDate, type Property } from '../data';
import { Btn, Card, Chip, Empty, KV, Modal, Note, Timeline, When } from '../ui';
import { DocSheet, ddmm, downloadPdf } from './lib';
import { damageTotal, damageTone, damageLabel, type Damage } from '../damage';

/* Tenant damage at the landlord's managed home (view only). LSP sends the tenant a quote; the tenant pays.
   It never comes from the landlord's maintenance allowance. */
export function TenantDamage({ p }: { p: Property }) {
  const s = useStore(); const [open, setOpen] = useState<Damage | null>(null);
  const list = s.damages.filter(d => d.property === p.id).sort((a, b) => parseDate(b.found).getTime() - parseDate(a.found).getTime());
  const tn = (id: string) => s.tenants.find(t => t.id === id)?.name ?? 'Former tenant';
  return <Card title="Tenant damage" sub="When a tenant damages your home, LSP sends them a quote for the repair. The tenant pays. It never comes from your maintenance allowance.">
    {list.length ? <div className="tablewrap"><table className="t"><thead><tr><th>Damage</th><th>Tenant</th><th>Quote</th><th>Amount</th><th>Found</th><th>Status</th></tr></thead><tbody>
      {list.map(d => <tr key={d.id} onClick={() => setOpen(d)}><td><span className="cell"><span className="tile t-info" style={{ width: 32, height: 32 }}><Hammer size={15} /></span><span className="stack"><b className="strong">{d.title}</b><span className="caption">{d.room ?? '—'} · {d.source}</span></span></span></td><td>{tn(d.tenant)}</td><td>{d.quoteNo}</td><td><b>{money(damageTotal(d))}</b></td><td><When at={d.found} /></td><td><Chip tone={damageTone(d.status)}>{damageLabel(d.status)}</Chip></td></tr>)}
    </tbody></table></div> : <Empty icon={<Hammer size={22} />}>No tenant damage at this home.</Empty>}
    {open && <Modal wide title={open.title} sub={`${p.address}${open.room ? ' · ' + open.room : ''} · ${damageLabel(open.status)}`} onClose={() => setOpen(null)}
      footer={<><Btn kind="outline" onClick={() => setOpen(null)}>Close</Btn><Btn icon={<Download size={16} />} onClick={() => downloadPdf(s, `Damage quote ${open.quoteNo}`)}>Download PDF</Btn></>}>
      <Note tone="ok">Paid by {tn(open.tenant)}. Not taken from your maintenance allowance.</Note>
      <DocSheet kind="DAMAGE QUOTE" to={{ label: 'Quote for', rows: [tn(open.tenant), p.address, p.area] }} site={`${p.address}, ${p.area}${open.room ? ' · ' + open.room : ''}`} lines={open.lines}
        meta={[['Quote', open.quoteNo], ['Date', ddmm((open.sent ?? open.found).split(',')[0])], ['Valid until', open.validUntil ? ddmm(open.validUntil) : '—'], ['Status', damageLabel(open.status)]]}
        foot={[['Tenant pays', money(damageTotal(open))]]}><p className="doc-note">{open.note}</p></DocSheet>
      <KV rows={[['How it was found', open.source], ['Found', open.found]]} />
      <Timeline items={[...open.events].reverse().map(e => ({ at: e.at, text: e.text, by: e.by }))} />
    </Modal>}
  </Card>;
}
