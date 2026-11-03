// Sample data for the Genesis Landlord portal prototype. All names and figures are examples.
// Demo "today" is Wednesday 15 Oct 2026.

export type Tone = 'ok' | 'warn' | 'err' | 'info' | 'neutral' | 'brand';
export type Plan = 10 | 12 | 16 | 20;
export const PLAN = {
  10: { limit: 0, label: '10% plan · Management Only' },
  12: { limit: 150, label: '12% plan' },
  16: { limit: 200, label: '16% plan' },
  20: { limit: 300, label: '20% plan' },
} as const;

/* ---------- who is signed in ---------- */
/** This portal is for one landlord. They see only their own homes, tenancies, money, checks and documents. */
export const PORTAL: 'supervisor' | 'oa' | 'landlord' = 'landlord';
export const ME = 'L1';
export const ME_NAME = 'Margaret Okafor';
export const SUPERVISOR = 'Sarah Khan';
/** LSP's main phone line, shown for emergencies. */
export const LSP_PHONE = '020 7946 0000';

/* ---------- dates ---------- */
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const TODAY = new Date(2026, 9, 15);
export const TODAY_LABEL = '15 Oct 2026';
/** "21 Oct 2026" or "21 Oct 2026, 10:30" → Date */
export function parseDate(s: string): Date {
  const [datePart, time] = s.split(',');
  const [d, m, y] = datePart.trim().split(' ');
  const out = new Date(+(y || 2026), MONTHS.indexOf(m), +d);
  if (time) { const [h, mi] = time.trim().split(':'); out.setHours(+h, +mi); }
  return out;
}
export const fmtDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
export const daysFrom = (s: string) => Math.round((parseDate(s).getTime() - TODAY.getTime()) / 864e5);
/** Real clock time on the demo date, e.g. "15 Oct 2026, 14:05" */
export function nowStamp() { const n = new Date(); return `${TODAY_LABEL}, ${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`; }

/* ---------- shared shapes ---------- */
export type Channel = 'Email' | 'Call' | 'Note' | 'Portal' | 'System' | 'SMS';
export interface Comm { id: string; at: string; by: string; channel: Channel; text: string; subject?: string; dir?: 'in' | 'out' }
export type DocStatus = 'Missing' | 'Uploaded' | 'Verified' | 'Rejected' | 'Expired';
export interface KycDoc { name: string; status: DocStatus; file?: string; at?: string; note?: string; expires?: string }
let cid = 0;
const c = (at: string, by: string, channel: Channel, text: string, dir: 'in' | 'out' = 'out', subject?: string): Comm => ({ id: 'cm' + ++cid, at, by, channel, text, dir, subject });

/* ---------- staff ---------- */
export interface Staff { id: string; name: string; role: 'Supervisor' | 'Office Admin'; photo?: string; initials: string; color: string; email: string; phone: string; active: boolean; joined: string; disabledReason?: string }
export const STAFF: Staff[] = [
  { id: 'sk', name: 'Sarah Khan', role: 'Supervisor', photo: 'images/sarah.jpg', initials: 'SK', color: '#153D91', email: 's.khan@lsp.co.uk', phone: '020 7946 0001', active: true, joined: '3 Jan 2024' },
  { id: 'et', name: 'Emma Thompson', role: 'Office Admin', photo: 'images/av3.jpg', initials: 'ET', color: '#099FFD', email: 'e.thompson@lsp.co.uk', phone: '020 7946 0011', active: true, joined: '14 Mar 2024' },
  { id: 'jc', name: 'James Carter', role: 'Office Admin', photo: 'images/av1.jpg', initials: 'JC', color: '#5BAF00', email: 'j.carter@lsp.co.uk', phone: '020 7946 0012', active: true, joined: '2 Sep 2024' },
  { id: 'ps', name: 'Priya Shah', role: 'Office Admin', initials: 'PS', color: '#153D91', email: 'p.shah@lsp.co.uk', phone: '020 7946 0013', active: true, joined: '20 Jan 2025' },
  { id: 'lm', name: 'Liam Murphy', role: 'Office Admin', photo: 'images/av5.jpg', initials: 'LM', color: '#0B6FB8', email: 'l.murphy@lsp.co.uk', phone: '020 7946 0014', active: true, joined: '7 Apr 2025' },
  { id: 'nb', name: 'Noah Bell', role: 'Office Admin', photo: 'images/av2.jpg', initials: 'NB', color: '#667085', email: 'n.bell@lsp.co.uk', phone: '020 7946 0015', active: false, joined: '11 Jun 2025', disabledReason: 'Left LSP on 30 Sep 2026. His work moved to Emma Thompson.' },
];
export const ADMINS = STAFF.filter(s => s.role === 'Office Admin' && s.active);

/* ---------- landlords ---------- */
export interface Landlord { id: string; name: string; email: string; phone: string; billing: string; plan: Plan; start: string; admin: string; status: 'Active' | 'Invite sent'; bank: string; comms: Comm[]; allowance?: number }
export const LANDLORDS: Landlord[] = [
  { id: 'L1', name: 'Margaret Okafor', email: 'm.okafor@mail.co.uk', phone: '07700 900111', billing: '12 Oak Street, London N6 2AB', plan: 16, start: '1 Apr 2026', admin: 'et', status: 'Active', bank: 'Barclays ···· 4821', comms: [c('2 Oct 2026, 11:04', 'Emma Thompson', 'Email', 'Monthly statement for September sent.', 'out', 'Your September statement')] },
  { id: 'L2', name: 'David Hughes', email: 'd.hughes@mail.co.uk', phone: '07700 900222', billing: '22 Oak Avenue, London N8 1QP', plan: 20, start: '15 Jan 2026', admin: 'ps', status: 'Active', bank: 'HSBC ···· 1190', comms: [c('13 Oct 2026, 16:50', 'Priya Shah', 'Email', 'Roof leak at 22 Oak Avenue needs a repair at £680. This is over your £300 job limit, so we need your OK before we book it.', 'out', 'Repair approval needed · 22 Oak Avenue'), c('14 Oct 2026, 09:22', 'David Hughes', 'Email', 'Can you send me photos of the ceiling first please?', 'in', 'Re: Repair approval needed · 22 Oak Avenue')] },
  { id: 'L3', name: 'Rachel Evans', email: 'r.evans@mail.co.uk', phone: '07700 900333', billing: '9 Park Street, London N1 4HR', plan: 12, start: '10 Jun 2026', admin: 'jc', status: 'Active', bank: 'Lloyds ···· 7702', comms: [] },
  { id: 'L4', name: 'Tom Ahmed', email: 't.ahmed@mail.co.uk', phone: '07700 900444', billing: '31 Ash Grove, London N8 2LN', plan: 16, start: '2 Mar 2026', admin: 'et', status: 'Active', bank: 'NatWest ···· 3318', comms: [] },
  { id: 'L5', name: 'Helen Brooks', email: 'h.brooks@mail.co.uk', phone: '07700 900555', billing: '5 Mill Lane, Tottenham, London N17 1JX', plan: 20, start: '20 Feb 2026', admin: 'et', status: 'Active', bank: 'Santander ···· 6620', comms: [] },
  { id: 'L6', name: 'Karen Patel', email: 'k.patel@mail.co.uk', phone: '07700 900666', billing: '14 Elm Road, London N6 3DT', plan: 16, start: '5 May 2026', admin: 'et', status: 'Active', bank: 'Monzo ···· 9054', comms: [c('14 Oct 2026, 15:10', 'Priya Shah', 'Call', 'Told Karen the boiler needs a new part (£420). She is happy for us to go ahead but wants the invoice by email.', 'out')] },
  { id: 'L7', name: 'Simon Wright', email: 's.wright@mail.co.uk', phone: '07700 900777', billing: '8 King Street, London N1 2HL', plan: 12, start: '12 Sep 2026', admin: 'jc', status: 'Active', bank: 'Barclays ···· 2207', comms: [] },
  { id: 'L8', name: 'Fiona Clarke', email: 'f.clarke@mail.co.uk', phone: '07700 900888', billing: '41 Birch Close, Finchley, London N3 3QT', plan: 20, start: '1 Nov 2026', admin: 'lm', status: 'Invite sent', bank: '—', comms: [c('13 Oct 2026, 10:00', 'Sarah Khan', 'Email', 'Login email sent from Outlook.', 'out', 'Your Genesis landlord login')] },
];

/* ---------- clients (letting agents) ---------- */
export interface Client { id: string; name: string; contact: string; email: string; phone: string; address: string; status: 'Active' | 'Paused'; joined: string; terms: string }
export const CLIENTS: Client[] = [
  { id: 'A1', name: 'Rosewood Lettings', contact: 'Claire Rose', email: 'claire@rosewood.co.uk', phone: '020 7946 0101', address: '4 Albion Place, London N1 6JL', status: 'Active', joined: '10 Feb 2026', terms: '30 days' },
  { id: 'A2', name: 'Northgate Homes', contact: 'Ben Hall', email: 'ben@northgate.co.uk', phone: '020 7946 0202', address: '18 North Street, London N2 7PN', status: 'Active', joined: '3 May 2026', terms: '30 days' },
  { id: 'A3', name: 'City Key Agents', contact: 'Aisha Noor', email: 'aisha@citykey.co.uk', phone: '020 7946 0303', address: '77 Call Lane, London N1 7BT', status: 'Active', joined: '22 Jul 2026', terms: '14 days' },
];

/* ---------- properties ---------- */
export interface Property { id: string; address: string; area: string; type: 'House' | 'Flat' | 'HMO'; rooms?: number; beds: number; baths: number; managed: boolean; owner: string; rent: number; status: 'Let' | 'Vacant' | 'Ready to let' | 'Partly let'; admin: string; photo: string; budget: number; used: number; gas: boolean; added: string; arrangement?: 'Managed' | 'Leased'; lease?: Lease }
export const PROPERTIES: Property[] = [
  { id: 'P1', address: '12 Oak Street', area: 'Islington, London N1', type: 'House', beds: 3, baths: 1, managed: true, owner: 'L1', rent: 1250, status: 'Let', admin: 'et', photo: 'images/home1.jpg', budget: 1800, used: 1296, gas: true, added: '1 Apr 2026' },
  { id: 'P2', address: '22 Oak Avenue', area: 'Highbury, London N5', type: 'House', beds: 4, baths: 2, managed: true, owner: 'L2', rent: 1450, status: 'Let', admin: 'ps', photo: 'images/home2.jpg', budget: 2400, used: 1104, gas: true, added: '15 Jan 2026' },
  { id: 'P3', address: 'Flat 2, 9 Park Street', area: 'Camden, London NW1', type: 'Flat', beds: 2, baths: 1, managed: true, owner: 'L3', rent: 875, status: 'Let', admin: 'jc', photo: 'images/home3.jpg', budget: 900, used: 342, gas: false, added: '10 Jun 2026' },
  { id: 'P4', address: '31 Ash Grove', area: 'Highbury, London N5', type: 'House', beds: 3, baths: 1, managed: true, owner: 'L4', rent: 1150, status: 'Ready to let', admin: 'et', photo: 'images/home1.jpg', budget: 1500, used: 525, gas: true, added: '2 Mar 2026' },
  { id: 'P5', address: '5 Mill Lane (HMO)', area: 'Tottenham, London N17', type: 'HMO', rooms: 6, beds: 6, baths: 3, managed: true, owner: 'L5', rent: 2640, status: 'Partly let', admin: 'et', photo: 'images/home2.jpg', budget: 3200, used: 1760, gas: true, added: '20 Feb 2026' },
  { id: 'P6', address: '14 Elm Road', area: 'Islington, London N1', type: 'House', beds: 3, baths: 1, managed: true, owner: 'L6', rent: 1150, status: 'Let', admin: 'et', photo: 'images/home3.jpg', budget: 1600, used: 1120, gas: true, added: '5 May 2026' },
  { id: 'P7', address: 'Flat 3, 8 King Street', area: 'Camden, London NW1', type: 'Flat', beds: 2, baths: 1, managed: true, owner: 'L7', rent: 875, status: 'Let', admin: 'jc', photo: 'images/home1.jpg', budget: 800, used: 96, gas: true, added: '12 Sep 2026' },
  { id: 'P8', address: '3 Park Road (HMO)', area: 'Holloway, London N7', type: 'HMO', rooms: 5, beds: 5, baths: 2, managed: true, owner: 'L2', rent: 2150, status: 'Partly let', admin: 'ps', photo: 'images/home2.jpg', budget: 1500, used: 980, gas: true, added: '15 Jan 2026' },
  { id: 'P13', address: '7 Cliff Road', area: 'Islington, London N1', type: 'Flat', beds: 2, baths: 1, managed: true, owner: 'L2', rent: 950, status: 'Ready to let', admin: 'ps', photo: 'images/home3.jpg', budget: 800, used: 120, gas: true, added: '1 Aug 2026' },
  { id: 'P14', address: '41 Birch Close', area: 'Finchley, London N3', type: 'House', beds: 3, baths: 2, managed: true, owner: 'L8', rent: 1050, status: 'Vacant', admin: 'lm', photo: 'images/home1.jpg', budget: 1000, used: 0, gas: true, added: '13 Oct 2026' },
  { id: 'P9', address: '27 Grange Avenue', area: 'Crouch End, London N8', type: 'House', beds: 3, baths: 1, managed: false, owner: 'A1', rent: 0, status: 'Let', admin: 'et', photo: 'images/home3.jpg', budget: 0, used: 0, gas: true, added: '10 Feb 2026' },
  { id: 'P10', address: 'Flat 6, 2 Wharf Street', area: 'Holloway, London N7', type: 'Flat', beds: 1, baths: 1, managed: false, owner: 'A1', rent: 0, status: 'Let', admin: 'et', photo: 'images/home1.jpg', budget: 0, used: 0, gas: false, added: '10 Feb 2026' },
  { id: 'P11', address: '88 Victoria Road', area: 'Highgate, London N6', type: 'House', beds: 4, baths: 2, managed: false, owner: 'A2', rent: 0, status: 'Let', admin: 'lm', photo: 'images/home2.jpg', budget: 0, used: 0, gas: true, added: '3 May 2026' },
  { id: 'P12', address: '19 Station Lane', area: 'Muswell Hill, London N10', type: 'House', beds: 2, baths: 1, managed: false, owner: 'A3', rent: 0, status: 'Let', admin: 'jc', photo: 'images/home3.jpg', budget: 0, used: 0, gas: true, added: '22 Jul 2026' },
];

