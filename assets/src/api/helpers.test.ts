import { describe, expect, test } from 'vitest'
import { candidatePositionInterval } from './config'
import { getCandidatePositionInBetween } from './helpers'

describe('getCandidatePositionInBetween', () => {
  const candidates = [
    {
      id: 1,
      email: '',
      position: 16384,
      status: 'new' as const,
    },
    {
      id: 2,
      email: '',
      position: 32768,
      status: 'new' as const,
    },
    {
      id: 3,
      email: '',
      position: 49152,
      status: 'new' as const,
    },
    {
      id: 4,
      email: '',
      position: 65536,
      status: 'new' as const,
    },
  ]

  test('check first candidate position', async () => {
    const result = getCandidatePositionInBetween(candidates, 1)
    expect(result).toBe(candidatePositionInterval)
  })

  test('check middle candidate position', async () => {
    const result = getCandidatePositionInBetween(candidates, 2)
    expect(result).toBe(candidatePositionInterval * 2)
  })

  test('check last candidate position', async () => {
    const result = getCandidatePositionInBetween(candidates, 4)
    expect(result).toBe(candidatePositionInterval * 4)
  })

  test('check unknwon candidate position', async () => {
    const result = getCandidatePositionInBetween(candidates, 10)
    expect(result).toBe(candidatePositionInterval / 2)
  })

  test('check unknwon candidates', async () => {
    const result = getCandidatePositionInBetween([], 1)
    expect(result).toBe(candidatePositionInterval / 2)
  })
})
