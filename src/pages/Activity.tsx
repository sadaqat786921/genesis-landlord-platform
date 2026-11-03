import { History, Download } from 'lucide-react';
import { useStore } from '../store';
import { parseDate } from '../data';
import { Btn, Card, Empty, Timeline, FilterBar, applyFlt, useFlt, yearsOf } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';

/** Everything on the landlord's account: what they did and what LSP did for their homes. */
export function Activity() {
  const s = useStore(); const [f, setF] = useFlt();
  const all = [...s.activity].sort((a, b) => parseDate(b.at).getTime() - parseDate(a.at).getTime());
  const list = applyFlt(all, f, { text: a => `${a.what} ${a.who}`, type: a => a.area, date: a => a.at });
  return <>
    <PageHeader crumbs={crumbsFor('activity', s.go)} title="Activity" action={<Btn kind="outline" icon={<Download size={18} />} onClick={() => { s.log('Downloaded your activity list', 'Account'); s.toast('Activity downloaded as Excel'); }}>Download</Btn>} />
    <Card title="Everything on your account" sub="What you did here and what LSP did for your homes, with the date and time. Nothing is deleted.">
      <FilterBar f={f} set={setF} placeholder="Search activity" types={[...new Set(all.map(a => a.area))].sort()} typeLabel="All areas" years={yearsOf(all, a => a.at)} shown={list.length} total={all.length} />
      <Timeline items={list.map(a => ({ at: a.at, text: a.what, by: a.who === s.me.name ? 'You' : a.who }))} />
      {!list.length && <Empty icon={<History size={22} />}>Nothing matches.</Empty>}
    </Card>
  </>;
}