/* ---------- enquiries ---------- */
export const ENQ_STAGES = ['New', 'Assigned', 'Contacted', 'Converted', 'Closed'] as const;
export type EnqStage = typeof ENQ_STAGES[number];
export interface Enquiry { id: string; name: string; email: string; phone: string; kind: 'Landlord' | 'Home seeker'; about: string; property?: string; message: string; received: string; source: 'Website form' | 'Phone' | 'Email' | 'Rightmove'; stage: EnqStage; admin?: string; comms: Comm[]; closed?: { reason: string; note: string; at: string; by: string }; converted?: string; switchLead?: string }
export const ENQUIRIES: Enquiry[] = [
  { id: 'E1', name: 'Paul Bennett', email: 'paul.bennett@mail.co.uk', phone: '07700 901001', kind: 'Landlord', about: '2 flats in Kentish Town NW5', message: 'I have two flats I want managed from December. Could someone call me about the 16% plan?', received: '15 Oct 2026, 09:12', source: 'Website form', stage: 'Assigned', admin: 'et', comms: [c('15 Oct 2026, 09:15', 'Sarah Khan', 'System', 'Assigned to Emma Thompson.')] },
  { id: 'E2', name: 'Lucy Grant', email: 'lucy.grant@mail.co.uk', phone: '07700 901002', kind: 'Home seeker', about: '31 Ash Grove', property: 'P4', message: 'Is the 3 bed on Ash Grove still free? We are a family of four and can move in November.', received: '15 Oct 2026, 08:40', source: 'Website form', stage: 'Assigned', admin: 'et', comms: [c('15 Oct 2026, 09:15', 'Sarah Khan', 'System', 'Assigned to Emma Thompson.')] },
  { id: 'E3', name: 'Omar Siddiqui', email: 'omar.s@mail.co.uk', phone: '07700 901003', kind: 'Landlord', about: 'HMO in Highgate N6', message: 'Looking for full management for a 6 room HMO. Current agent is leaving at the end of November.', received: '14 Oct 2026, 16:05', source: 'Phone', stage: 'Assigned', admin: 'ps', comms: [c('14 Oct 2026, 16:20', 'Sarah Khan', 'System', 'Passed to Priya Shah to follow up.')] },
  { id: 'E4', name: 'Grace Lee', email: 'grace.lee@mail.co.uk', phone: '07700 901004', kind: 'Home seeker', about: 'Room in 5 Mill Lane', property: 'P5', message: 'Student looking for a room from January.', received: '13 Oct 2026, 11:20', source: 'Website form', stage: 'Converted', admin: 'et', converted: 'AP3', comms: [c('13 Oct 2026, 12:05', 'Emma Thompson', 'Call', 'Called Grace. Room 3 is free from November. She wants to apply.'), c('13 Oct 2026, 12:30', 'Emma Thompson', 'System', 'Moved to Lettings as a new applicant.')] },
  { id: 'E5', name: 'Mark Dawson', email: 'mark.d@mail.co.uk', phone: '07700 901005', kind: 'Landlord', about: 'House in Muswell Hill N10', message: 'What does the 12% plan include for repairs?', received: '13 Oct 2026, 14:32', source: 'Email', stage: 'Closed', admin: 'jc', comms: [c('13 Oct 2026, 15:00', 'James Carter', 'Email', 'Sent the plan guide and price list.', 'out', 'LSP plans and what they include')], closed: { reason: 'Only wanted information', note: 'Sent the plan guide. He will come back in spring.', at: '13 Oct 2026, 15:02', by: 'James Carter' } },
  { id: 'E6', name: 'Chloe Barnes', email: 'chloe.b@mail.co.uk', phone: '07700 901006', kind: 'Home seeker', about: 'Room in 3 Park Road', property: 'P8', message: 'Nurse at the Whittington looking for a room close to work, from 1 November.', received: '12 Oct 2026, 19:44', source: 'Rightmove', stage: 'Contacted', admin: 'ps', comms: [c('13 Oct 2026, 10:15', 'Priya Shah', 'Call', 'Spoke to Chloe. Rooms 4 and 5 are free. Viewing on Friday.'), c('13 Oct 2026, 10:20', 'Priya Shah', 'Email', 'Confirmed viewing on Fri 17 Oct at 17:30.', 'out', 'Your viewing at 3 Park Road')] },
  { id: 'E7', name: 'Imran Ali', email: 'imran.ali@mail.co.uk', phone: '07700 901007', kind: 'Landlord', about: '3 houses in Tottenham, London N17', message: 'I own three terraced houses near Mill Lane, Tottenham and want them fully managed.', received: '11 Oct 2026, 13:02', source: 'Website form', stage: 'Contacted', admin: 'et', comms: [c('12 Oct 2026, 09:40', 'Emma Thompson', 'Call', 'Imran wants the 20% plan for all three houses. Sending the agreement draft.'), c('13 Oct 2026, 11:05', 'Emma Thompson', 'Email', 'Agreement draft sent. Imran confirmed his billing address: 22 Mill Lane, Tottenham, London N17 1JX.', 'out', 'Your LSP agreement draft'), c('14 Oct 2026, 16:20', 'Emma Thompson', 'System', 'Sent to Sarah Khan to create the landlord account.')] },
];

/* ---------- lettings ---------- */
export const LET_STAGES = ['Applied', 'Contact', 'Screening (KYC)', 'Deposit & referencing', 'Supervisor review', 'Move-in', 'Moved in'] as const;
export const KYC_DOCS = ['Photo ID (passport or driving licence)', 'Proof of address', 'Right to rent share code', 'Proof of income (3 payslips)', 'Bank statements (3 months)'];
export type RefStatus = 'Not started' | 'Waiting' | 'Passed' | 'Failed';
export interface Applicant {
  id: string; name: string; email: string; phone: string; property: string; room?: string; stage: number; source: 'Rightmove' | 'Website' | 'Zoopla' | 'Enquiry';
  admin?: string; applied: string; since: string; household: string; budget: number; moveIn: string; employment: string; income: number; pets: string; current: string;
  portal: boolean; kyc: KycDoc[]; checks: { deposit: boolean; contract: boolean; reference: RefStatus }; deposit: number; moveInAt?: string;
  rejected?: { reason: string; at: string; by: string }; comms: Comm[]; tenant?: string; review?: string;
}
const kyc = (n: number, extra: Partial<Record<number, Partial<KycDoc>>> = {}): KycDoc[] => KYC_DOCS.map((name, i) => ({ name, status: i < n ? 'Uploaded' : 'Missing', ...(i < n ? { file: name.split(' (')[0].toLowerCase().replace(/ /g, '-') + '.pdf', at: '14 Oct 2026, 18:2' + i } : {}), ...(extra[i] ?? {}) }));
const verified = (): KycDoc[] => KYC_DOCS.map((name, i) => ({ name, status: 'Verified', file: name.split(' (')[0].toLowerCase().replace(/ /g, '-') + '.pdf', at: '2 Oct 2026, 11:1' + i }));
export const APPLICANTS: Applicant[] = [
  { id: 'AP1', name: 'Lucy Grant', email: 'lucy.grant@mail.co.uk', phone: '07700 901002', property: 'P4', stage: 0, admin: 'et', source: 'Website', applied: '15 Oct 2026, 08:40', since: '15 Oct 2026', household: '2 adults, 2 children', budget: 1200, moveIn: '1 Nov 2026', employment: 'Teacher, Islington Council', income: 38500, pets: 'None', current: '12 Grove Road, London N7', portal: false, kyc: kyc(0), checks: { deposit: false, contract: false, reference: 'Not started' }, deposit: 1326, comms: [] },
  { id: 'AP9', name: 'Nina Shah', email: 'nina.shah@mail.co.uk', phone: '07700 902009', property: 'P13', stage: 0, source: 'Rightmove', admin: 'ps', applied: '14 Oct 2026, 21:15', since: '14 Oct 2026', household: '1 adult', budget: 950, moveIn: '15 Nov 2026', employment: 'Junior doctor, LTHT', income: 36000, pets: 'None', current: '3 Hyde Terrace, London N2', portal: false, kyc: kyc(0), checks: { deposit: false, contract: false, reference: 'Not started' }, deposit: 1096, comms: [] },
  { id: 'AP2', name: 'Daniel Price', email: 'd.price@mail.co.uk', phone: '07700 902001', property: 'P4', stage: 1, source: 'Rightmove', admin: 'et', applied: '12 Oct 2026, 10:02', since: '13 Oct 2026', household: '1 adult', budget: 1150, moveIn: '15 Nov 2026', employment: 'Software engineer, Sky Osterley', income: 52000, pets: '1 cat', current: '40 Kirkstall Lane, London N5', portal: false, kyc: kyc(0), checks: { deposit: false, contract: false, reference: 'Not started' }, deposit: 1326, comms: [c('13 Oct 2026, 11:30', 'Liam Murphy', 'Call', 'Daniel confirmed he wants 31 Ash Grove. Viewing done on Saturday, he liked it. Has a cat, landlord said yes to pets.')] },
  { id: 'AP3', name: 'Grace Lee', email: 'grace.lee@mail.co.uk', phone: '07700 901004', property: 'P5', room: 'Room 3', stage: 2, source: 'Enquiry', admin: 'et', applied: '13 Oct 2026, 12:30', since: '14 Oct 2026', household: '1 student', budget: 440, moveIn: '6 Jan 2027', employment: 'Student, Middlesex University', income: 9600, pets: 'None', current: 'Halls, Tottenham, London N17', portal: true, kyc: kyc(3), checks: { deposit: false, contract: false, reference: 'Not started' }, deposit: 507, comms: [c('13 Oct 2026, 12:05', 'Emma Thompson', 'Call', 'Called Grace. Room 3 is free from November. She wants to apply.'), c('14 Oct 2026, 09:00', 'Emma Thompson', 'Email', 'Portal login sent. Please upload your documents.', 'out', 'Your Genesis tenant portal login'), c('14 Oct 2026, 18:22', 'Grace Lee', 'Portal', 'Uploaded 3 of 5 documents.', 'in')] },
  { id: 'AP4', name: 'Hannah Moss', email: 'h.moss@mail.co.uk', phone: '07700 902002', property: 'P5', room: 'Room 2', stage: 2, source: 'Rightmove', admin: 'et', applied: '6 Oct 2026, 14:00', since: '10 Oct 2026', household: '1 adult', budget: 450, moveIn: '1 Nov 2026', employment: 'Barista, Costa Camden', income: 21000, pets: 'None', current: '9 Manor Row, London N4', portal: true, kyc: kyc(5), checks: { deposit: false, contract: false, reference: 'Not started' }, deposit: 519, comms: [c('10 Oct 2026, 10:00', 'Emma Thompson', 'Email', 'Portal login sent.', 'out', 'Your Genesis tenant portal login'), c('14 Oct 2026, 18:24', 'Hannah Moss', 'Portal', 'All 5 documents uploaded.', 'in')] },
  { id: 'AP10', name: 'Ben Carter', email: 'ben.c@mail.co.uk', phone: '07700 902010', property: 'P4', stage: 2, source: 'Zoopla', admin: 'et', applied: '2 Oct 2026, 09:10', since: '4 Oct 2026', household: '2 adults', budget: 1100, moveIn: '1 Nov 2026', employment: 'Self-employed builder', income: 30000, pets: 'None', current: '5 Moor Road, London N10', portal: true, kyc: kyc(3, { 2: { status: 'Rejected', note: 'Share code not valid' } }), checks: { deposit: false, contract: false, reference: 'Not started' }, deposit: 1326, rejected: { reason: 'Could not show the right to rent', at: '9 Oct 2026, 15:40', by: 'Sarah Khan' }, comms: [] },
  { id: 'AP5', name: 'Kieran Walsh', email: 'k.walsh@mail.co.uk', phone: '07700 902003', property: 'P4', stage: 3, source: 'Rightmove', admin: 'et', applied: '3 Oct 2026, 17:30', since: '11 Oct 2026', household: '2 adults', budget: 1150, moveIn: '1 Nov 2026', employment: 'Nurse, St James\'s Hospital', income: 38000, pets: 'None', current: '22 Beckett Street, London N9', portal: true, kyc: verified(), checks: { deposit: true, contract: true, reference: 'Waiting' }, deposit: 1326, comms: [c('11 Oct 2026, 10:10', 'Liam Murphy', 'Email', 'Holding deposit received. Agreement sent to sign.', 'out', 'Next steps for 31 Ash Grove'), c('12 Oct 2026, 20:45', 'Kieran Walsh', 'Portal', 'Signed the tenancy agreement.', 'in'), c('13 Oct 2026, 09:00', 'Liam Murphy', 'System', 'Sent to the referencing firm (Goodlord).')] },
  { id: 'AP6', name: 'Sophie Turner', email: 's.turner@mail.co.uk', phone: '07700 902004', property: 'P5', room: 'Room 6', stage: 4, source: 'Rightmove', admin: 'et', applied: '28 Sep 2026, 12:00', since: '14 Oct 2026', household: '1 adult', budget: 440, moveIn: '20 Oct 2026', employment: 'Retail manager, Next', income: 27500, pets: 'None', current: '61 Seven Sisters Road, London N4', portal: true, kyc: verified(), checks: { deposit: true, contract: true, reference: 'Passed' }, deposit: 507, review: 'All checks done. Referencing passed with no issues.', comms: [c('14 Oct 2026, 16:30', 'Emma Thompson', 'System', 'Marked complete. Waiting for Supervisor review.')] },
  { id: 'AP7', name: 'Ryan Cole', email: 'r.cole@mail.co.uk', phone: '07700 902005', property: 'P13', stage: 5, source: 'Rightmove', admin: 'ps', applied: '20 Sep 2026, 16:00', since: '13 Oct 2026', household: '2 adults, 1 dog', budget: 950, moveIn: '20 Oct 2026', employment: 'Electrician, self-employed', income: 41000, pets: '1 dog', current: '18 Cardigan Road, London N6', portal: true, kyc: verified(), checks: { deposit: true, contract: true, reference: 'Passed' }, deposit: 1096, moveInAt: '20 Oct 2026, 11:00', comms: [c('13 Oct 2026, 12:00', 'Sarah Khan', 'System', 'Profile approved. Move-in booked for 20 Oct 2026 at 11:00.')] },
  { id: 'AP8', name: 'Kofi Mensah', email: 'k.mensah@mail.co.uk', phone: '07700 903008', property: 'P3', stage: 6, source: 'Website', admin: 'jc', applied: '8 Sep 2026, 09:00', since: '1 Oct 2026', household: '1 adult', budget: 875, moveIn: '1 Oct 2026', employment: 'Accountant, KPMG London', income: 45000, pets: 'None', current: '2 Clarendon Road, London N2', portal: true, kyc: verified(), checks: { deposit: true, contract: true, reference: 'Passed' }, deposit: 1009, moveInAt: '1 Oct 2026, 12:00', tenant: 'T8', comms: [c('1 Oct 2026, 13:00', 'James Carter', 'System', 'Keys handed over. Now a live tenant.')] },
];

