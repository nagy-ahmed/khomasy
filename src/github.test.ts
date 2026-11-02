import {it,expect,vi,afterEach} from 'vitest';
import initial from '../public/data.json';
import {readData,saveData,encode,decode,authenticate} from './github';
const config={owner:'nagy-ahmed',repo:'khomasy',branch:'main',path:'public/data.json'};
afterEach(()=>vi.unstubAllGlobals());
it('round trips Arabic JSON through base64',()=>expect(decode(encode(initial))).toEqual(initial));
it('reads and validates remote JSON with its SHA',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({content:encode(initial),sha:'abc'}))));
 expect((await readData(config)).sha).toBe('abc');
});
it('never retries a conflicted save',async()=>{
 const fetcher=vi.fn().mockResolvedValue(new Response('{}',{status:409}));vi.stubGlobal('fetch',fetcher);
 await expect(saveData(config,'private-token',initial as never,'old')).rejects.toThrow('اتغيرت');
 expect(fetcher).toHaveBeenCalledTimes(1);
});
it('rejects accounts without repository write permissions',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({permissions:{push:false},full_name:'nagy-ahmed/khomasy'}))));
 await expect(authenticate(config,'invalid')).rejects.toThrow('صلاحية');
});
it('reports public API rate limiting',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('{}',{status:403})));
 await expect(readData(config)).rejects.toThrow('حد');
});
