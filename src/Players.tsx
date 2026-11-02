import { useState } from 'react';
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, GripVertical, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { number, reorderPlayers, type Player } from './domain';
interface Props { players:Player[]; admin:boolean; onChange:(p:Player[])=>void }
function Row({player:p,admin,onEdit,onDelete,onConfirm}:{player:Player;admin:boolean;onEdit:()=>void;onDelete:()=>void;onConfirm:()=>void}) {
 const {attributes,listeners,setNodeRef,transform,transition,isDragging}=useSortable({id:p.id,disabled:!admin});
 return <div ref={setNodeRef} className={`player-row ${isDragging?'dragging':''}`} style={{transform:CSS.Transform.toString(transform),transition}}>
  {admin&&<button className="icon-button drag-handle" aria-label={`غيّر ترتيب ${p.name}`} {...attributes} {...listeners}><GripVertical size={18}/></button>}
  <span className="row-number">{number(p.order).padStart(2,'٠')}</span><span className={`avatar ${!p.confirmed?'muted':''}`}>{p.name.replace('أنا (','').slice(0,1)}</span>
  <div className="player-name">{p.name}<small>{p.team=== 'A'?'الفريق الأخضر':p.team==='B'?'الفريق البرتقالي':p.confirmed?'جاهز للملعب':'مستنيين تأكيده'}</small></div>
  {admin?<div className="row-actions"><button className={`status ${p.confirmed?'confirmed':''}`} onClick={onConfirm} aria-label={`غيّر تأكيد ${p.name}`}>{p.confirmed?<><Check size={13}/>متأكد</>:'لسه مأكّدش'}</button><button className="icon-button" onClick={onEdit} aria-label={`عدّل اسم ${p.name}`}><Pencil size={15}/></button><button className="icon-button danger" onClick={onDelete} aria-label={`امسح ${p.name}`}><Trash2 size={15}/></button></div>:<span className={`status ${p.confirmed?'confirmed':''}`}>{p.confirmed?<><Check size={13}/>متأكد</>:'لسه مأكّدش'}</span>}
 </div>;
}
export default function Players({players,admin,onChange}:Props){
 const [filter,setFilter]=useState('all'),[editing,setEditing]=useState<Player|null>(null),[adding,setAdding]=useState(false),[name,setName]=useState('');
 const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:8}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}));
 const visible=players.filter(p=>filter==='all'||p.confirmed===(filter==='confirmed'));
 return <section className="panel roster" id="players"><div className="section-heading"><div><span className="eyebrow">لمة الأسبوع</span><h2><Users size={21}/>اللاعيبة <span className="count">{number(players.length)}</span></h2></div>{admin&&<button className="button small" onClick={()=>{setAdding(true);setName('');}}><Plus size={16}/>ضيف لاعب</button>}</div>
 <div className="filter-tabs">{[['all','الكل'],['confirmed','متأكدين'],['pending','لسه مأكّدوش']].map(([key,label])=><button key={key} className={filter===key?'active':''} onClick={()=>setFilter(key)}>{label} <span>{number(key==='all'?players.length:players.filter(p=>p.confirmed===(key==='confirmed')).length)}</span></button>)}</div>
 {admin&&<p className="hint">اسحب من علامة ⋮⋮ لتغيير الترتيب. بالكيبورد: مسافة، الأسهم، مسافة.</p>}
 <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={({active,over})=>{if(admin&&over)onChange(reorderPlayers(players,Number(active.id),Number(over.id)));}} accessibility={{screenReaderInstructions:{draggable:'اضغط مسافة لبدء السحب، الأسهم للتحريك، ومسافة للإفلات أو هروب للإلغاء.'}}}>
 <SortableContext items={visible.map(p=>p.id)} strategy={verticalListSortingStrategy}>{visible.map(p=><Row key={p.id} player={p} admin={admin} onEdit={()=>{setEditing(p);setName(p.name);}} onConfirm={()=>onChange(players.map(x=>x.id===p.id?{...x,confirmed:!x.confirmed,team:!x.confirmed?x.team:null}:x))} onDelete={()=>{if(window.confirm(`تمسح ${p.name} من اللاعيبة؟`))onChange(players.filter(x=>x.id!==p.id).map((x,i)=>({...x,order:i+1})));}}/>)}</SortableContext></DndContext>
 {!visible.length&&<p className="empty">مفيش لاعيبة هنا لسه.</p>}
 <div className="panel-foot"><span className="live-dot"/> كل لاعب بيكمّل اللمة</div>
 {(adding||editing)&&<div className="modal-backdrop"><form role="dialog" aria-modal="true" aria-label="بيانات اللاعب" className="modal" onSubmit={e=>{e.preventDefault();if(!name.trim())return;if(editing)onChange(players.map(p=>p.id===editing.id?{...p,name:name.trim()}:p));else onChange([...players,{id:Math.max(0,...players.map(p=>p.id))+1,name:name.trim(),confirmed:false,order:players.length+1,team:null}]);setAdding(false);setEditing(null);}}><h2>{adding?'ضيف لاعب للّمة':'عدّل اسم اللاعب'}</h2><label>اسم اللاعب<input autoFocus required maxLength={80} value={name} onChange={e=>setName(e.target.value)}/></label><div className="actions"><button className="button primary">تمام</button><button type="button" className="button" onClick={()=>{setAdding(false);setEditing(null);}}>إلغاء</button></div></form></div>}
 </section>;
}