/* ---------- tenants ---------- */
export type TenantStatus = 'Live' | 'Moving out' | 'Moved out';
export const MOVE_OUT_STEPS = ['Notice received', 'Move-out inspection booked', 'Inspection done', 'Deposit returned', 'Moved out'] as const;
export interface Tenant {
  id: string; name: string; email: string; phone: string; property: string; room?: string; rent: number; deposit: number; depositRef: string; depositScheme: 'DPS' | 'TDS' | 'MyDeposits';
  start: string; end: string; status: TenantStatus; employment: string; emergency: string; kyc: KycDoc[]; comms: Comm[]; rentDay: number;
  moveOut?: { notice: string; date: string; reason: string; step: number; deduction?: number; deductionNote?: string }; applicant?: string;
}
export const TENANTS: Tenant[] = [
  { id: 'T1', name: 'Michael Okafor', email: 'm.okafor.t@mail.co.uk', phone: '07700 903001', property: 'P1', rent: 1250, deposit: 1442, depositRef: 'DPS-448210', depositScheme: 'DPS', start: '1 Apr 2026', end: '31 Mar 2027', status: 'Live', employment: 'Civil engineer, Arup', emergency: 'Ada Okafor · 07700 913001', rentDay: 1, kyc: verified(), comms: [c('15 Oct 2026, 07:58', 'Michael Okafor', 'Portal', 'Reported: socket in the kitchen sparks when used.', 'in'), c('15 Oct 2026, 08:30', 'Emma Thompson', 'Call', 'Told Michael not to use the socket. Volt Electrical booked for today.')] },
  { id: 'T2', name: 'Jay Patel', email: 'jay.patel@mail.co.uk', phone: '07700 903002', property: 'P2', rent: 1450, deposit: 1673, depositRef: 'TDS-118204', depositScheme: 'TDS', start: '15 Jan 2026', end: '14 Jan 2027', status: 'Live', employment: 'Pharmacist, Boots', emergency: 'Rina Patel · 07700 913002', rentDay: 15, kyc: verified(), comms: [c('13 Oct 2026, 07:12', 'Jay Patel', 'Portal', 'Water coming through the bedroom ceiling after the rain.', 'in'), c('13 Oct 2026, 09:05', 'Priya Shah', 'Call', 'Roofer visiting today to quote. Moved the bed away from the leak.')] },
  { id: 'T3', name: 'Liz Brown', email: 'liz.brown@mail.co.uk', phone: '07700 903006', property: 'P5', room: 'Room 1', rent: 440, deposit: 507, depositRef: 'DPS-229841', depositScheme: 'DPS', start: '1 Mar 2026', end: '28 Feb 2027', status: 'Live', employment: 'Care worker', emergency: 'Pat Brown · 07700 913006', rentDay: 1, kyc: verified(), comms: [c('7 Oct 2026, 10:00', 'System', 'Email', 'Rent reminder: £440 was due on 1 Oct.', 'out', 'Your rent is late'), c('12 Oct 2026, 10:00', 'System', 'Email', 'Second rent reminder sent.', 'out', 'Second reminder: rent is late'), c('13 Oct 2026, 14:20', 'Emma Thompson', 'Call', 'Liz says she gets paid on the 20th and will pay in full then.')] },
  { id: 'T4', name: 'Megan Price', email: 'megan.p@mail.co.uk', phone: '07700 903010', property: 'P5', room: 'Room 4', rent: 440, deposit: 507, depositRef: 'DPS-330127', depositScheme: 'DPS', start: '1 Jun 2026', end: '31 May 2027', status: 'Live', employment: 'Student nurse', emergency: 'Ian Price · 07700 913010', rentDay: 1, kyc: verified(), comms: [] },
  { id: 'T5', name: 'Rob Hughes', email: 'rob.h@mail.co.uk', phone: '07700 903005', property: 'P7', rent: 875, deposit: 1009, depositRef: 'DPS-552910', depositScheme: 'DPS', start: '12 Sep 2025', end: '31 Oct 2026', status: 'Moving out', employment: 'Chef, The Ivy Islington', emergency: 'Sue Hughes · 07700 913005', rentDay: 12, kyc: verified(), moveOut: { notice: '1 Oct 2026', date: '31 Oct 2026', reason: 'Moving to Manchester for work', step: 1 }, comms: [c('1 Oct 2026, 17:45', 'Rob Hughes', 'Email', 'Giving one month notice. Last day 31 October.', 'in', 'Notice to leave · Flat 3, 8 King Street')] },
  { id: 'T6', name: 'Josh Kim', email: 'josh.kim@mail.co.uk', phone: '07700 903011', property: 'P5', room: 'Room 5', rent: 430, deposit: 496, depositRef: 'MD-77120', depositScheme: 'MyDeposits', start: '1 Nov 2025', end: '9 Nov 2026', status: 'Moving out', employment: 'Student, Middlesex University', emergency: 'Min Kim · 07700 913011', rentDay: 5, kyc: verified(), moveOut: { notice: '10 Oct 2026', date: '9 Nov 2026', reason: 'Course finished', step: 0 }, comms: [] },
  { id: 'T7', name: 'Sam Ahmed', email: 'sam.ahmed@mail.co.uk', phone: '07700 903007', property: 'P6', rent: 1150, deposit: 1326, depositRef: 'TDS-331002', depositScheme: 'TDS', start: '5 May 2026', end: '4 May 2027', status: 'Live', employment: 'Teacher, Highbury Grove School', emergency: 'Nadia Ahmed · 07700 913007', rentDay: 5, kyc: verified(), comms: [c('14 Oct 2026, 07:40', 'Sam Ahmed', 'Portal', 'No hot water since last night.', 'in')] },
  { id: 'T8', name: 'Kofi Mensah', email: 'k.mensah@mail.co.uk', phone: '07700 903008', property: 'P3', rent: 875, deposit: 1009, depositRef: 'DPS-601188', depositScheme: 'DPS', start: '1 Oct 2026', end: '30 Sep 2027', status: 'Live', employment: 'Accountant, KPMG London', emergency: 'Ama Mensah · 07700 913008', rentDay: 1, kyc: verified(), applicant: 'AP8', comms: [c('1 Oct 2026, 13:00', 'James Carter', 'System', 'Keys handed over. Move-in inspection locked.')] },
  { id: 'T9', name: 'Ella Novak', email: 'e.novak@mail.co.uk', phone: '07700 903009', property: 'P8', room: 'Room 3', rent: 430, deposit: 496, depositRef: 'DPS-118733', depositScheme: 'DPS', start: '1 Feb 2026', end: '31 Jan 2027', status: 'Live', employment: 'Student, UCL', emergency: 'Jan Novak · 07700 913009', rentDay: 10, kyc: verified(), comms: [c('15 Oct 2026, 07:50', 'Ella Novak', 'Portal', 'EMERGENCY: whole house has no heating.', 'in')] },
  { id: 'T11', name: 'Aisha Khan', email: 'aisha.k@mail.co.uk', phone: '07700 903012', property: 'P8', room: 'Room 1', rent: 450, deposit: 519, depositRef: 'DPS-118734', depositScheme: 'DPS', start: '20 Feb 2026', end: '19 Feb 2027', status: 'Live', employment: 'Paralegal', emergency: 'Zara Khan · 07700 913012', rentDay: 20, kyc: verified(), comms: [] },
  { id: 'T12', name: 'Dan Moore', email: 'dan.moore@mail.co.uk', phone: '07700 903013', property: 'P8', room: 'Room 2', rent: 420, deposit: 484, depositRef: 'DPS-118735', depositScheme: 'DPS', start: '1 Mar 2026', end: '28 Feb 2027', status: 'Live', employment: 'Bus driver, First London', emergency: 'Kate Moore · 07700 913013', rentDay: 1, kyc: verified(), comms: [] },
  { id: 'T10', name: 'Tom Reid', email: 'tom.reid@mail.co.uk', phone: '07700 903014', property: 'P5', room: 'Room 3', rent: 440, deposit: 507, depositRef: 'DPS-201904', depositScheme: 'DPS', start: '1 Oct 2025', end: '30 Sep 2026', status: 'Moved out', employment: 'Student', emergency: 'Jo Reid · 07700 913014', rentDay: 1, kyc: verified(), moveOut: { notice: '1 Sep 2026', date: '30 Sep 2026', reason: 'End of tenancy', step: 4, deduction: 60, deductionNote: 'Carpet clean (stain by window)' }, comms: [c('3 Oct 2026, 12:00', 'Emma Thompson', 'Email', 'Deposit of £447 returned. £60 kept for carpet cleaning, with the invoice attached.', 'out', 'Your deposit · 5 Mill Lane Room 3')] },
];

/* ---------- sign-ups ---------- */
export interface SignUp { id: string; name: string; kind: 'Client (letting agent)' | 'Contractor · Trade' | 'Contractor · Site Inspector'; contact: string; email: string; phone: string; address: string; areas: string; trades?: string; company: string; applied: string; docs: KycDoc[]; status: 'Waiting' | 'More info asked' | 'Approved' | 'Rejected'; note?: string; comms: Comm[] }
export const SIGNUPS: SignUp[] = [
  { id: 'S1', name: 'BrightSpark Electrical', kind: 'Contractor · Trade', contact: 'Daniel Hughes', email: 'dan@brightspark.co.uk', phone: '07700 900123', address: '14 Canal Wharf, London N11', areas: 'London N1–LS8', trades: 'Electrician', company: 'Ltd company · 11928374', applied: '15 Oct 2026, 10:15', status: 'Waiting', comms: [], docs: [{ name: 'Photo ID', status: 'Uploaded', file: 'passport.pdf' }, { name: 'Right to work', status: 'Uploaded', file: 'right-to-work.pdf' }, { name: 'Public liability insurance', status: 'Uploaded', file: 'insurance.pdf', expires: '30 Jun 2027' }, { name: 'NICEIC certificate', status: 'Uploaded', file: 'niceic.pdf', expires: '14 Mar 2027' }, { name: 'Bank details', status: 'Uploaded', file: 'bank-letter.pdf' }] },
  { id: 'S2', name: 'HomeCheck Inspections', kind: 'Contractor · Site Inspector', contact: 'Nadia Karim', email: 'nadia@homecheck.co.uk', phone: '07700 900456', address: '2 Kings Court, London N4', areas: 'London, Tottenham', company: 'Sole trader', applied: '14 Oct 2026, 13:30', status: 'Waiting', comms: [], docs: [{ name: 'Photo ID', status: 'Uploaded', file: 'id.pdf' }, { name: 'Right to work', status: 'Uploaded', file: 'rtw.pdf' }, { name: 'Professional indemnity insurance', status: 'Missing' }, { name: 'Bank details', status: 'Uploaded', file: 'bank.pdf' }] },
  { id: 'S3', name: 'Parkside Lettings', kind: 'Client (letting agent)', contact: 'Owen Parks', email: 'owen@parkside.co.uk', phone: '020 7946 0404', address: '9 Otley Road, London N6', areas: 'London North', company: 'Ltd company · 09812233', applied: '13 Oct 2026, 09:05', status: 'Waiting', comms: [], docs: [{ name: 'Company registration', status: 'Uploaded', file: 'companies-house.pdf' }, { name: 'Billing details', status: 'Uploaded', file: 'billing.pdf' }, { name: 'Client money protection', status: 'Uploaded', file: 'cmp.pdf', expires: '31 Mar 2027' }] },
  { id: 'S4', name: 'DryRight Damp', kind: 'Contractor · Trade', contact: 'Gav Mills', email: 'gav@dryright.co.uk', phone: '07700 900789', address: '33 Low Road, London N10', areas: 'London', trades: 'Damp and mould', company: 'Sole trader', applied: '8 Oct 2026, 16:40', status: 'More info asked', note: 'Asked: Please upload public liability insurance (the one sent has ended).', comms: [c('9 Oct 2026, 10:10', 'Sarah Khan', 'Email', 'Please upload public liability insurance. The one sent ended in August.', 'out', 'More information needed for your LSP sign-up')], docs: [{ name: 'Photo ID', status: 'Uploaded', file: 'id.pdf' }, { name: 'Right to work', status: 'Uploaded', file: 'rtw.pdf' }, { name: 'Public liability insurance', status: 'Expired', file: 'insurance-2025.pdf', expires: '31 Aug 2026' }, { name: 'Bank details', status: 'Uploaded', file: 'bank.pdf' }] },
];

/* ---------- contractors ---------- */
export interface Bill { id: string; job: string; amount: number; date: string; status: 'Paid' | 'Unpaid' }
export interface Contractor { id: string; name: string; type: 'Trade' | 'Site Inspector'; trade: string; contact: string; email: string; phone: string; address: string; areas: string; joined: string; status: 'Active' | 'Paused' | 'Removed'; reason?: string; kyc: KycDoc[]; rating: number; /** Agreed hourly rate in £, set when the contractor joins. */ rate: number; pastJobs: number; bills: Bill[] }
const kycC = (cert: string, certExp: string, insExp: string, insStatus: DocStatus = 'Verified'): KycDoc[] => [
  { name: 'Photo ID', status: 'Verified', file: 'photo-id.pdf' }, { name: 'Right to work', status: 'Verified', file: 'right-to-work.pdf' },
  { name: 'Public liability insurance', status: insStatus, file: 'insurance.pdf', expires: insExp }, { name: cert, status: 'Verified', file: 'certificate.pdf', expires: certExp }, { name: 'Bank details', status: 'Verified', file: 'bank.pdf' }];
export const CONTRACTORS: Contractor[] = [
  { id: 'C1', name: 'HeatRight Ltd', type: 'Trade', trade: 'Gas engineer', contact: 'Gary Holt', email: 'gary@heatright.co.uk', phone: '07700 904001', address: '6 Elland Road, London N11', areas: 'London, Tottenham', joined: '4 Jan 2026', status: 'Active', kyc: kycC('Gas Safe registration', '12 Aug 2027', '1 Feb 2027'), rate: 60, rating: 4.8, pastJobs: 38, bills: [{ id: 'B-311', job: 'J4', amount: 190, date: '10 Oct 2026', status: 'Unpaid' }, { id: 'B-290', job: '—', amount: 85, date: '2 Oct 2026', status: 'Paid' }] },
  { id: 'C2', name: 'TopTile Roofing', type: 'Trade', trade: 'Roofer', contact: 'Andy Shaw', email: 'andy@toptile.co.uk', phone: '07700 904002', address: '21 Bramley Way, London N13', areas: 'London', joined: '19 Feb 2026', status: 'Active', kyc: kycC('CompetentRoofer card', '20 Dec 2026', '20 Dec 2026'), rate: 55, rating: 4.5, pastJobs: 17, bills: [] },
  { id: 'C3', name: 'SecureFix', type: 'Trade', trade: 'Locksmith', contact: 'Leah Ford', email: 'leah@securefix.co.uk', phone: '07700 904003', address: '3 Mill Hill, London N1', areas: 'London', joined: '1 Mar 2026', status: 'Paused', reason: 'Insurance ended on 30 Sep 2026', kyc: kycC('MLA membership', '1 May 2027', '30 Sep 2026', 'Expired'), rate: 50, rating: 4.2, pastJobs: 27, bills: [{ id: 'B-275', job: '—', amount: 120, date: '22 Sep 2026', status: 'Paid' }] },
  { id: 'C4', name: 'QuickPlumb', type: 'Trade', trade: 'Plumber', contact: 'Mo Iqbal', email: 'mo@quickplumb.co.uk', phone: '07700 904004', address: '88 York Road, London N9', areas: 'London, Wakefield', joined: '10 Jan 2026', status: 'Active', kyc: kycC('WaterSafe membership', '15 Apr 2027', '15 Apr 2027'), rate: 45, rating: 4.7, pastJobs: 52, bills: [{ id: 'B-305', job: 'J5', amount: 70, date: '7 Oct 2026', status: 'Paid' }] },
  { id: 'C5', name: 'Volt Electrical', type: 'Trade', trade: 'Electrician', contact: 'Sean Day', email: 'sean@voltelectrical.co.uk', phone: '07700 904005', address: '12 Ring Road, London N16', areas: 'London', joined: '6 Feb 2026', status: 'Active', kyc: kycC('NAPIT registration', '9 Jan 2027', '9 Jan 2027'), rate: 48, rating: 4.9, pastJobs: 30, bills: [{ id: 'B-299', job: 'J9', amount: 95, date: '4 Oct 2026', status: 'Unpaid' }] },
  { id: 'C6', name: 'Clear View Inspections', type: 'Site Inspector', trade: 'Site Inspector', contact: 'Ruth Ellis', email: 'ruth@clearview.co.uk', phone: '07700 904006', address: '40 Park Square, London N1', areas: 'London, Tottenham, Wakefield', joined: '15 Dec 2025', status: 'Active', kyc: kycC('AIIC membership', '28 Feb 2027', '28 Feb 2027'), rate: 40, rating: 4.6, pastJobs: 60, bills: [{ id: 'B-309', job: 'I2', amount: 95, date: '30 Sep 2026', status: 'Unpaid' }] },
  { id: 'C7', name: 'FixIt Carpentry', type: 'Trade', trade: 'Carpenter & locks', contact: 'Jo Lund', email: 'jo@fixitcarpentry.co.uk', phone: '07700 904007', address: '5 Tong Road, London N12', areas: 'London', joined: '30 Jul 2026', status: 'Active', kyc: kycC('City & Guilds carpentry', '—', '30 Jul 2027'), rate: 42, rating: 4.4, pastJobs: 9, bills: [] },
];

