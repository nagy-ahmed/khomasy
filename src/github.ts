import { validateData, type Data } from './domain';
export interface Config { owner: string; repo: string; branch: string; path: string }
export interface Snapshot { data: Data; sha: string }
const root=(c:Config)=>`https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}`;
const endpoint=(c:Config)=>`${root(c)}/contents/${c.path.split('/').map(encodeURIComponent).join('/')}`;
export const encode=(value:unknown)=>btoa(Array.from(new TextEncoder().encode(JSON.stringify(value,null,2)+'\n'),b=>String.fromCharCode(b)).join(''));
export const decode=(value:string):unknown=>JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\s/g,'')),c=>c.charCodeAt(0))).replace(/^\uFEFF/,''));
async function request(url:string,token='',init:RequestInit={}) {
 let response:Response;
 try { response=await fetch(url,{...init,cache:'no-store',signal:AbortSignal.timeout(15000),headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(token?{Authorization:`Bearer ${token}`}:{ }),...(init.body?{'Content-Type':'application/json'}:{})}}); }
 catch {throw new Error('مش قادرين نوصل لـ GitHub. راجع النت وحاول تاني؛ تعديلاتك لسه موجودة.');}
 if(!response.ok){
  if(response.status===409||response.status===422)throw new Error('البيانات اتغيرت أو الحفظ مرفوض. انسخ تعديلاتك، وحمّل آخر نسخة قبل ما تعدّل تاني.');
  if(response.status===401)throw new Error('رمز الدخول مش سليم أو انتهت صلاحيته.');
  if(response.status===403||response.status===429)throw new Error('وصلنا لحد طلبات GitHub أو مفيش صلاحية كفاية. استنى شوية أو راجع صلاحية الرمز.');
  throw new Error(`GitHub رجّع خطأ (${response.status}). حاول تاني بعد شوية.`);
 }
 return response.json();
}
export async function readData(c:Config,token=''):Promise<Snapshot> {
 const r=await request(`${endpoint(c)}?ref=${encodeURIComponent(c.branch)}&_=${Date.now()}`,token);
 if(typeof r.sha!=='string'||typeof r.content!=='string')throw new Error('استجابة البيانات مش سليمة.');
 return {data:validateData(decode(r.content)),sha:r.sha};
}
export async function authenticate(c:Config,token:string):Promise<void> {
 const repo=await request(root(c),token);
 if(!repo.permissions?.push)throw new Error('الحساب ده ملوش صلاحية تعديل المستودع.');
}
export async function saveData(c:Config,token:string,data:Data,sha:string):Promise<Snapshot> {
 if(!token||!sha)throw new Error('سجّل دخول وحمّل البيانات الأول.');
 const valid=validateData(data);
 const result=await request(endpoint(c),token,{method:'PUT',body:JSON.stringify({message:'data: update match and players [skip ci]',content:encode(valid),sha,branch:c.branch})});
 if(!result.content?.sha)throw new Error('مش قادرين نأكد الحفظ. حمّل أحدث نسخة قبل أي محاولة جديدة.');
 return {data:valid,sha:result.content.sha};
}
