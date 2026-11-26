import { GAMMA, erp, sigmaEq } from './assumptions'
import type { Band, Profile } from './types'

/**
 * Risk band from the two attitude questions.
 * avg = (drawdownReaction + incomeGamble) / 2
 * very_high ≥ 4.5 · high ≥ 3.75 · moderate ≥ 2.75 · low ≥ 2.0 · else very_low.
 * No experience and failed knowledge check caps very_high/high at moderate.
 */
export function riskBand(p: Profile): { band: Band; gamma: number } {
  const avg = (p.drawdownReaction + p.incomeGamble) / 2
  let band: Band =
    avg >= 4.5 ? 'very_high' : avg >= 3.75 ? 'high' : avg >= 2.75 ? 'moderate' : avg >= 2.0 ? 'low' : 'very_low'
  if (p.experience === 'none' && !p.knowledgeCheckPassed && (band === 'very_high' || band === 'high')) {
    band = 'moderate'
  }
  return { band, gamma: GAMMA[band] }
}

/**
 * Merton (1969) optimal risky share of total wealth.
 * w* = min(erp / (gamma · sigmaEq²), 1)
 */
export function mertonShare(gamma: number): number {
  return Math.min(erp / (gamma * sigmaEq * sigmaEq), 1)
}