/* ---------- jobs ---------- */
export const JOB_STATUS = ['New', 'Quote sent', 'Quote accepted', 'Waiting approval', 'Landlord approval', 'Ready to assign', 'Assigned', 'In progress', 'Proof uploaded', 'Sent back', 'Approved', 'Invoiced', 'Declined'] as const;
export type JobStatus = typeof JOB_STATUS[number];
export interface JobEvent { at: string; by: string; text: string }
/** Extra work a contractor asks for while doing a job. The Office Admin declines it or sends it to the Supervisor. */
export interface FollowReq { title: string; note: string; hours: number; amount: number; at: string; status: 'Asked' | 'Sent to Supervisor' | 'Declined'; job?: string; reason?: string }
/** One row on a quote or invoice. */
export interface Line { activity: string; desc: string; qty: number; rate: number; code?: string }
export interface Job {
  id: string; title: string; property: string; managed: boolean; contractor?: string; cost: number; price: number; status: JobStatus; urgent?: boolean; reported: string; by: string; tenant?: string;
  admin: string; note?: string; proof?: string[]; category: 'Plumbing' | 'Heating' | 'Electrical' | 'Roofing' | 'Locks & doors' | 'Damp' | 'General'; comms: Comm[]; events: JobEvent[]; invoice?: string; sentBack?: string; declined?: string; landlordOk?: boolean;
  lines?: Line[]; quoteNo?: string; quoted?: string; validUntil?: string; quoteNote?: string; memo?: string; attachments?: string[]; acceptedBy?: string; acceptedAt?: string; billTo?: string; quoteEmail?: string;
  /** Managed jobs: hours and the contractor's hourly rate used to price the job. */ hours?: number; rate?: number;
  /** Over the limit: when the invoice went to the landlord to approve before work starts. */ landlordAsk?: string;
  /** The contractor's own invoice, uploaded with the photo proof. */ cInvoice?: { no: string; amount: number; at: string };
  followReq?: FollowReq; /** Set on a follow-up job: the job it came from. */ followOf?: string;
  /** Leased homes: work the owner is responsible for under the lease (roof and structure). */ ownerRepair?: boolean; /** Area or room in the home. */ area?: string; /** How the contractor gets in. */ access?: string; /** Photos sent with the report. */ photos?: string[];
}
const ev = (at: string, by: string, text: string): JobEvent => ({ at, by, text });
export const JOBS: Job[] = [
  { id: 'J1', title: 'Boiler repair', property: 'P6', managed: true, contractor: 'C1', cost: 360, price: 420, hours: 6, rate: 60, status: 'Waiting approval', reported: '14 Oct 2026, 07:40', by: 'Tenant · Sam Ahmed', tenant: 'T7', admin: 'et', category: 'Heating', note: 'No hot water. Diverter valve needs replacing.', comms: [c('14 Oct 2026, 15:10', 'Priya Shah', 'Call', 'Karen (landlord) is happy to go ahead. Wants the invoice by email.', 'out')], landlordOk: true, events: [ev('14 Oct 2026, 07:40', 'Sam Ahmed', 'Reported from the tenant portal'), ev('14 Oct 2026, 13:20', 'HeatRight Ltd', 'Quote received: £420'), ev('14 Oct 2026, 13:25', 'Priya Shah', 'Over the £200 job limit. Sent for Supervisor approval.')] },
  { id: 'J2', title: 'Roof leak', property: 'P2', managed: true, contractor: 'C2', cost: 550, price: 680, hours: 10, rate: 55, status: 'Waiting approval', reported: '13 Oct 2026, 07:12', by: 'Tenant · Jay Patel', tenant: 'T2', admin: 'ps', category: 'Roofing', note: 'Water coming through the bedroom ceiling after rain. Three slates missing.', comms: [c('13 Oct 2026, 16:50', 'Priya Shah', 'Email', 'Roof leak at 22 Oak Avenue needs a repair at £680. This is over your £300 job limit, so we need your OK before we book it.', 'out', 'Repair approval needed · 22 Oak Avenue'), c('14 Oct 2026, 09:22', 'David Hughes', 'Email', 'Can you send me photos of the ceiling first please?', 'in', 'Re: Repair approval needed · 22 Oak Avenue')], events: [ev('13 Oct 2026, 07:12', 'Jay Patel', 'Reported from the tenant portal'), ev('13 Oct 2026, 15:00', 'TopTile Roofing', 'Quote received: £680'), ev('13 Oct 2026, 16:44', 'Priya Shah', 'Over the £300 job limit. Sent for Supervisor approval.')] },
  { id: 'J3', title: 'Window lock', property: 'P3', managed: true, contractor: 'C7', cost: 168, price: 190, hours: 4, rate: 42, status: 'Waiting approval', reported: '12 Oct 2026, 11:00', by: 'Landlord · Rachel Evans', admin: 'jc', category: 'Locks & doors', note: 'Front window lock broken. Window will not close fully.', comms: [], events: [ev('12 Oct 2026, 11:00', 'Rachel Evans', 'Reported by email'), ev('12 Oct 2026, 16:30', 'FixIt Carpentry', 'Quote received: £190'), ev('12 Oct 2026, 16:35', 'James Carter', 'Over the £150 job limit. Sent for Supervisor approval.')] },
  { id: 'J4', title: 'Damp survey', property: 'P5', managed: true, contractor: 'C1', cost: 180, price: 240, hours: 3, rate: 60, cInvoice: { no: 'HR-2231', amount: 180, at: '14 Oct 2026, 16:10' }, followReq: { title: 'Clear gutter and treat damp wall', note: 'The damp comes from a blocked gutter above the bedroom. Clear the gutter, treat the wall and repaint it.', hours: 4, amount: 260, at: '14 Oct 2026, 16:12', status: 'Asked' }, status: 'Proof uploaded', reported: '9 Oct 2026, 09:00', by: 'Inspection', admin: 'et', category: 'Damp', proof: ['Before · wall', 'After · wall', 'Meter reading', 'Report page'], comms: [], events: [ev('9 Oct 2026, 09:00', 'Clear View Inspections', 'Found during routine inspection'), ev('9 Oct 2026, 13:30', 'Emma Thompson', 'Priced at £240 (HeatRight Ltd, 3 hours at £60). Under the £300 limit. Sent for Supervisor approval.'), ev('9 Oct 2026, 14:00', 'Sarah Khan', 'Approved by Supervisor. HeatRight Ltd has the job.'), ev('11 Oct 2026, 10:00', 'HeatRight Ltd', 'Work started'), ev('14 Oct 2026, 16:10', 'HeatRight Ltd', 'Finished. Uploaded 4 photos and invoice HR-2231 (£180)'), ev('14 Oct 2026, 16:12', 'HeatRight Ltd', 'Asked for follow-up work: Clear gutter and treat damp wall (£260)')] },
  { id: 'J5', title: 'Tap replacement', property: 'P4', managed: true, contractor: 'C4', cost: 67.5, price: 95, hours: 1.5, rate: 45, cInvoice: { no: 'QP-0412', amount: 67.5, at: '6 Oct 2026, 11:40' }, followReq: { title: 'Replace corroded pipe under sink', note: 'The pipe under the sink is corroded and will leak soon.', hours: 2, amount: 110, at: '6 Oct 2026, 11:45', status: 'Sent to Supervisor', job: 'J14' }, status: 'Invoiced', reported: '5 Oct 2026, 10:00', by: 'Office Admin', admin: 'et', category: 'Plumbing', proof: ['Before', 'After'], invoice: 'INV-1042', comms: [], events: [ev('5 Oct 2026, 10:00', 'Liam Murphy', 'Logged during viewing'), ev('5 Oct 2026, 10:15', 'Liam Murphy', 'Priced at £95 (QuickPlumb, 1.5 hours at £45). Sent for Supervisor approval.'), ev('5 Oct 2026, 11:00', 'Sarah Khan', 'Approved by Supervisor. QuickPlumb has the job.'), ev('6 Oct 2026, 09:00', 'QuickPlumb', 'Work started'), ev('6 Oct 2026, 11:40', 'QuickPlumb', 'Finished. Uploaded 2 photos and invoice QP-0412 (£67.50)'), ev('6 Oct 2026, 11:45', 'QuickPlumb', 'Asked for follow-up work: Replace corroded pipe under sink (£110)'), ev('7 Oct 2026, 09:05', 'Liam Murphy', 'Follow-up work sent for Supervisor approval as a new job'), ev('7 Oct 2026, 09:10', 'Sarah Khan', 'Work approved and record locked. QuickPlumb invoice QP-0412 approved for payment'), ev('7 Oct 2026, 09:12', 'Sarah Khan', 'Invoice INV-1042 sent to Tom Ahmed')] },
  { id: 'J6', title: 'Electric socket fault', property: 'P1', managed: true, contractor: 'C5', cost: 96, price: 140, hours: 2, rate: 48, status: 'In progress', reported: '15 Oct 2026, 07:58', by: 'Tenant · Michael Okafor', tenant: 'T1', admin: 'et', category: 'Electrical', note: 'Kitchen socket sparks when used.', comms: [], events: [ev('15 Oct 2026, 07:58', 'Michael Okafor', 'Reported from the tenant portal'), ev('15 Oct 2026, 08:20', 'Emma Thompson', 'Priced at £140 (Volt Electrical, 2 hours at £48). Under the £200 limit. Sent for Supervisor approval.'), ev('15 Oct 2026, 08:30', 'Sarah Khan', 'Approved by Supervisor. Volt Electrical has the job.'), ev('15 Oct 2026, 10:05', 'Volt Electrical', 'Work started')] },
  { id: 'J7', title: 'No heating (emergency)', property: 'P8', managed: true, cost: 0, price: 0, status: 'New', urgent: true, reported: '15 Oct 2026, 07:50', by: 'Tenant · Ella Novak', tenant: 'T9', admin: 'ps', category: 'Heating', note: 'Whole house has no heating. Five tenants affected.', comms: [], events: [ev('15 Oct 2026, 07:50', 'Ella Novak', 'Reported as an emergency from the tenant portal')] },
  { id: 'J12', title: 'Garden fence panel', property: 'P1', managed: true, contractor: 'C7', cost: 84, price: 120, hours: 2, rate: 42, status: 'Waiting approval', reported: '13 Oct 2026, 18:00', by: 'Tenant · Michael Okafor', tenant: 'T1', admin: 'et', category: 'General', note: 'One fence panel blown down in the wind.', comms: [], events: [ev('13 Oct 2026, 18:00', 'Michael Okafor', 'Reported from the tenant portal'), ev('14 Oct 2026, 10:00', 'Emma Thompson', 'Priced at £120 (FixIt Carpentry, 2 hours at £42). Under the £200 limit. Sent for Supervisor approval.')] },
  { id: 'J13', title: 'Leaking radiator valve', property: 'P5', managed: true, contractor: 'C4', cost: 90, price: 110, hours: 2, rate: 45, status: 'Assigned', reported: '14 Oct 2026, 19:30', by: 'Tenant · Liz Brown', tenant: 'T3', admin: 'et', category: 'Plumbing', note: 'Room 1 radiator valve dripping.', comms: [], events: [ev('14 Oct 2026, 19:30', 'Liz Brown', 'Reported from the tenant portal'), ev('14 Oct 2026, 20:00', 'Emma Thompson', 'Priced at £110 (QuickPlumb, 2 hours at £45). Under the £300 limit. Sent for Supervisor approval.'), ev('15 Oct 2026, 08:45', 'Sarah Khan', 'Approved by Supervisor. QuickPlumb has the job for 16 Oct.')] },
  { id: 'J14', title: 'Replace corroded pipe under sink', property: 'P4', managed: true, contractor: 'C4', cost: 90, price: 110, hours: 2, rate: 45, status: 'Waiting approval', reported: '7 Oct 2026, 09:05', by: 'Contractor · QuickPlumb (follow-up)', admin: 'lm', category: 'Plumbing', followOf: 'J5', note: 'The pipe under the sink is corroded and will leak soon.', comms: [], events: [ev('6 Oct 2026, 11:45', 'QuickPlumb', 'Asked for follow-up work while doing "Tap replacement"'), ev('7 Oct 2026, 09:05', 'Liam Murphy', 'Checked the photos and sent for Supervisor approval: £110')] },
  { id: 'J8', title: 'Leaking shower', property: 'P9', managed: false, contractor: 'C4', cost: 120, price: 180, status: 'Quote sent', quoteNo: 'Q-2401', quoted: '14 Oct 2026, 12:00', validUntil: '13 Nov 2026', lines: [{ activity: 'Call-out', desc: 'Attend site and trace leak under shower tray', qty: 1, rate: 60 }, { activity: 'Materials', desc: 'Shower tray waste kit and silicone sealant', qty: 1, rate: 30 }, { activity: 'Labour', desc: 'Reseal tray and replace waste (hourly)', qty: 2, rate: 45 }], reported: '14 Oct 2026, 09:30', by: 'Client · Rosewood Lettings', admin: 'et', category: 'Plumbing', note: 'Shower tray leaking into the kitchen ceiling below.', comms: [c('14 Oct 2026, 12:00', 'Emma Thompson', 'Email', 'Quote for the shower repair: £180 including parts.', 'out', 'Quote · 27 Grange Avenue')], events: [ev('14 Oct 2026, 09:30', 'Claire Rose', 'Requested from the client portal'), ev('14 Oct 2026, 12:00', 'Emma Thompson', 'Quote sent: £180')] },
  { id: 'J11', title: 'Blocked kitchen sink', property: 'P12', managed: false, contractor: 'C4', cost: 60, price: 95, status: 'Quote accepted', quoteNo: 'Q-2399', quoted: '13 Oct 2026, 16:00', validUntil: '12 Nov 2026', lines: [{ activity: 'Call-out', desc: 'Attend site, clear blocked kitchen sink', qty: 1, rate: 60 }, { activity: 'Materials', desc: 'Replacement bottle trap', qty: 1, rate: 35 }], reported: '13 Oct 2026, 14:00', by: 'Client · City Key Agents', admin: 'jc', category: 'Plumbing', comms: [], events: [ev('13 Oct 2026, 14:00', 'Aisha Noor', 'Requested from the client portal'), ev('13 Oct 2026, 16:00', 'James Carter', 'Quote sent: £95'), ev('14 Oct 2026, 09:10', 'Aisha Noor', 'Quote accepted')] },
  { id: 'J9', title: 'Replace extractor fan', property: 'P11', managed: false, contractor: 'C5', cost: 95, price: 150, status: 'Invoiced', quoteNo: 'Q-2396', quoted: '2 Oct 2026, 14:00', validUntil: '1 Nov 2026', lines: [{ activity: 'Materials', desc: 'Extractor fan 100mm with timer', qty: 1, rate: 54 }, { activity: 'Labour', desc: 'Remove old fan, fit and test new fan (hourly)', qty: 2, rate: 48 }], reported: '2 Oct 2026, 11:00', by: 'Client · Northgate Homes', admin: 'lm', category: 'Electrical', proof: ['Before', 'After'], invoice: 'INV-1043', comms: [], events: [ev('2 Oct 2026, 11:00', 'Ben Hall', 'Requested from the client portal'), ev('2 Oct 2026, 14:00', 'Liam Murphy', 'Quote sent: £150'), ev('2 Oct 2026, 16:20', 'Ben Hall', 'Quote accepted'), ev('3 Oct 2026, 10:00', 'Volt Electrical', 'Work started'), ev('3 Oct 2026, 12:30', 'Volt Electrical', 'Uploaded 2 photos'), ev('4 Oct 2026, 09:00', 'Sarah Khan', 'Approved and invoice INV-1043 sent')] },
  { id: 'J10', title: 'Door rehang', property: 'P10', managed: false, cost: 0, price: 0, status: 'New', reported: '15 Oct 2026, 08:05', by: 'Client · Rosewood Lettings', admin: 'et', category: 'Locks & doors', note: 'Bedroom door catches on the carpet and will not close.', comms: [], events: [ev('15 Oct 2026, 08:05', 'Claire Rose', 'Requested from the client portal')] },
];

