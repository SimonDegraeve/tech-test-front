import { candidatePositionInterval } from './config'
import { Candidate } from './types'

// Calculate the new candidate position based on ascending or descending order
export const getCandidatePosition = (
  candidates: Candidate[],
  index: number,
  isDescendingOrder: boolean
) => {
  const previousCandidatePosition = candidates[index - 1]?.position ?? 0
  const defaultNextCandidatePosition = (index || 1) * candidatePositionInterval
  let nextCandidatePosition
  let newCandidatePosition

  // If the order is descending, the new candidate position should be between the previous and next candidate
  if (isDescendingOrder) {
    nextCandidatePosition = candidates[index]?.position ?? defaultNextCandidatePosition

    // The new position should be at least one position after the previous candidate
    // and at most half-way before the next candidate
    newCandidatePosition = Math.max(
      previousCandidatePosition + 1,
      nextCandidatePosition - Math.floor((nextCandidatePosition - previousCandidatePosition) / 2)
    )
  }
  // If the order is ascending, the new candidate position should be after the next candidate
  else {
    nextCandidatePosition = candidates[index + 1]?.position ?? defaultNextCandidatePosition

    // The new position should be at least half-way after the next candidate
    newCandidatePosition =
      nextCandidatePosition + Math.floor((previousCandidatePosition - nextCandidatePosition) / 2)
  }

  return newCandidatePosition
}
