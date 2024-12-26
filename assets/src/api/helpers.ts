import { candidatePositionInterval } from './config'
import { Candidate } from './types'

// Calculate the new candidate position halfway between the previous and next candidate,
// so we still have room to insert other candidates between them.
export const getCandidatePositionInBetween = (
  candidates: Candidate[],
  targetCandidateId: string | number
) => {
  const targetCandidateIndex = candidates.findIndex(candidate => candidate.id === targetCandidateId)
  const previousCandidate = candidates[targetCandidateIndex - 1]
  const nextCandidate = candidates[targetCandidateIndex + 1]

  if (!previousCandidate && !nextCandidate) {
    return candidatePositionInterval
  }

  if (!previousCandidate && nextCandidate) {
    return Math.ceil(nextCandidate.position / 2)
  }

  if (previousCandidate && !nextCandidate) {
    return previousCandidate.position + candidatePositionInterval
  }

  return (
    previousCandidate.position +
    Math.ceil((nextCandidate.position - previousCandidate.position) / 2)
  )
}
