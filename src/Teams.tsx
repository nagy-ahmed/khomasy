import { DndContext, useDraggable, useDroppable, PointerSensor, KeyboardSensor, useSensors, useSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Shuffle, RotateCcw, Share2, GripVertical, Shirt } from 'lucide-react';
import { assignTeam, randomTeams, number, teamsText, type Player, type Team, type Data } from './domain';
function Chip({p,admin,assign}:{p:Player;admin:boolean;assign:(id:number,t:Team)=>void}){
 const {attributes,listeners,setNodeRef,transform,isDragging}=useDraggable({id:p.id,disabled:!admin});
 return <div ref={setNodeRef} className={`team-player ${isDragging?'dragging':''}`} style={{transform:CSS.Translate.toString(transform)}}>{admin&&<button className="icon-button drag-handle" aria-label={`انقل ${p.name}`} {...attributes} {...listeners}><GripVertical size={14}/></button>}<Shirt size={18}/><span>{p.name}</span>{admin&&<select aria-label={`فريق ${p.name}`} value={p.team||'none'} onChange={e=>assign(p.id,e.target.value==='none'?null:e.target.value as Team)}><option value="none">من غير فريق</option><option value="A">الأخضر</option><option value="B">البرتقالي</option></select>}</div>;
}
function Zone({team,players,admin,assign}:{team:Team;players:Player[];admin:boolean;assign:(id:number,t:Team)=>void}){
 const {setNodeRef,isOver}=useDroppable({id:team||'none',disabled:!admin});
 return <div ref={setNodeRef} className={`team-zone ${team==='B'?'orange':'green'} ${!team?'unassigned':''} ${isOver?'over':''}`}><div className="team-title"><span>{team==='A'?'الفريق الأخضر':team==='B'?'الفريق البرتقالي':'على دكة التقسيمة'}</span><span>{number(players.length)}{team?' / ٥':''}</span></div>{team&&players.length>5&&<p className="warning">الفريق فيه أكتر من ٥ لاعيبة</p>}<div className="team-members">{players.map(p=><Chip key={p.id} p={p} admin={admin} assign={assign}/>)}</div>{!players.length&&<p className="zone-empty">{admin?'اسحب اللاعيبة هنا':'التقسيمة لسه مستنياكم'}</p>}</div>;
}
export default function Teams({data,admin,onChange,onShare}:{data:Data;admin:boolean;onChange:(p:Player[])=>void;onShare:(text:string)=>void}){
 const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:8}}),useSensor(KeyboardSensor));
 const assign=(id:number,t:Team)=>onChange(assignTeam(data.players,id,t));
 return <section className="panel teams" id="teams"><div className="section-heading"><div><span className="eyebrow">صحاب برّه، منافسين جوّه</span><h2><Shirt size={21}/>تقسيمة الفرق</h2></div><button className="icon-button" aria-label="شارك الفرق" onClick={()=>onShare(teamsText(data))}><Share2 size={18}/></button></div>
 {admin&&<div className="team-tools"><button className="button small" onClick={()=>onChange(randomTeams(data.players))}><Shuffle size={16}/>تقسيمة عشوائية</button><button className="button small" onClick={()=>onChange(data.players.map(p=>({...p,team:null})))}><RotateCcw size={15}/>ابدأ من جديد</button></div>}
 <DndContext sensors={sensors} onDragEnd={({active,over})=>{if(admin&&over)assign(Number(active.id),over.id==='none'?null:over.id as Team);}}><div className="pitch"><div className="pitch-line"/><div className="pitch-circle"/><div className="pitch-goal right"/><div className="pitch-goal left"/><div className="versus">VS</div><Zone team="A" players={data.players.filter(p=>p.team==='A')} admin={admin} assign={assign}/><Zone team="B" players={data.players.filter(p=>p.team==='B')} admin={admin} assign={assign}/></div><Zone team={null} players={data.players.filter(p=>p.confirmed&&!p.team)} admin={admin} assign={assign}/></DndContext>
 <div className="panel-foot">٥ ضد ٥ • التقسيمة للّاعيبة المتأكدين بس</div></section>;
}
