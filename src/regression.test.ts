import { it, expect } from 'vitest';
import initial from '../public/data.json';
import {validateData} from './domain';
it('normalizes accepted sparse display orders before appending players',()=>{
 const data=validateData({...initial,players:initial.players.map(p=>({...p,order:p.order+1}))});
 expect(data.players.map(p=>p.order)).toEqual(Array.from({length:11},(_,i)=>i+1));
});
it('rejects nonexistent overnight Cairo end times',()=>{
 expect(()=>validateData({...initial,match:{...initial.match,date:'2026-04-23',startTime:'23:30',endTime:'00:30'}})).toThrow();
});