/* ---------- inspections ---------- */
export const INSP_KINDS = ['Move-in', 'Routine', 'Move-out', 'Gas safety', 'Electrical', 'Fire safety'] as const;
export type InspKind = typeof INSP_KINDS[number];
export type InspScope = 'Whole property' | 'HMO room' | 'Communal areas';
export interface InspRoom { name: string; photos: number; note: string; diff?: boolean; condition: 'Good' | 'Fair' | 'Poor' }
export interface Inspection { id: string; kind: InspKind; scope: InspScope; property: string; room?: string; date: string; time: string; inspector?: string; status: 'Not assigned' | 'Booked' | 'Report uploaded' | 'Sent back' | 'Locked'; rooms: InspRoom[]; meters: { gas?: string; electric?: string; water?: string }; keys: number; doneAt?: string; notes?: string; summary?: string; result?: 'Pass' | 'Fail' }
export const INSPECTIONS: Inspection[] = [
  { id: 'I1', kind: 'Move-in', scope: 'Whole property', property: 'P13', date: '20 Oct 2026', time: '11:00', inspector: 'C6', status: 'Booked', rooms: [], meters: {}, keys: 0, notes: 'Ryan Cole moves in. Check the dog flap the landlord fitted.' },
  { id: 'I5', kind: 'Gas safety', scope: 'Whole property', property: 'P8', date: '17 Oct 2026', time: '09:00', inspector: 'C1', status: 'Booked', rooms: [], meters: {}, keys: 0, notes: 'Gas certificate is overdue. Boiler also has no heating (job J7).' },
  { id: 'I8', kind: 'Electrical', scope: 'Whole property', property: 'P3', date: '18 Oct 2026', time: '13:00', inspector: 'C5', status: 'Booked', rooms: [], meters: {}, keys: 0, notes: 'EICR due on 18 Oct.' },
  { id: 'I2', kind: 'Move-out', scope: 'HMO room', property: 'P5', room: 'Room 3', date: '30 Sep 2026', time: '14:00', inspector: 'C6', status: 'Report uploaded', doneAt: '30 Sep 2026, 14:52', rooms: [{ name: 'Bedroom', photos: 6, note: 'Carpet stain by the window', diff: true, condition: 'Fair' }, { name: 'Shared kitchen', photos: 4, note: 'Clean', condition: 'Good' }, { name: 'Shared bathroom', photos: 4, note: 'Clean', condition: 'Good' }], meters: { gas: '04412', electric: '18820' }, keys: 2, summary: 'Room left in good order apart from a carpet stain. Compared with the move-in report from 1 Oct 2025.' },
  { id: 'I3', kind: 'Move-out', scope: 'Whole property', property: 'P7', date: '31 Oct 2026', time: '10:00', status: 'Not assigned', rooms: [], meters: {}, keys: 0, notes: 'Rob Hughes leaves on 31 Oct.' },
  { id: 'I9', kind: 'Routine', scope: 'Communal areas', property: 'P5', date: '24 Oct 2026', time: '15:00', status: 'Not assigned', rooms: [], meters: {}, keys: 0 },
  { id: 'I4', kind: 'Routine', scope: 'Whole property', property: 'P2', date: '9 Oct 2026', time: '09:30', inspector: 'C6', status: 'Locked', doneAt: '9 Oct 2026, 10:41', rooms: [{ name: 'Living room', photos: 5, note: 'Good', condition: 'Good' }, { name: 'Kitchen', photos: 5, note: 'Good', condition: 'Good' }, { name: 'Bedroom 1', photos: 3, note: 'Good', condition: 'Good' }, { name: 'Bathroom', photos: 3, note: 'Mould on the ceiling', diff: true, condition: 'Poor' }], meters: { gas: '11208', electric: '30551', water: '00921' }, keys: 3, summary: 'House in good order. Mould on the bathroom ceiling needs treating.' },
  { id: 'I7', kind: 'Move-in', scope: 'Whole property', property: 'P3', date: '1 Oct 2026', time: '12:00', inspector: 'C6', status: 'Locked', doneAt: '1 Oct 2026, 12:48', rooms: [{ name: 'Living room', photos: 6, note: 'New carpet', condition: 'Good' }, { name: 'Kitchen', photos: 5, note: 'Good', condition: 'Good' }, { name: 'Bedroom 1', photos: 4, note: 'Good', condition: 'Good' }, { name: 'Bedroom 2', photos: 4, note: 'Small mark on the wall', condition: 'Fair' }, { name: 'Bathroom', photos: 3, note: 'Good', condition: 'Good' }], meters: { electric: '22104', water: '00412' }, keys: 2, summary: 'Flat ready for Kofi Mensah. Signed by the tenant.' },
  { id: 'I6', kind: 'Routine', scope: 'Whole property', property: 'P1', date: '2 Jul 2026', time: '10:00', inspector: 'C6', status: 'Locked', doneAt: '2 Jul 2026, 10:55', rooms: [{ name: 'Living room', photos: 4, note: 'Good', condition: 'Good' }, { name: 'Kitchen', photos: 4, note: 'Good', condition: 'Good' }, { name: 'Garden', photos: 2, note: 'Tidy', condition: 'Good' }], meters: { gas: '08812', electric: '41200' }, keys: 3, summary: 'All good.' },
];

/* ---------- safety & compliance ---------- */
export const CERT_KINDS = ['Gas safety', 'Electrical (EICR)', 'Energy (EPC)', 'Fire alarm', 'HMO licence'] as const;
export type CertKind = typeof CERT_KINDS[number];
export type CertStatus = 'Valid' | 'Due soon' | 'Overdue' | 'Booked' | 'Proof to check' | 'Missing';
export interface SafetyCert { id: string; property: string; kind: CertKind; issued?: string; expires: string; days: number; status: CertStatus; contractor?: string; file?: string; history: { issued: string; expires: string; file: string; by: string }[]; reminders: { at: string; to: string }[] }
const cert = (id: string, property: string, kind: CertKind, issued: string | undefined, expires: string, extra: Partial<SafetyCert> = {}): SafetyCert => {
  const days = issued ? daysFrom(expires) : -999;
  const status: CertStatus = !issued ? 'Missing' : days < 0 ? 'Overdue' : days <= 30 ? 'Due soon' : 'Valid';
  return { id, property, kind, issued, expires, days, status, file: issued ? kind.split(' ')[0].toLowerCase() + '-certificate.pdf' : undefined, history: [], reminders: [], ...extra };
};
export const SAFETY: SafetyCert[] = [
  cert('SC1', 'P7', 'Gas safety', '21 Oct 2025, 10:30', '21 Oct 2026', { status: 'Booked', contractor: 'C1' }),
  cert('SC2', 'P3', 'Electrical (EICR)', '18 Oct 2021, 13:00', '18 Oct 2026', { status: 'Booked', contractor: 'C5', reminders: [{ at: '19 Aug 2026, 09:00', to: 'James Carter' }] }),
  cert('SC3', 'P5', 'Fire alarm', '27 Oct 2025, 09:15', '27 Oct 2026'),
  cert('SC4', 'P5', 'HMO licence', '12 Nov 2021, 12:00', '12 Nov 2026', { reminders: [{ at: '13 Sep 2026, 09:00', to: 'Emma Thompson' }] }),
  cert('SC5', 'P4', 'Gas safety', '14 Oct 2026, 15:40', '14 Oct 2027', { status: 'Proof to check', contractor: 'C1', history: [{ issued: '14 Nov 2025, 11:00', expires: '14 Nov 2026', file: 'gas-certificate-2025.pdf', by: 'HeatRight Ltd' }] }),
  cert('SC6', 'P8', 'Gas safety', '2 Oct 2025, 08:45', '2 Oct 2026', { contractor: 'C1', reminders: [{ at: '3 Aug 2026, 09:00', to: 'Priya Shah' }, { at: '2 Oct 2026, 09:00', to: 'Priya Shah' }] }),
  cert('SC7', 'P1', 'Gas safety', '3 Apr 2026, 10:20', '3 Apr 2027', { contractor: 'C1', history: [{ issued: '1 Apr 2025, 09:30', expires: '1 Apr 2026', file: 'gas-certificate-2025.pdf', by: 'HeatRight Ltd' }] }),
  cert('SC8', 'P1', 'Electrical (EICR)', '20 Mar 2024, 11:00', '20 Mar 2029'),
  cert('SC9', 'P1', 'Energy (EPC)', '4 Feb 2022, 14:00', '4 Feb 2032'),
  cert('SC10', 'P2', 'Gas safety', '10 Jan 2026, 09:00', '10 Jan 2027'),
  cert('SC11', 'P2', 'Electrical (EICR)', '15 Jan 2025, 10:00', '15 Jan 2030'),
  cert('SC12', 'P2', 'Energy (EPC)', '8 Dec 2020, 12:00', '8 Dec 2030'),
  cert('SC13', 'P3', 'Energy (EPC)', '2 Jun 2026, 15:30', '2 Jun 2036'),
  cert('SC14', 'P4', 'Electrical (EICR)', '1 Mar 2026, 10:00', '1 Mar 2031'),
  cert('SC15', 'P4', 'Energy (EPC)', '28 Feb 2026, 11:00', '28 Feb 2036'),
  cert('SC16', 'P5', 'Gas safety', '19 Feb 2026, 09:00', '19 Feb 2027'),
  cert('SC17', 'P5', 'Electrical (EICR)', '19 Feb 2026, 13:00', '19 Feb 2031'),
  cert('SC18', 'P5', 'Energy (EPC)', '1 Feb 2019, 10:00', '1 Feb 2029'),
  cert('SC19', 'P6', 'Gas safety', '5 May 2026, 09:30', '5 May 2027', { history: [{ issued: '2 May 2025, 10:00', expires: '2 May 2026', file: 'gas-certificate-2025.pdf', by: 'HeatRight Ltd' }] }),
  cert('SC20', 'P6', 'Electrical (EICR)', '1 May 2026, 14:00', '1 May 2031', { history: [{ issued: '28 Apr 2021, 11:00', expires: '28 Apr 2026', file: 'eicr-report-2021.pdf', by: 'Volt Electrical' }] }),
  cert('SC21', 'P6', 'Energy (EPC)', '5 May 2021, 10:00', '5 May 2031'),
  cert('SC22', 'P7', 'Electrical (EICR)', '10 Sep 2026, 12:00', '10 Sep 2031'),
  cert('SC23', 'P7', 'Energy (EPC)', '10 Sep 2026, 15:00', '10 Sep 2036'),
  cert('SC24', 'P8', 'Electrical (EICR)', '12 Jan 2023, 11:00', '12 Jan 2028'),
  cert('SC25', 'P8', 'Energy (EPC)', '12 Jan 2023, 14:00', '12 Jan 2033'),
  cert('SC26', 'P8', 'Fire alarm', '20 Jan 2026, 10:00', '20 Jan 2027'),
  cert('SC27', 'P8', 'HMO licence', '1 Feb 2024, 12:00', '1 Feb 2029'),
  cert('SC28', 'P13', 'Gas safety', '1 Aug 2026, 10:00', '1 Aug 2027'),
  cert('SC29', 'P13', 'Electrical (EICR)', undefined, '—'),
  cert('SC30', 'P13', 'Energy (EPC)', '1 Aug 2026, 13:00', '1 Aug 2036'),
  cert('SC31', 'P14', 'Gas safety', undefined, '—'),
  cert('SC32', 'P14', 'Electrical (EICR)', undefined, '—'),
  cert('SC33', 'P14', 'Energy (EPC)', '20 Jun 2024, 11:00', '20 Jun 2034'),
];

/* ---------- rent ---------- */
export interface Payment { date: string; amount: number; note: string }
export interface RentRow { id: string; tenant: string; month: string; due: string; amount: number; paid: number; history: Payment[]; reminders: { at: string; by: string }[] }
export const RENT: RentRow[] = [
  { id: 'R1', tenant: 'T1', month: 'Oct 2026', due: '1 Oct 2026', amount: 1250, paid: 1250, history: [{ date: '1 Oct 2026', amount: 1250, note: 'Bank transfer' }], reminders: [] },
  { id: 'R2', tenant: 'T2', month: 'Oct 2026', due: '15 Oct 2026', amount: 1450, paid: 0, history: [], reminders: [{ at: '12 Oct 2026, 09:00', by: 'System' }] },
  { id: 'R3', tenant: 'T3', month: 'Oct 2026', due: '1 Oct 2026', amount: 440, paid: 0, history: [], reminders: [{ at: '7 Oct 2026, 10:00', by: 'System' }, { at: '12 Oct 2026, 10:00', by: 'System' }] },
  { id: 'R4', tenant: 'T4', month: 'Oct 2026', due: '1 Oct 2026', amount: 440, paid: 440, history: [{ date: '1 Oct 2026', amount: 440, note: 'Standing order' }], reminders: [] },
  { id: 'R5', tenant: 'T5', month: 'Oct 2026', due: '12 Oct 2026', amount: 875, paid: 875, history: [{ date: '12 Oct 2026', amount: 875, note: 'Bank transfer' }], reminders: [] },
  { id: 'R6', tenant: 'T6', month: 'Oct 2026', due: '5 Oct 2026', amount: 430, paid: 200, history: [{ date: '9 Oct 2026', amount: 200, note: 'Part payment' }], reminders: [{ at: '9 Oct 2026, 10:00', by: 'Emma Thompson' }] },
  { id: 'R7', tenant: 'T7', month: 'Oct 2026', due: '5 Oct 2026', amount: 1150, paid: 1150, history: [{ date: '5 Oct 2026', amount: 1150, note: 'Bank transfer' }], reminders: [] },
  { id: 'R8', tenant: 'T8', month: 'Oct 2026', due: '1 Oct 2026', amount: 875, paid: 875, history: [{ date: '29 Sep 2026', amount: 875, note: 'Paid before move-in' }], reminders: [] },
  { id: 'R9', tenant: 'T9', month: 'Oct 2026', due: '10 Oct 2026', amount: 430, paid: 0, history: [], reminders: [{ at: '13 Oct 2026, 10:00', by: 'System' }] },
  { id: 'R10', tenant: 'T11', month: 'Oct 2026', due: '20 Oct 2026', amount: 450, paid: 0, history: [], reminders: [] },
  { id: 'R11', tenant: 'T12', month: 'Oct 2026', due: '1 Oct 2026', amount: 420, paid: 420, history: [{ date: '1 Oct 2026', amount: 420, note: 'Standing order' }], reminders: [] },
];

/* ---------- invoices ---------- */
export interface Invoice { /** Repair covered by the landlord's plan (maintenance allowance): nothing to pay. */ covered?: boolean; /** Landlord said they paid by bank transfer; LSP still checks the bank. */ reportedPaid?: string; vat?: number; vatRate?: number; vatNo?: string; id: string; to: string; toKind: 'Landlord' | 'Client'; job?: string; amount: number; paid: number; terms: string; issued: string; due: string; overdue: boolean; items: { desc: string; amount: number; activity?: string; qty?: number; rate?: number; code?: string }[]; site?: string; note?: string; memo?: string; attachments?: string[]; billTo?: string; paidAt?: string }
export const INVOICES: Invoice[] = [
  { id: 'INV-1042', to: 'L4', toKind: 'Landlord', job: 'J5', amount: 95, paid: 95, terms: 'Straight away', issued: '7 Oct 2026', due: '7 Oct 2026', overdue: false, items: [{ desc: 'Tap replacement, 31 Ash Grove', amount: 95 }] },
  { id: 'INV-1043', to: 'A2', toKind: 'Client', job: 'J9', amount: 150, paid: 0, terms: '30 days', issued: '4 Oct 2026', due: '3 Nov 2026', overdue: false, items: [{ activity: 'Materials', desc: 'Extractor fan 100mm with timer', qty: 1, rate: 54, amount: 54 }, { activity: 'Labour', desc: 'Remove old fan, fit and test new fan (hourly)', qty: 2, rate: 48, amount: 96 }], site: '88 Victoria Road' },
  { id: 'INV-1037', to: 'A1', toKind: 'Client', amount: 320, paid: 120, terms: '30 days', issued: '2 Sep 2026', due: '2 Oct 2026', overdue: true, items: [{ desc: 'Boiler service, 27 Grange Avenue', amount: 140 }, { desc: 'Replace smoke alarms, Flat 6, 2 Wharf Street', amount: 180 }] },
  { id: 'INV-1039', to: 'L2', toKind: 'Landlord', amount: 210, paid: 0, terms: 'Straight away', issued: '20 Sep 2026', due: '20 Sep 2026', overdue: true, items: [{ desc: 'Clear blocked gutter, 22 Oak Avenue', amount: 210 }] },
  { id: 'INV-1044', to: 'L6', toKind: 'Landlord', amount: 480, paid: 480, terms: 'Straight away', issued: '11 Oct 2026', due: '11 Oct 2026', overdue: false, items: [{ desc: 'New kitchen extractor and wiring, 14 Elm Road', amount: 480 }] },
];

