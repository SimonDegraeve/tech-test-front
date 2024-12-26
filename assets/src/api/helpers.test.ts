import { describe, expect, test } from 'vitest'
import { candidatePositionInterval } from './config'
import { getCandidatePosition } from './helpers'

describe('getCandidatePosition', () => {
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

  describe('Descending order', () => {
    const isDescendingOrder = true

    test('check first item position', async () => {
      const result = getCandidatePosition(candidates, 0, isDescendingOrder)
      expect(result).toBe(candidatePositionInterval / 2)
    })

    test('check middle item position', async () => {
      const result = getCandidatePosition(candidates, 1, isDescendingOrder)
      expect(result).toBe(candidatePositionInterval + candidatePositionInterval / 2)
    })

    test('check last item position', async () => {
      const result = getCandidatePosition(candidates, 3, isDescendingOrder)
      expect(result).toBe(candidatePositionInterval * 3 + candidatePositionInterval / 2)
    })
  })

  describe('Ascending order', () => {
    const isDescendingOrder = false

    test('check first item position', async () => {
      const result = getCandidatePosition(candidates, 0, isDescendingOrder)
      expect(result).toBe(candidatePositionInterval)
    })

    test('check middle item position', async () => {
      const result = getCandidatePosition(candidates, 1, isDescendingOrder)
      expect(result).toBe(candidatePositionInterval * 2)
    })

    test('check last item position', async () => {
      const result = getCandidatePosition(candidates, 3, isDescendingOrder)
      expect(result).toBe(candidatePositionInterval * 3)
    })
  })
})
