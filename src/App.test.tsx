// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import React,{act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import App from './App';
import seed from '../public/data.json';
import {encode} from './github';
let host:HTMLDivElement,root:Root,remote:unknown;
const config={owner:'nagy-ahmed',repo:'khomasy',branch:'main',path:'public/data.json'};
const click=async(text:string)=>{const button=Array.from(host.querySelectorAll('button')).find(b=>b.textContent?.includes(text));expect(button).toBeTruthy();await act(async()=>button!.click());};
beforeEach(async()=>{
 (globalThis as Record<string,unknown>).IS_REACT_ACT_ENVIRONMENT=true;
 remote=structuredClone(seed);
 vi.stubGlobal('fetch',vi.fn(async(url:string,options?:RequestInit)=>{
  if(url.endsWith('config.json'))return new Response(JSON.stringify(config));
  if(options?.method==='PUT'){const payload=JSON.parse(options.body as string);expect(payload.sha).toBe('current');remote=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload.content),c=>c.charCodeAt(0))));return new Response(JSON.stringify({content:{sha:'saved'}}));}
  if(url.includes('/contents/'))return new Response(JSON.stringify({content:encode(remote),sha:'current'}));
  return new Response(JSON.stringify({permissions:{push:true}}));
 }));
 host=document.createElement('div');document.body.append(host);root=createRoot(host);await act(async()=>root.render(<App/>));
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.unstubAllGlobals();});
it('public viewer sees exact counts and cannot see editing controls',()=>{
 expect(host.querySelectorAll('.player-row')).toHaveLength(11);
 expect(host.querySelectorAll('.status.confirmed')).toHaveLength(10);
 expect(host.querySelector('.admin-panel')).toBeNull();
 expect(host.querySelector('.drag-handle')).toBeNull();
 expect(host.textContent).toContain('محمد خلاف');
});
it('admin randomizes, saves shared JSON, and reload sees saved teams',async()=>{
 await click('الإدارة');
 const input=host.querySelector('input[type=password]') as HTMLInputElement;
 await act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'session-private-token');input.dispatchEvent(new Event('input',{bubbles:true}));});
 await act(async()=>{host.querySelector('form')!.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});
 expect(host.querySelector('.admin-panel')).not.toBeNull();
 await click('تقسيمة عشوائية');
 expect(host.querySelector('.save-bar')).not.toBeNull();
 await click('حفظ التعديلات للكل');
 expect(host.querySelector('.save-bar')).toBeNull();
 const players=(remote as typeof seed).players;
 expect(players.filter(p=>p.team==='A')).toHaveLength(5);
 expect(players.filter(p=>p.team==='B')).toHaveLength(5);
 expect(players[10].team).toBeNull();
 expect(localStorage.length).toBe(0);expect(sessionStorage.length).toBe(0);
 await act(async()=>root.unmount());root=createRoot(host);await act(async()=>root.render(<App/>));
 expect(host.querySelector('.admin-panel')).toBeNull();
 expect(host.querySelectorAll('.pitch .team-player')).toHaveLength(10);
});
it('retains unsaved draft on conflict',async()=>{
 await click('الإدارة');
 const input=host.querySelector('input[type=password]') as HTMLInputElement;
 await act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'session-private-token');input.dispatchEvent(new Event('input',{bubbles:true}));});
 await act(async()=>host.querySelector('form')!.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 await click('تقسيمة عشوائية');
 vi.stubGlobal('fetch',vi.fn(async()=>new Response('{}',{status:409})));
 await click('حفظ التعديلات للكل');
 expect(host.querySelector('.save-bar')).not.toBeNull();
 expect(host.querySelector('[role=alert]')?.textContent).toContain('اتغيرت');
 expect(host.querySelectorAll('.pitch .team-player')).toHaveLength(10);
});