/* ---------- team tasks ---------- */
export interface Task { id: string; title: string; admin: string; from?: string; due: string; late: boolean; done: boolean; created: string; area: string; link?: { route: string; id?: string } }
export const TASKS: Task[] = [
  { id: 'K1', from: SUPERVISOR, title: 'Call Paul Bennett about 2 flats', admin: 'et', due: '15 Oct 2026', late: false, done: false, created: '15 Oct 2026, 09:15', area: 'Enquiries', link: { route: 'enquiries', id: 'E1' } },
  { id: 'K2', from: SUPERVISOR, title: 'Chase agreement signature: Kieran Walsh', admin: 'et', due: '14 Oct 2026', late: true, done: false, created: '11 Oct 2026, 10:10', area: 'Lettings', link: { route: 'lettings', id: 'AP5' } },
  { id: 'K3', title: 'Confirm EICR visit at Flat 2, 9 Park Street', admin: 'jc', due: '16 Oct 2026', late: false, done: false, created: '13 Oct 2026, 09:00', area: 'Safety', link: { route: 'safety', id: 'SC2' } },
  { id: 'K4', title: 'Record Jay Patel rent', admin: 'ps', due: '15 Oct 2026', late: false, done: false, created: '12 Oct 2026, 09:00', area: 'Rent', link: { route: 'rent', id: 'R2' } },
  { id: 'K5', title: 'Fix heating at 3 Park Road (emergency)', admin: 'ps', due: '15 Oct 2026', late: false, done: false, created: '15 Oct 2026, 07:55', area: 'Jobs', link: { route: 'jobs', id: 'J7' } },
  { id: 'K6', from: SUPERVISOR, title: 'Review move-out report Room 3, 5 Mill Lane', admin: 'et', due: '13 Oct 2026', late: true, done: false, created: '30 Sep 2026, 15:00', area: 'Inspections', link: { route: 'inspections', id: 'I2' } },
  { id: 'K7', title: 'Check KYC documents for Hannah Moss', admin: 'et', due: '16 Oct 2026', late: false, done: false, created: '14 Oct 2026, 18:30', area: 'Lettings', link: { route: 'lettings', id: 'AP4' } },
  { id: 'K8', title: 'Upload referencing result: Kieran Walsh', admin: 'et', due: '16 Oct 2026', late: false, done: false, created: '13 Oct 2026, 09:00', area: 'Lettings', link: { route: 'lettings', id: 'AP5' } },
  { id: 'K9', from: SUPERVISOR, title: 'Send quote to Rosewood: door rehang', admin: 'et', due: '16 Oct 2026', late: false, done: false, created: '15 Oct 2026, 08:10', area: 'Clients', link: { route: 'jobs', id: 'J10' } },
  { id: 'K10', title: 'Chase overdue invoice INV-1039', admin: 'ps', due: '12 Oct 2026', late: true, done: false, created: '5 Oct 2026, 09:00', area: 'Rent', link: { route: 'rent' } },
  { id: 'K11', title: 'Book gas safety check, 3 Park Road', admin: 'ps', due: '10 Oct 2026', late: true, done: false, created: '3 Aug 2026, 09:00', area: 'Safety', link: { route: 'safety', id: 'SC6' } },
  { id: 'K12', title: 'Assign inspector for 8 King Street move-out', admin: 'jc', due: '17 Oct 2026', late: false, done: false, created: '2 Oct 2026, 09:00', area: 'Inspections', link: { route: 'inspections', id: 'I3' } },
  { id: 'K13', title: 'Call Daniel Price about portal login', admin: 'et', due: '15 Oct 2026', late: false, done: false, created: '13 Oct 2026, 11:35', area: 'Lettings', link: { route: 'lettings', id: 'AP2' } },
  { id: 'K14', title: 'Send September statement to Helen Brooks', admin: 'et', due: '5 Oct 2026', late: false, done: true, created: '1 Oct 2026, 09:00', area: 'Rent' },
  { id: 'K15', title: 'Welcome call to Kofi Mensah', admin: 'jc', due: '2 Oct 2026', late: false, done: true, created: '1 Oct 2026, 13:05', area: 'Tenants' },
  { id: 'K16', title: 'Collect keys for Room 3, 5 Mill Lane', admin: 'et', due: '30 Sep 2026', late: false, done: true, created: '25 Sep 2026, 10:00', area: 'Tenants' },
];

/* ---------- audit history ---------- */
export interface Activity { id: string; at: string; who: string; what: string; area: string }
export const ACTIVITY: Activity[] = [
  { id: 'H1', at: '15 Oct 2026, 10:15', who: 'System', what: 'New sign-up: BrightSpark Electrical', area: 'Sign-Ups' },
  { id: 'H2', at: '15 Oct 2026, 10:05', who: 'Volt Electrical', what: 'Started work: Electric socket fault at 12 Oak Street', area: 'Jobs' },
  { id: 'H3', at: '15 Oct 2026, 09:12', who: 'Website form', what: 'New enquiry from Paul Bennett', area: 'Enquiries' },
  { id: 'H4', at: '15 Oct 2026, 08:40', who: 'Website form', what: 'New enquiry from Lucy Grant', area: 'Enquiries' },
  { id: 'H5', at: '15 Oct 2026, 07:50', who: 'Ella Novak (tenant)', what: 'Reported emergency: no heating at 3 Park Road', area: 'Jobs' },
  { id: 'H6', at: '14 Oct 2026, 18:24', who: 'Hannah Moss (applicant)', what: 'Uploaded all 5 KYC documents', area: 'Lettings' },
  { id: 'H7', at: '14 Oct 2026, 16:30', who: 'Emma Thompson', what: 'Sent Sophie Turner for Supervisor review', area: 'Lettings' },
  { id: 'H8', at: '14 Oct 2026, 15:40', who: 'HeatRight Ltd', what: 'Uploaded new gas certificate for 31 Ash Grove', area: 'Safety' },
  { id: 'H9', at: '14 Oct 2026, 13:25', who: 'Priya Shah', what: 'Sent boiler repair (£420) for approval', area: 'Approvals' },
  { id: 'H10', at: '13 Oct 2026, 16:44', who: 'Priya Shah', what: 'Sent roof leak quote (£680) for approval', area: 'Approvals' },
  { id: 'H11', at: '13 Oct 2026, 12:00', who: 'Sarah Khan', what: 'Approved Ryan Cole and booked move-in for 20 Oct 2026, 11:00', area: 'Lettings' },
  { id: 'H12', at: '13 Oct 2026, 10:00', who: 'Sarah Khan', what: 'Sent login email to new landlord Fiona Clarke', area: 'Landlords' },
  { id: 'H13', at: '9 Oct 2026, 15:40', who: 'Sarah Khan', what: 'Rejected applicant Ben Carter: could not show the right to rent', area: 'Lettings' },
  { id: 'H14', at: '9 Oct 2026, 12:10', who: 'Sarah Khan', what: 'Locked routine inspection report for 22 Oak Avenue', area: 'Records' },
  { id: 'H15', at: '30 Sep 2026, 17:00', who: 'Sarah Khan', what: 'Disabled Office Admin account: Noah Bell', area: 'Team Work' },
];

export interface LockedRecord { id: string; kind: 'Inspection report' | 'Finished job'; title: string; locked: string; by: string; versions: { when: string; who: string; reason: string }[] }
export const LOCKED: LockedRecord[] = [
  { id: 'LR1', kind: 'Inspection report', title: 'Routine inspection · 22 Oak Avenue', locked: '9 Oct 2026, 12:10', by: 'Sarah Khan', versions: [] },
  { id: 'LR2', kind: 'Finished job', title: 'Tap replacement · 31 Ash Grove', locked: '7 Oct 2026, 09:10', by: 'Sarah Khan', versions: [] },
  { id: 'LR3', kind: 'Finished job', title: 'Extractor fan · 88 Victoria Road', locked: '4 Oct 2026, 09:00', by: 'Sarah Khan', versions: [] },
  { id: 'LR4', kind: 'Inspection report', title: 'Move-in · Flat 2, 9 Park Street', locked: '1 Oct 2026, 13:00', by: 'James Carter', versions: [{ when: '2 Oct 2026, 09:30', who: 'Sarah Khan', reason: 'Meter reading typed wrong (22104 not 22014)' }] },
];

export interface SupportReq { id: string; from: string; reason: string; asked: string; status: 'Waiting' | 'Allowed' | 'Refused' | 'Ended'; until?: number; looks: string[] }
export const SUPPORT: SupportReq[] = [
  { id: 'SR1', from: 'Genesis tech team · Ali R.', reason: 'Rent page shows the wrong total for 5 Mill Lane. Need to look at the rent records to fix it.', asked: '15 Oct 2026, 09:40', status: 'Waiting', looks: [] },
  { id: 'SR2', from: 'Genesis tech team · Mia K.', reason: 'Email reminders not sending for two tenants.', asked: '10 Oct 2026, 11:00', status: 'Ended', looks: ['10 Oct 2026, 11:05 · Opened Rent & Invoices', '10 Oct 2026, 11:09 · Opened tenant Liz Brown', '10 Oct 2026, 13:00 · Access ended by itself'] },
];

/* ---------- charts for dashboard and reports ---------- */
export const RENT_CHART = [{ m: 'May', v: 41.2, due: 43.0 }, { m: 'Jun', v: 43.8, due: 45.1 }, { m: 'Jul', v: 44.1, due: 45.6 }, { m: 'Aug', v: 46.0, due: 47.2 }, { m: 'Sep', v: 47.3, due: 48.9 }, { m: 'Oct', v: 48.2, due: 51.3 }];
export const JOBS_CHART = [{ m: 'May', done: 21, late: 3 }, { m: 'Jun', done: 25, late: 2 }, { m: 'Jul', done: 19, late: 4 }, { m: 'Aug', done: 28, late: 2 }, { m: 'Sep', done: 31, late: 3 }, { m: 'Oct', done: 14, late: 1 }];
export const SPEND_CHART = [{ m: 'May', v: 3.1 }, { m: 'Jun', v: 4.4 }, { m: 'Jul', v: 2.9 }, { m: 'Aug', v: 5.2 }, { m: 'Sep', v: 4.8 }, { m: 'Oct', v: 2.6 }];

/* ---------- property management plans (saved snapshots, never changed after saving) ---------- */
export interface PlanTable { title: string; cols: string[]; rows: string[][]; empty: string }
export interface PlanData { ref: string; address: string; area: string; landlord: string[]; admin: string; overview: [string, string][]; tables: PlanTable[]; missing: { text: string; blocks: boolean }[] }
export interface PlanVersion { id: string; property: string; version: number; at: string; by: string; data: PlanData }

/* ---------- requests sent to the Supervisor (things an Office Admin cannot do alone) ---------- */
export type ReqKind = 'New landlord' | 'Unlock record' | 'Plan change' | 'Pause contractor' | 'Other';
export interface SupReq { id: string; kind: ReqKind; from?: string; title: string; about: string; at: string; status: 'Waiting' | 'Done' | 'Declined'; reply?: string; answered?: string; link?: { route: string; id?: string }; data?: Record<string, string> }
export const REQUESTS: SupReq[] = [
  { id: 'Q1', kind: 'New landlord', title: 'Create landlord account: Imran Ali', about: '3 terraced houses near Mill Lane, Tottenham, Tottenham, London N17 · wants the 20% plan', at: '14 Oct 2026, 16:20', status: 'Waiting', link: { route: 'enquiries', id: 'E7' }, data: { name: 'Imran Ali', email: 'imran.ali@mail.co.uk', phone: '07700 901007', plan: '20', enquiry: 'E7' } },
  { id: 'Q2', kind: 'Unlock record', title: 'Unlock routine inspection, 12 Oak Street', about: 'Meter reading typed wrong (gas 4512 should be 4521).', at: '3 Jul 2026, 09:10', status: 'Done', reply: 'Unlocked, corrected and locked again. Earlier version kept.', answered: '3 Jul 2026, 11:42', link: { route: 'inspections', id: 'I6' } },
];

/* ---------- Planned Switch: landlords who already pay another managing agent ---------- */
export const SW_STAGES = ['New enquiry', 'Contact pending', 'Assessment', 'Decision', 'Proposal sent', 'Agreement signed', 'Onboarding', 'Activated'] as const;
export type SwRoute = 'Ready to plan' | 'Future switch' | 'Needs clarification';
/** A fact about the current agent or the dates. Estimates are never shown as confirmed. */
export interface SwFact { value: string; confirmed: boolean }
export interface SwProp {
  id: string; address: string; postcode: string; area: string; type: 'House' | 'Flat' | 'HMO'; beds: number; rent: number; stage: number; route?: SwRoute; clarify?: string;
  agent: { name: string; fee: string; vat: string; extras: string; contract?: string; endDate: SwFact; notice: SwFact; method: string; continuing: SwFact };
  dates: { safeNotice: SwFact; earliest: SwFact; preferred: string; blockers: string };
  proposal?: { plan: 10 | 12 | 16 | 20; basis: string; comparison: string; sent: string; response: 'Waiting' | 'Accepted' | 'Declined' | 'Thinking it over'; credit?: { amount: number; status: 'Waiting for Director' | 'Approved' | 'Declined' } };
  signed?: string; takeover?: string; handover: { item: string; done?: string }[]; activated?: string; propertyId?: string;
}
export interface Lead {
  id: string; created: string; name: string; email: string; phone: string; contactPref: 'Phone' | 'Email' | 'WhatsApp'; permission: boolean; marketing: boolean;
  source: 'Website' | 'Google Ads' | 'Facebook' | 'Instagram' | 'Referral' | 'Enquiry' | 'Phone'; campaign?: string; owner?: string; nextContact?: string; nextNote?: string;
  reason: string; timeframe: string; props: SwProp[]; comms: Comm[]; landlordId?: string; enquiry?: string;
  closed?: { outcome: 'Not proceeding' | 'Unqualified'; reason: string; at: string; by: string };
}
export const HANDOVER = ['Landlord authority to deal with the old agent', 'Notice served by the landlord, confirmed in writing', 'Keys collected', 'Tenant told about the new manager', 'Deposit details transferred', 'Rent account and statements received', 'Compliance certificates received', 'Open repairs listed'];
const fact = (value: string, confirmed = false): SwFact => ({ value, confirmed });
const noFact = (): SwFact => ({ value: '', confirmed: false });
const swp = (p: Partial<SwProp> & Pick<SwProp, 'id' | 'address' | 'postcode' | 'area' | 'stage'>): SwProp => ({ type: 'Flat', beds: 2, rent: 1800, handover: HANDOVER.map(item => ({ item })), agent: { name: '', fee: '', vat: 'Not known', extras: '', endDate: noFact(), notice: noFact(), method: 'Not known', continuing: noFact() }, dates: { safeNotice: noFact(), earliest: noFact(), preferred: '', blockers: '' }, ...p });
export const LEADS: Lead[] = [
  { id: 'SW1', created: '2 Oct 2026, 10:14', name: 'Daniel Cohen', email: 'd.cohen@mail.co.uk', phone: '07700 905001', contactPref: 'Phone', permission: true, marketing: true, source: 'Google Ads', campaign: 'switch-north-london-oct', owner: 'et', nextContact: '24 Nov 2026', nextNote: 'Call 3 weeks before the notice deadline', reason: 'Slow repairs and unclear statements', timeframe: 'Early 2027', comms: [c('2 Oct 2026, 15:30', 'Emma Thompson', 'Call', 'Two flats managed by Hamptons Lettings. Unhappy with repair delays. Will send both agreements.', 'out'), c('6 Oct 2026, 11:00', 'Daniel Cohen', 'Email', 'Agreements attached for both flats.', 'in', 'Management agreements')],
    props: [
      swp({ id: 'a', address: 'Flat 4, 18 Liverpool Road', postcode: 'N1 0RW', area: 'Islington', type: 'Flat', beds: 2, rent: 2350, stage: 3, route: 'Future switch', agent: { name: 'Hamptons Lettings', fee: '15%', vat: '+ VAT', extras: '£180 renewal fee', contract: 'hamptons-agreement-flat4.pdf', endDate: fact('14 Jan 2027', true), notice: fact('1 month', true), method: 'Letter by post', continuing: fact('Tenant-find commission continues while the current tenant stays', true) }, dates: { safeNotice: fact('14 Dec 2026', true), earliest: fact('14 Jan 2027', true), preferred: 'As soon as the contract allows', blockers: 'None known' } }),
      swp({ id: 'b', address: '7 Ripplevale Grove', postcode: 'N1 1HS', area: 'Islington', type: 'House', beds: 3, rent: 3100, stage: 2, agent: { name: 'Hamptons Lettings', fee: '15%', vat: '+ VAT', extras: '', endDate: fact('Mar 2027'), notice: fact('2 months'), method: 'Not known', continuing: fact('Not known yet') }, dates: { safeNotice: fact('Jan 2027'), earliest: fact('Mar 2027'), preferred: 'Spring 2027', blockers: 'Waiting for the signed agreement' } }),
    ] },
  { id: 'SW2', created: '15 Oct 2026, 08:52', name: 'Aisha Rahman', email: 'aisha.rahman@mail.co.uk', phone: '07700 905002', contactPref: 'Email', permission: true, marketing: false, source: 'Website', campaign: 'planned-switch-landing', reason: 'Fees keep going up', timeframe: 'In the next 6 months', comms: [], props: [swp({ id: 'a', address: 'Flat 2, 41 Camden Road', postcode: 'NW1 9LS', area: 'Camden', stage: 0, agent: { name: 'Foxtons', fee: '', vat: 'Not known', extras: '', endDate: noFact(), notice: noFact(), method: 'Not known', continuing: noFact() } })] },
  { id: 'SW3', created: '13 Oct 2026, 19:05', name: 'Peter Walsh', email: 'p.walsh@mail.co.uk', phone: '07700 905003', contactPref: 'Phone', permission: true, marketing: true, source: 'Facebook', campaign: 'already-paying-an-agent', owner: 'et', nextContact: '16 Oct 2026', nextNote: 'First call', reason: 'Never hears back from the agent', timeframe: 'Not sure', comms: [c('14 Oct 2026, 09:10', 'Emma Thompson', 'Call', 'No answer. Left a voicemail.', 'out')], props: [swp({ id: 'a', address: '22 Cholmeley Park', postcode: 'N6 5EU', area: 'Highgate', type: 'House', beds: 4, rent: 3900, stage: 1, agent: { name: 'Winkworth Highgate', fee: '', vat: 'Not known', extras: '', endDate: noFact(), notice: noFact(), method: 'Not known', continuing: noFact() } })] },
  { id: 'SW4', created: '25 Sep 2026, 14:20', name: 'Grace Okonkwo', email: 'grace.ok@mail.co.uk', phone: '07700 905004', contactPref: 'Email', permission: true, marketing: true, source: 'Referral', campaign: 'accountant-referral', owner: 'ps', nextContact: '20 Oct 2026', nextNote: 'Ask about the proposal', reason: 'Wants maintenance included', timeframe: 'Now', comms: [c('26 Sep 2026, 10:00', 'Priya Shah', 'Call', 'Agent contract has ended. Rolling month to month with 1 month notice.', 'out'), c('9 Oct 2026, 16:40', 'Priya Shah', 'Email', 'Proposal sent for the 16% plan.', 'out', 'Your LSP proposal')],
    props: [swp({ id: 'a', address: '9 Lichfield Grove', postcode: 'N3 2JP', area: 'Finchley', type: 'House', beds: 3, rent: 2600, stage: 4, route: 'Ready to plan', agent: { name: 'Barnard Marcus', fee: '12%', vat: '+ VAT', extras: '', contract: 'barnard-marcus-agreement.pdf', endDate: fact('Ended 1 Sep 2026', true), notice: fact('1 month', true), method: 'Email', continuing: fact('None', true) }, dates: { safeNotice: fact('1 Nov 2026', true), earliest: fact('1 Dec 2026', true), preferred: '1 Dec 2026', blockers: '' }, proposal: { plan: 16, basis: '16% of monthly rent, plus VAT', comparison: 'Stay: 12% + VAT, repairs charged on top. LSP 16%: routine repairs and covered materials included.', sent: '9 Oct 2026, 16:40', response: 'Thinking it over' } })] },
  { id: 'SW5', created: '1 Sep 2026, 12:00', name: 'Tom Fischer', email: 'tom.fischer@mail.co.uk', phone: '07700 905005', contactPref: 'Phone', permission: true, marketing: true, source: 'Google Ads', campaign: 'switch-north-london-sep', owner: 'et', reason: 'Wants one company for management and repairs', timeframe: 'December 2026', comms: [c('3 Sep 2026, 10:30', 'Emma Thompson', 'Call', 'Contract ends 30 Nov. Notice of 1 month given by email.', 'out'), c('14 Oct 2026, 12:15', 'Tom Fischer', 'Email', 'Signed agreement attached.', 'in', 'Signed LSP agreement')],
    props: [swp({ id: 'a', address: '31 Muswell Avenue', postcode: 'N10 2EB', area: 'Muswell Hill', type: 'House', beds: 3, rent: 2800, stage: 5, route: 'Ready to plan', agent: { name: 'Prickett & Ellis', fee: '14%', vat: 'Including VAT', extras: '', contract: 'prickett-ellis-agreement.pdf', endDate: fact('30 Nov 2026', true), notice: fact('1 month', true), method: 'Email', continuing: fact('None', true) }, dates: { safeNotice: fact('31 Oct 2026', true), earliest: fact('1 Dec 2026', true), preferred: '1 Dec 2026', blockers: '' }, proposal: { plan: 20, basis: '20% of monthly rent, plus VAT', comparison: 'Stay: 14% incl. VAT, repairs extra. LSP 20%: premium care, materials covered.', sent: '6 Oct 2026, 10:00', response: 'Accepted' }, signed: '14 Oct 2026, 12:15' })] },
  { id: 'SW6', created: '8 Oct 2026, 09:30', name: 'Hannah Price', email: 'hannah.price@mail.co.uk', phone: '07700 905006', contactPref: 'WhatsApp', permission: true, marketing: true, source: 'Instagram', campaign: 'already-paying-an-agent', owner: 'et', nextContact: '13 Oct 2026', nextNote: 'Chase the signed agreement', reason: 'Agent sold the branch', timeframe: 'Early 2027', comms: [c('9 Oct 2026, 14:00', 'Emma Thompson', 'Call', 'Cannot find the signed agreement. Will ask the agent for a copy.', 'out')],
    props: [swp({ id: 'a', address: 'Flat 1, 6 Weston Park', postcode: 'N8 9SY', area: 'Crouch End', stage: 3, route: 'Needs clarification', clarify: 'Signed agreement missing. Notice period unknown.', agent: { name: 'Stones Residential', fee: '13%', vat: 'Not known', extras: '', endDate: fact('Not known'), notice: noFact(), method: 'Not known', continuing: fact('Not known') } })] },
  { id: 'SW7', created: '5 Oct 2026, 17:45', name: 'Mark Ellis', email: 'mark.ellis@mail.co.uk', phone: '07700 905007', contactPref: 'Phone', permission: true, marketing: false, source: 'Facebook', reason: 'Asked about buying a property', timeframe: '—', owner: 'jc', comms: [c('6 Oct 2026, 10:00', 'James Carter', 'Call', 'Does not own a rental yet. Looking to buy next year.', 'out')], props: [swp({ id: 'a', address: 'Not given', postcode: 'EN1', area: 'Enfield', stage: 1 })], closed: { outcome: 'Unqualified', reason: 'Does not own a rental property yet', at: '6 Oct 2026, 10:05', by: 'James Carter' } },
];

