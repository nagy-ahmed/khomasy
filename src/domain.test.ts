import { describe, it, expect } from 'vitest';
import initial from '../public/data.json';
import { validateData, randomTeams, assignTeam, reorderPlayers, kickoff, matchText } from './domain';

describe('shared football data', () => {
 it('starts with the exact roster and counts', () => {
  const data = validateData(initial);
  expect(data.players.map(p => p.name)).toEqual(['أنا (ناجي)','يوسف','زهران','حازم','ياسين','وجيه','إسماعيل','كريم','يوسف عبدالقادر','إسلام','محمد خلاف']);
  expect(data.players.filter(p => p.confirmed)).toHaveLength(10);
  expect(data.match.date).toBeNull();
 });
 it('rejects duplicate IDs and invalid URLs', () => {
  expect(() => validateData({...initial,players:[initial.players[0],initial.players[0]]})).toThrow();
  expect(() => validateData({...initial,match:{...initial.match,locationUrl:'javascript:alert(1)'}})).toThrow();
 });
 it('only assigns confirmed players once and balances teams', () => {
  const players = randomTeams(validateData(initial).players);
  expect(players.filter(p=>p.team==='A')).toHaveLength(5);
  expect(players.filter(p=>p.team==='B')).toHaveLength(5);
  expect(players[10].team).toBeNull();
  expect(assignTeam(players,11,'A')[10].team).toBeNull();
  expect(assignTeam(players,1,'B').filter(p=>p.id===1)).toHaveLength(1);
 });
 it('reorders stable IDs and updates display order', () => {
  const players = reorderPlayers(validateData(initial).players,1,3);
  expect(players.slice(0,3).map(p=>p.id)).toEqual([2,3,1]);
  expect(players.map(p=>p.order)).toEqual(Array.from({length:11},(_,i)=>i+1));
 });
 it('interprets kickoff in Cairo including summer time', () => {
  expect(kickoff({...initial.match,date:'2026-11-02',startTime:'20:00'})).toBe(Date.parse('2026-11-02T18:00:00Z'));
  expect(kickoff({...initial.match,date:'2026-07-02',startTime:'20:00'})).toBe(Date.parse('2026-07-02T17:00:00Z'));
 });
 it('shares placeholders and includes unconfirmed players explicitly', () => {
  expect(matchText(validateData(initial))).toContain('محمد خلاف (لسه مأكّدش)');
  expect(matchText(validateData(initial))).toContain('لسه متحددش');
 });
});
