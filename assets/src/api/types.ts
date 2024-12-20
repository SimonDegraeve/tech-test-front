export type Job = {
  id: string
  name: string
}

export type CandidateStatus = 'new' | 'interview' | 'hired' | 'rejected'

export type Candidate = {
  id: number
  email: string
  status: CandidateStatus
  position: number
}

export type SortedCandidates = Partial<Record<CandidateStatus, Candidate[]>>