/* ---------- products and services (saved once, picked by code on quotes and invoices) ---------- */
export interface Product { code: string; name: string; desc: string; rate: number; kind: 'Service' | 'Material' | 'Labour' }
export const CATALOGUE: Product[] = [
  { code: 'CALL-OUT', name: 'Call-out', desc: 'Attend site and assess the problem', rate: 60, kind: 'Service' },
  { code: 'LABOUR', name: 'Labour', desc: 'Labour charge (hourly)', rate: 45, kind: 'Labour' },
  { code: 'LABOUR D/R', name: 'Labour day rate', desc: 'Labour charge day rate', rate: 350, kind: 'Labour' },
  { code: 'MISC', name: 'Miscellaneous', desc: 'Miscellaneous expenses', rate: 0, kind: 'Material' },
  { code: '18TH ED/SPD', name: 'Fuse board installation', desc: "18th Edition fuse board installation with SPD's", rate: 750, kind: 'Service' },
  { code: 'LED/5FT/FLOU', name: 'LED batten fitting', desc: '4ft LED batten fitting', rate: 21.35, kind: 'Material' },
  { code: '30WFL/PIR', name: 'LED floodlight with PIR', desc: 'LED floodlight 30W with PIR sensor', rate: 41.5, kind: 'Material' },
  { code: '2G/WEATHER', name: 'Weatherproof socket', desc: 'Socket, weatherproof 2 gang switched IP66', rate: 23, kind: 'Material' },
  { code: 'HEATER', name: 'Down flow heater', desc: 'Down flow heater', rate: 50.75, kind: 'Material' },
  { code: 'SWA/CLEAT/C9', name: 'SWA cable cleats', desc: 'Cleats: clip outside SWA cable', rate: 10, kind: 'Material' },
  { code: '10MM/EARTH', name: '10mm earth cable', desc: '10mm single earth cable: bond water or gas', rate: 1.8, kind: 'Material' },
  { code: 'NB1.5/2', name: '1.5mm 2 core earth cable', desc: 'FP200 1.5mm 2 core earth: rewire lean-to lights', rate: 1.41, kind: 'Material' },
  { code: 'DS/2G/INST', name: 'Double socket supply and fit', desc: '13 Amp 2 gang double switched socket, supply and fit', rate: 38, kind: 'Service' },
  { code: 'DS/2G/WHT/BG2', name: 'BG double socket', desc: 'BG white 13A double socket and 25mm metal pattress box', rate: 14.5, kind: 'Material' },
  { code: 'DS/2G/WHT/MK2', name: 'MK double socket', desc: 'MK white 13A double socket and 25mm metal pattress box', rate: 16.2, kind: 'Material' },
  { code: 'MT2', name: 'Mini trunking', desc: 'MT2 25x16mm trunking, self adhesive', rate: 13.41, kind: 'Material' },
  { code: 'T2/BENDS', name: 'Trunking bends', desc: 'MT2 trunking bends, pack of 5', rate: 5, kind: 'Material' },
  { code: 'EE081', name: 'Replace faulty accessory', desc: 'Disconnect faulty accessory, replace and reconnect including fuses and MCB/RCBO reset, and test the circuit', rate: 37.5, kind: 'Service' },
  { code: 'WH/3KW', name: 'Instant hand wash heater', desc: 'Triton Instaflow 3kW hand wash heater', rate: 81.9, kind: 'Material' },
  { code: 'TAP/MIX', name: 'Mixer tap', desc: 'Kitchen mixer tap, supply and fit', rate: 95, kind: 'Service' },
];

/* ---------- leased by LSP ----------
   LSP rents the whole home from its owner and is the landlord to the occupiers.
   The owner stays on record under "Lease From". No management fee applies.
   Occupier rent comes in as normal; lease rent goes out to the owner on its own schedule. */
export interface Lease {
  ref: string; start: string; end: string; review: string; breakDate: string; notice: string; rent: number; frequency: 'Monthly' | 'Quarterly';
  firstDue: string; dueDay: number; doc?: string; use: string; sublet: string; ownerDoes: string; lspDoes: string;
  budget: number; budgetFrom: string; budgetTo: string; payTo: string; activated: string; by: string;
}
export interface LeasePay { id: string; property: string; month: string; due: string; amount: number; paid: number; history: { date: string; amount: number; ref: string }[] }

PROPERTIES.push({ id: 'P15', address: '6 Rosebery Gardens', area: 'Crouch End, London N8', type: 'House', beds: 3, baths: 1, managed: true, owner: 'L1', rent: 1800, status: 'Let', admin: 'et', photo: 'images/home2.jpg', budget: 900, used: 310, gas: true, added: '1 Jun 2026', arrangement: 'Leased',
  lease: { ref: 'LSP-LEASE-0007', start: '1 Jun 2026', end: '31 May 2029', review: '1 Jun 2027', breakDate: '1 Jun 2028', notice: '3 months in writing', rent: 1200, frequency: 'Monthly', firstDue: '1 Jun 2026', dueDay: 1, doc: 'lease-6-rosebery-gardens-signed.pdf', use: 'Residential letting to tenants', sublet: 'Allowed, on assured shorthold tenancies', ownerDoes: 'Building insurance, roof and structure', lspDoes: 'Day-to-day repairs, safety checks, inspections, finding tenants', budget: 900, budgetFrom: '1 Jun 2026', budgetTo: '31 May 2027', payTo: 'Barclays ···· 4821', activated: '1 Jun 2026, 10:00', by: 'Sarah Khan' } });
TENANTS.push({ id: 'T13', name: 'Grace Adeyemi', email: 'grace.adeyemi@mail.co.uk', phone: '07700 903015', property: 'P15', rent: 1800, deposit: 2076, depositRef: 'DPS-770415', depositScheme: 'DPS', start: '1 Jun 2026', end: '31 May 2027', status: 'Live', employment: 'Pharmacist, Whittington Hospital', emergency: 'Tunde Adeyemi · 07700 913015', rentDay: 1, kyc: verified(), comms: [] });
SAFETY.push(cert('SC40', 'P15', 'Gas safety', '28 May 2026, 10:00', '28 May 2027', { contractor: 'C1' }), cert('SC41', 'P15', 'Electrical (EICR)', '27 May 2026, 14:00', '27 May 2031', { contractor: 'C5' }), cert('SC42', 'P15', 'Energy (EPC)', '20 Apr 2026, 09:00', '20 Apr 2036'));
RENT.push({ id: 'R13', tenant: 'T13', month: 'Oct 2026', due: '1 Oct 2026', amount: 1800, paid: 1800, history: [{ date: '1 Oct 2026', amount: 1800, note: 'Bank transfer' }], reminders: [] });
export const LEASE_PAYS: LeasePay[] = [
  { id: 'LP1', property: 'P15', month: 'Aug 2026', due: '1 Aug 2026', amount: 1200, paid: 1200, history: [{ date: '1 Aug 2026', amount: 1200, ref: 'BACS 88213' }] },
  { id: 'LP2', property: 'P15', month: 'Sep 2026', due: '1 Sep 2026', amount: 1200, paid: 1200, history: [{ date: '1 Sep 2026', amount: 1200, ref: 'BACS 90144' }] },
  { id: 'LP3', property: 'P15', month: 'Oct 2026', due: '1 Oct 2026', amount: 1200, paid: 700, history: [{ date: '2 Oct 2026', amount: 700, ref: 'BACS 91877' }] },
  { id: 'LP4', property: 'P15', month: 'Nov 2026', due: '1 Nov 2026', amount: 1200, paid: 0, history: [] },
];

LANDLORDS.forEach(l => { if (l.id === 'L1') l.allowance = 600; if (l.id === 'L2') l.allowance = 900; if (l.id === 'L5') l.allowance = 900; });

/* Maintenance budget for managed homes on a fee plan: 20% of the LSP fee before VAT, for 12 months.
   Earlier spending keeps the same share of the budget so the example alerts still show. */
PROPERTIES.forEach(p => {
  if (!p.managed || p.arrangement === 'Leased') return;
  const plan = LANDLORDS.find(l => l.id === p.owner)?.plan ?? 16;
  const nb = plan === 10 ? 0 : Math.round(p.rent * plan / 100 * 0.2 * 12);
  p.used = p.budget ? Math.round(p.used / p.budget * nb) : 0; p.budget = nb;
});


/* =====================================================================
   Landlord portal: Margaret Okafor (L1)
   Three homes: 12 Oak Street and Flat 4, 19 Highgate Hill are managed on the 16% plan;
   6 Rosebery Gardens is leased to LSP (LSP is the landlord to the occupiers).
   ===================================================================== */
