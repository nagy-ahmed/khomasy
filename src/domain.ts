export type Team = 'A' | 'B' | null;
export interface Player { id: number; name: string; confirmed: boolean; order: number; team: Team }
export interface Match { id: string; date: string | null; startTime: string | null; endTime: string | null; timezone: string; fieldName: string; locationUrl: string; capacity: number; status: 'scheduled' | 'booked' | 'cancelled' }
export interface Data { match: Match; players: Player[] }
export const number = (n: number) => n.toLocaleString('ar-EG');
export function validateData(input: unknown): Data {
 const d = input as Data;
 const fail = () => { throw new Error('ملف البيانات مش سليم. راجع القيم وحاول تاني.'); };
 if (!d || !d.match || !Array.isArray(d.players)) return fail();
 const m = d.match;
 if (typeof m.id !== 'string' || m.timezone !== 'Africa/Cairo' || !Number.isInteger(m.capacity) || m.capacity < 1 || m.capacity > 100 || !['scheduled','booked','cancelled'].includes(m.status)) return fail();
 if (typeof m.fieldName !== 'string' || typeof m.locationUrl !== 'string') return fail();
 if (m.locationUrl) { try { if (new URL(m.locationUrl).protocol !== 'https:') return fail(); } catch { return fail(); } }
 if (m.date !== null && (typeof m.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(m.date) || new Date(m.date).toISOString().slice(0,10) !== m.date)) return fail();
 for (const t of [m.startTime,m.endTime]) if (t !== null && (typeof t !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(t))) return fail();
 const ids = new Set<number>(), orders = new Set<number>();
 for (const p of d.players) {
  if (!p || !Number.isInteger(p.id) || p.id < 1 || ids.has(p.id) || typeof p.name !== 'string' || !p.name.trim() || p.name.length > 80 || typeof p.confirmed !== 'boolean' || !Number.isInteger(p.order) || p.order < 1 || orders.has(p.order) || ![null,'A','B'].includes(p.team) || (!p.confirmed && p.team !== null)) return fail();
  ids.add(p.id); orders.add(p.order);
 }
 if (m.date && m.startTime && kickoff(m) === null) return fail();
 if (m.date && m.endTime) {
  const nextDay=m.startTime && m.endTime <= m.startTime;
  const endDate=nextDay?new Date(Date.parse(`${m.date}T12:00:00Z`)+86400000).toISOString().slice(0,10):m.date;
  if(kickoff({date:endDate,startTime:m.endTime})===null)return fail();
 }
 return {match:{...m},players:d.players.map(p=>({...p})).sort((a,b)=>a.order-b.order).map((p,i)=>({...p,order:i+1}))};
}
export function assignTeam(players: Player[], id: number, team: Team): Player[] { return players.map(p=>p.id===id ? {...p,team:p.confirmed?team:null}:p); }
export function reorderPlayers(players: Player[], active: number, over: number): Player[] {
 const result = [...players]; const from=result.findIndex(p=>p.id===active), to=result.findIndex(p=>p.id===over);
 if (from < 0 || to < 0) return players;
 result.splice(to,0,result.splice(from,1)[0]); return result.map((p,i)=>({...p,order:i+1}));
}
export function randomTeams(players: Player[]): Player[] {
 const pool=players.filter(p=>p.confirmed).map(p=>p.id);
 for(let i=pool.length-1;i>0;i--){ const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1); [pool[i],pool[j]]=[pool[j],pool[i]]; }
 return players.map(p=>({...p,team:!p.confirmed?null:pool.indexOf(p.id)%2===0?'A':'B'}));
}
// Solve Cairo wall time with Intl's timezone database, rather than a fixed UTC offset.
export function kickoff(m: Pick<Match,'date'|'startTime'>): number | null {
 if (!m.date || !m.startTime) return null;
 const target=Date.parse(`${m.date}T${m.startTime}:00Z`); if (!Number.isFinite(target)) return null;
 const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 let guess=target;
 for(let i=0;i<4;i++) { const parts=Object.fromEntries(fmt.formatToParts(guess).map(p=>[p.type,p.value])); const wall=Date.parse(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00Z`); const delta=target-wall; if(delta===0)return guess; guess+=delta; }
 return null;
}
export function dateLabel(m: Match) { return m.date ? new Intl.DateTimeFormat('ar-EG',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Africa/Cairo'}).format(new Date(`${m.date}T12:00:00Z`)) : 'المعاد لسه متحددش'; }
export function timeLabel(time: string | null) { if(!time)return 'لسه متحددش'; const [h,m]=time.split(':').map(Number); return `${number(h%12||12)}:${m.toLocaleString('ar-EG',{minimumIntegerDigits:2})} ${h>=12?'م':'ص'}`; }
export function teamsText(d: Data) { return ['⚽ تقسيمة خماسي',...(['A','B'] as const).map((team,i)=>`${i===0?'🟢 الفريق الأخضر':'🟠 الفريق البرتقالي'}\n${d.players.filter(p=>p.team===team).map((p,j)=>`${j+1}. ${p.name}`).join('\n')||'لسه مفيش لاعيبة'}`),'من غير فريق: '+(d.players.filter(p=>p.confirmed&&!p.team).map(p=>p.name).join('، ')||'مفيش')].join('\n\n'); }
export function matchText(d: Data) { return `⚽ خماسي — الماتش الجاي\n${dateLabel(d.match)}\n${timeLabel(d.match.startTime)} – ${timeLabel(d.match.endTime)} (بتوقيت القاهرة)\n📍 ${d.match.fieldName||'الملعب لسه متحددش'}\n${d.match.locationUrl}\nالحجز: ${{scheduled:'مستنيين التأكيد',booked:'الحجز متأكد',cancelled:'الماتش اتلغى'}[d.match.status]}\n\nاللاعيبة (${d.players.filter(p=>p.confirmed).length}/${d.match.capacity}):\n${d.players.map((p,i)=>`${i+1}. ${p.name}${p.confirmed?' ✅':' (لسه مأكّدش)'}`).join('\n')}\n\n${teamsText(d)}`; }
