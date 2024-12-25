import { candidatePositionInterval } from './config'
import { getCandidatePosition } from './helpers'

import { describe, expect, test } from 'vitest'

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

  describe('Ascending order', () => {
    const isAscendingOrder = true

    test('check first item position', async () => {
      const result = getCandidatePosition(candidates, 0, isAscendingOrder)
      expect(result).toBe(candidatePositionInterval / 2)
    })

    test('check middle item position', async () => {
      const result = getCandidatePosition(candidates, 1, isAscendingOrder)
      expect(result).toBe(candidatePositionInterval + candidatePositionInterval / 2)
    })

    test('check last item position', async () => {
      const result = getCandidatePosition(candidates, 3, isAscendingOrder)
      expect(result).toBe(candidatePositionInterval * 3 + candidatePositionInterval / 2)
    })
  })

  describe('Descending order', () => {
    const isAscendingOrder = false

    test('check first item position', async () => {
      const result = getCandidatePosition(candidates, 0, isAscendingOrder)
      expect(result).toBe(candidatePositionInterval)
    })

    test('check middle item position', async () => {
      const result = getCandidatePosition(candidates, 1, isAscendingOrder)
      expect(result).toBe(candidatePositionInterval * 2)
    })

    test('check last item position', async () => {
      const result = getCandidatePosition(candidates, 3, isAscendingOrder)
      expect(result).toBe(candidatePositionInterval * 3)
    })
  })
})