PROPERTIES.push({ id: 'P16', address: 'Flat 4, 19 Highgate Hill', area: 'Archway, London N19', type: 'Flat', beds: 2, baths: 1, managed: true, owner: 'L1', rent: 1350, status: 'Let', admin: 'et', photo: 'images/home3.jpg', budget: 518, used: 95, gas: true, added: '1 May 2026' });
TENANTS.push({ id: 'T14', name: 'Daniel Price', email: 'd.price@mail.co.uk', phone: '07700 903016', property: 'P16', rent: 1350, deposit: 1557, depositRef: 'DPS-512903', depositScheme: 'DPS', start: '1 May 2026', end: '30 Apr 2027', status: 'Live', employment: 'Teacher, Highgate School', emergency: 'Sara Price · 07700 913016', rentDay: 1, kyc: verified(), comms: [] });
SAFETY.push(
  cert('SC43', 'P16', 'Gas safety', '12 Nov 2025, 09:30', '12 Nov 2026', { contractor: 'C1', status: 'Booked', history: [{ issued: '10 Nov 2024, 10:00', expires: '10 Nov 2025', file: 'gas-certificate-2024.pdf', by: 'HeatRight Ltd' }] }),
  cert('SC44', 'P16', 'Electrical (EICR)', '20 Apr 2026, 11:00', '20 Apr 2031', { contractor: 'C5' }),
  cert('SC45', 'P16', 'Energy (EPC)', '3 Mar 2024, 10:00', '3 Mar 2034'),
  cert('SC46', 'P16', 'Fire alarm', '22 Sep 2026, 11:20', '22 Sep 2027', { contractor: 'C5' }),
);
INSPECTIONS.push(
  { id: 'I10', kind: 'Move-in', scope: 'Whole property', property: 'P16', date: '1 May 2026', time: '10:00', inspector: 'C6', status: 'Locked', doneAt: '1 May 2026, 10:50', rooms: [{ name: 'Living room', photos: 5, note: 'Good', condition: 'Good' }, { name: 'Kitchen', photos: 4, note: 'Good', condition: 'Good' }, { name: 'Bedroom 1', photos: 3, note: 'Good', condition: 'Good' }, { name: 'Bedroom 2', photos: 3, note: 'Small scuff on the door', condition: 'Fair' }, { name: 'Bathroom', photos: 3, note: 'Good', condition: 'Good' }], meters: { gas: '02210', electric: '15540', water: '00318' }, keys: 2, summary: 'Flat ready for Daniel Price. Signed by the tenant.', result: 'Pass' },
  { id: 'I11', kind: 'Routine', scope: 'Whole property', property: 'P16', date: '28 Oct 2026', time: '11:00', inspector: 'C6', status: 'Booked', rooms: [], meters: {}, keys: 0, notes: 'Six-month routine visit.' },
  { id: 'I13', kind: 'Gas safety', scope: 'Whole property', property: 'P16', date: '5 Nov 2026', time: '09:00', inspector: 'C1', status: 'Booked', rooms: [], meters: {}, keys: 0, notes: 'Yearly gas check before the certificate ends on 12 Nov.' },
  { id: 'I12', kind: 'Routine', scope: 'Whole property', property: 'P1', date: '6 Jan 2027', time: '10:00', inspector: 'C6', status: 'Booked', rooms: [], meters: {}, keys: 0, notes: 'Six-month routine visit.' },
);
RENT.push({ id: 'R14', tenant: 'T14', month: 'Oct 2026', due: '1 Oct 2026', amount: 1350, paid: 900, history: [{ date: '3 Oct 2026', amount: 900, note: 'Bank transfer' }], reminders: [{ at: '8 Oct 2026, 09:00', by: 'System' }, { at: '13 Oct 2026, 09:30', by: 'Emma Thompson' }] });
JOBS.push(
  { id: 'J15', title: 'Bathroom extractor fan', property: 'P16', managed: true, contractor: 'C5', cost: 192, price: 260, hours: 4, rate: 48, status: 'Landlord approval', landlordAsk: '14 Oct 2026, 15:30', invoice: 'INV-1047', reported: '12 Oct 2026, 19:10', by: 'Tenant · Daniel Price', tenant: 'T14', admin: 'et', category: 'Electrical', area: 'Bathroom', photos: ['Fan not working', 'Damp on ceiling'],
    note: 'The bathroom fan has stopped working and there is condensation on the ceiling. The fan needs replacing and the duct cleared.',
    lines: [{ activity: 'Labour', desc: 'Remove old fan, clear the duct, fit and test the new fan (4 hours)', qty: 4, rate: 48 }, { activity: 'Materials', desc: 'Extractor fan 100mm with humidity sensor and timer', qty: 1, rate: 68 }],
    comms: [c('14 Oct 2026, 15:30', 'Emma Thompson', 'Email', 'Invoice INV-1047 for £260 is ready for you to approve in the landlord portal. No work starts until you approve it.', 'out', 'Please approve: bathroom extractor fan · Flat 4, 19 Highgate Hill')],
    events: [ev('12 Oct 2026, 19:10', 'Daniel Price', 'Reported from the tenant portal'), ev('13 Oct 2026, 10:20', 'Emma Thompson', 'Priced at £260 (Volt Electrical, 4 hours plus the new fan). Over the £200 limit. Sent for Supervisor approval.'), ev('13 Oct 2026, 16:05', 'Sarah Khan', 'Approved by Supervisor. Next, Margaret Okafor approves the invoice before work starts.'), ev('14 Oct 2026, 15:30', 'Emma Thompson', 'Invoice INV-1047 sent to Margaret Okafor to approve before work starts')] },
  { id: 'J18', title: 'Slipped roof tiles', property: 'P15', managed: true, contractor: 'C2', cost: 220, price: 320, hours: 4, rate: 55, status: 'Landlord approval', landlordAsk: '13 Oct 2026, 11:00', invoice: 'INV-1048', reported: '9 Oct 2026, 10:40', by: 'Office Admin · Emma Thompson', admin: 'et', category: 'Roofing', area: 'Roof above the back bedroom', ownerRepair: true, photos: ['Slipped tiles', 'Gap in the flashing'],
    note: 'Three slipped tiles above the back bedroom and a gap in the flashing. Under the lease the roof is the owner\'s responsibility, so the owner approves and pays for this work.',
    lines: [{ activity: 'Labour', desc: 'Refix three slipped tiles and seal the flashing (4 hours)', qty: 4, rate: 55 }, { activity: 'Materials', desc: 'Matching roof tiles, clips and lead flashing', qty: 1, rate: 60 }, { activity: 'Access', desc: 'Roof ladder and safety equipment', qty: 1, rate: 40 }],
    comms: [c('13 Oct 2026, 11:00', 'Emma Thompson', 'Email', 'The roof at 6 Rosebery Gardens needs a repair. Under the lease the roof is your responsibility. Invoice INV-1048 for £320 is ready for you to approve.', 'out', 'Please approve: roof repair · 6 Rosebery Gardens')],
    events: [ev('9 Oct 2026, 10:40', 'Emma Thompson', 'Seen during a visit. Roof and structure are the owner\'s responsibility under the lease.'), ev('10 Oct 2026, 14:00', 'Emma Thompson', 'Priced at £320 (TopTile Roofing, 4 hours plus tiles and access). Sent for Supervisor approval.'), ev('12 Oct 2026, 09:30', 'Sarah Khan', 'Approved by Supervisor. Next, the owner Margaret Okafor approves the invoice.'), ev('13 Oct 2026, 11:00', 'Emma Thompson', 'Invoice INV-1048 sent to Margaret Okafor to approve before work starts')] },
  { id: 'J16', title: 'Blocked gutter cleared', property: 'P1', managed: true, contractor: 'C7', cost: 84, price: 150, hours: 2, rate: 42, status: 'Invoiced', invoice: 'INV-1039', reported: '18 Aug 2026, 09:00', by: 'Landlord · Margaret Okafor', admin: 'et', category: 'General', area: 'Front gutter', proof: ['Before', 'After'], cInvoice: { no: 'FC-1180', amount: 84, at: '20 Aug 2026, 13:10' },
    note: 'Water spilling over the front gutter when it rains.',
    comms: [], events: [ev('18 Aug 2026, 09:00', 'Margaret Okafor', 'Reported from the landlord portal'), ev('18 Aug 2026, 11:30', 'Emma Thompson', 'Priced at £150. Under the £200 limit. Sent for Supervisor approval.'), ev('18 Aug 2026, 14:00', 'Sarah Khan', 'Approved by Supervisor. FixIt Carpentry has the job.'), ev('20 Aug 2026, 09:00', 'FixIt Carpentry', 'Work started'), ev('20 Aug 2026, 13:10', 'FixIt Carpentry', 'Finished. Uploaded 2 photos'), ev('21 Aug 2026, 10:00', 'Emma Thompson', 'Work approved. Record locked.'), ev('22 Aug 2026, 09:00', 'Emma Thompson', 'Invoice INV-1039 sent to Margaret Okafor. Covered by the 16% plan: £150 from the maintenance allowance')] },
  { id: 'J17', title: 'Smoke alarm replaced', property: 'P16', managed: true, contractor: 'C5', cost: 48, price: 95, hours: 1, rate: 48, status: 'Invoiced', invoice: 'INV-1041', reported: '19 Sep 2026, 08:15', by: 'Tenant · Daniel Price', tenant: 'T14', admin: 'et', category: 'Electrical', area: 'Hallway', proof: ['Old alarm', 'New alarm tested'], cInvoice: { no: 'VE-2201', amount: 48, at: '22 Sep 2026, 11:20' },
    note: 'Hallway smoke alarm keeps beeping after a new battery.',
    comms: [], events: [ev('19 Sep 2026, 08:15', 'Daniel Price', 'Reported from the tenant portal'), ev('19 Sep 2026, 10:00', 'Emma Thompson', 'Priced at £95. Under the £200 limit. Sent for Supervisor approval.'), ev('19 Sep 2026, 12:40', 'Sarah Khan', 'Approved by Supervisor. Volt Electrical has the job.'), ev('22 Sep 2026, 11:20', 'Volt Electrical', 'Finished. Uploaded 2 photos'), ev('22 Sep 2026, 16:00', 'Emma Thompson', 'Work approved. Record locked.'), ev('23 Sep 2026, 09:00', 'Emma Thompson', 'Invoice INV-1041 sent to Margaret Okafor. Covered by the 16% plan: £95 from the maintenance allowance')] },
);
INVOICES.push(
  { id: 'INV-1047', to: 'L1', toKind: 'Landlord', job: 'J15', amount: 260, paid: 0, terms: 'Straight away', issued: '14 Oct 2026', due: '14 Oct 2026', overdue: false, site: 'Flat 4, 19 Highgate Hill', note: 'For your approval before work starts. Nothing is charged until you approve.', items: [{ activity: 'Labour', desc: 'Remove old fan, clear the duct, fit and test the new fan (4 hours)', qty: 4, rate: 48, amount: 192 }, { activity: 'Materials', desc: 'Extractor fan 100mm with humidity sensor and timer', qty: 1, rate: 68, amount: 68 }] },
  { id: 'INV-1048', to: 'L1', toKind: 'Landlord', job: 'J18', amount: 320, paid: 0, terms: 'Straight away', issued: '13 Oct 2026', due: '13 Oct 2026', overdue: false, site: '6 Rosebery Gardens', note: 'Owner repair under the lease. For your approval before work starts.', items: [{ activity: 'Labour', desc: 'Refix three slipped tiles and seal the flashing (4 hours)', qty: 4, rate: 55, amount: 220 }, { activity: 'Materials', desc: 'Matching roof tiles, clips and lead flashing', qty: 1, rate: 60, amount: 60 }, { activity: 'Access', desc: 'Roof ladder and safety equipment', qty: 1, rate: 40, amount: 40 }] },
  { id: 'INV-1039', to: 'L1', toKind: 'Landlord', job: 'J16', amount: 150, paid: 150, covered: true, paidAt: '22 Aug 2026, 09:00', terms: 'Straight away', issued: '22 Aug 2026', due: '22 Aug 2026', overdue: false, site: '12 Oak Street', note: 'Covered by your 16% plan. Nothing to pay. £150 used from your maintenance allowance.', items: [{ activity: 'Labour', desc: 'Clear the front gutter and test the downpipe', qty: 1, rate: 150, amount: 150 }] },
  { id: 'INV-1041', to: 'L1', toKind: 'Landlord', job: 'J17', amount: 95, paid: 95, covered: true, paidAt: '23 Sep 2026, 09:00', terms: 'Straight away', issued: '23 Sep 2026', due: '23 Sep 2026', overdue: false, site: 'Flat 4, 19 Highgate Hill', note: 'Covered by your 16% plan. Nothing to pay. £95 used from your maintenance allowance.', items: [{ activity: 'Labour', desc: 'Replace the hallway smoke alarm and test', qty: 1, rate: 60, amount: 60 }, { activity: 'Materials', desc: 'Mains smoke alarm with battery backup', qty: 1, rate: 35, amount: 35 }] },
);
LEASE_PAYS.unshift(
  { id: 'LP0a', property: 'P15', month: 'Jun 2026', due: '1 Jun 2026', amount: 1200, paid: 1200, history: [{ date: '1 Jun 2026', amount: 1200, ref: 'BACS 80122' }] },
  { id: 'LP0b', property: 'P15', month: 'Jul 2026', due: '1 Jul 2026', amount: 1200, paid: 1200, history: [{ date: '1 Jul 2026', amount: 1200, ref: 'BACS 84410' }] },
);
LANDLORDS.forEach(l => { if (l.id !== 'L1') return; l.comms.push(
  c('20 Sep 2026, 09:05', 'Emma Thompson', 'Email', 'Your September statement is ready in the portal. Nothing was taken off for repairs this month.', 'out', 'Your September statement'),
  c('9 Oct 2026, 18:22', 'Margaret Okafor', 'Portal', 'Hello Emma, could you send me the latest gas certificate for Highgate Hill? My insurer has asked for it.', 'in', 'Gas certificate for Highgate Hill'),
  c('10 Oct 2026, 09:15', 'Emma Thompson', 'Portal', 'Hi Margaret, it is in Documents and in Safety & Compliance. The next gas check is booked for 5 Nov, before the certificate ends on 12 Nov.', 'out', 'Re: Gas certificate for Highgate Hill'),
  c('13 Oct 2026, 11:00', 'Emma Thompson', 'Email', 'The roof at 6 Rosebery Gardens needs a repair. Under the lease the roof is your responsibility. Please approve invoice INV-1048 in the portal.', 'out', 'Please approve: roof repair · 6 Rosebery Gardens'),
  c('13 Oct 2026, 09:35', 'Emma Thompson', 'Email', 'Daniel Price at Highgate Hill has paid £900 of £1,350 for October. We have reminded him and will keep you updated.', 'out', 'October rent: part payment at Highgate Hill'),
  c('14 Oct 2026, 15:30', 'Emma Thompson', 'Email', 'Invoice INV-1047 for £260 is ready for you to approve. No work starts until you approve it.', 'out', 'Please approve: bathroom extractor fan · Flat 4, 19 Highgate Hill'),
); });

/** Requests a landlord sends to LSP (plan change, bank details and so on). The Supervisor or Office Admin answers. */
export interface LLReq { id: string; kind: 'Plan change' | 'Bank details' | 'Contact details' | 'End the agreement' | 'Other'; title: string; about: string; at: string; status: 'Sent' | 'Done' | 'Declined'; reply?: string; answered?: string }
export const LL_REQUESTS: LLReq[] = [
  { id: 'LR1', kind: 'Bank details', title: 'Change the bank account for payouts', about: 'New account at Barclays, ending 4821.', at: '2 Sep 2026, 10:12', status: 'Done', reply: 'Checked with you by phone and updated. Payouts now go to Barclays ···· 4821.', answered: '3 Sep 2026, 14:30' },
];

/** What Margaret sees in her activity list: her own actions and what LSP did for her homes. */
export const LL_ACTIVITY: Activity[] = [
  { id: 'A1', at: '15 Oct 2026, 10:05', who: 'Volt Electrical', what: 'Started work: electric socket fault at 12 Oak Street', area: 'Repairs' },
  { id: 'A2', at: '15 Oct 2026, 08:30', who: 'Sarah Khan', what: 'Approved the electric socket repair at 12 Oak Street (£140)', area: 'Repairs' },
  { id: 'A3', at: '14 Oct 2026, 15:30', who: 'Emma Thompson', what: 'Sent invoice INV-1047 (£260) for you to approve: bathroom extractor fan, Flat 4, 19 Highgate Hill', area: 'Approvals' },
  { id: 'A4', at: '14 Oct 2026, 10:00', who: 'Emma Thompson', what: 'Priced the garden fence panel at 12 Oak Street (£120) and sent it for Supervisor approval', area: 'Repairs' },
  { id: 'A5', at: '13 Oct 2026, 11:00', who: 'Emma Thompson', what: 'Sent invoice INV-1048 (£320) for you to approve: roof repair, 6 Rosebery Gardens', area: 'Approvals' },
  { id: 'A6', at: '13 Oct 2026, 09:30', who: 'Emma Thompson', what: 'Sent a rent reminder to Daniel Price (£450 still owed for October)', area: 'Rent' },
  { id: 'A7', at: '10 Oct 2026, 09:15', who: 'Emma Thompson', what: 'Replied to your message about the gas certificate for Highgate Hill', area: 'Messages' },
  { id: 'A8', at: '9 Oct 2026, 18:22', who: 'Margaret Okafor', what: 'Sent a message: gas certificate for Highgate Hill', area: 'Messages' },
  { id: 'A9', at: '3 Oct 2026, 14:00', who: 'Emma Thompson', what: 'Recorded £900 rent from Daniel Price for October (part payment)', area: 'Rent' },
  { id: 'A10', at: '2 Oct 2026, 11:04', who: 'Emma Thompson', what: 'Recorded the October lease payment of £700 for 6 Rosebery Gardens. £500 still owed by LSP', area: 'Lease' },
  { id: 'A11', at: '22 Sep 2026, 11:20', who: 'Volt Electrical', what: 'Fitted a new fire alarm and uploaded the certificate for Flat 4, 19 Highgate Hill', area: 'Safety' },
  { id: 'A12', at: '20 Sep 2026, 09:05', who: 'Emma Thompson', what: 'Paid your September statement into Barclays ···· 4821', area: 'Rent' },
  { id: 'A13', at: '3 Sep 2026, 14:30', who: 'Sarah Khan', what: 'Updated your bank account for payouts after a phone check', area: 'Account' },
  { id: 'A14', at: '2 Jul 2026, 10:55', who: 'Clear View Inspections', what: 'Routine inspection at 12 Oak Street: all good. Report locked.', area: 'Inspections' },
];
