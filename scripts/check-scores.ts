import { INITIAL_MEMBERS, PRESENTED_PAIRS } from '../src/data/members'
import { computeScore, DEFAULT_WEIGHTS, DEFAULT_ADVANCED, DEFAULT_FILTERS } from '../src/lib/score'
const byId = (id: string) => INITIAL_MEMBERS.find((m) => m.id === id)!
const ctx = { byId, presented: PRESENTED_PAIRS }
const noLearn = { ...DEFAULT_ADVANCED, aprender: { on: false, peso: 5 } }
for (const [a, b] of [['h02','f03'],['h02','f04'],['h02','f06'],['h02','f11'],['h01','f02'],['h01','f12'],['h09','f02']]) {
  const r = computeScore(byId(a), byId(b), DEFAULT_WEIGHTS, DEFAULT_ADVANCED, DEFAULT_FILTERS, ctx)
  const r2 = computeScore(byId(a), byId(b), DEFAULT_WEIGHTS, noLearn, DEFAULT_FILTERS, ctx)
  console.log(a, b, r.score, '(sin aprender', r2.score + ')', r.excluded?.reason.es ?? '', r.factors.map(f=>f.key+':'+f.sim.toFixed(2)).join(' '))
}
