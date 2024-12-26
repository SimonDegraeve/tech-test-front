import { apiUrl } from './config'
import { Candidate, CandidateStatus, Job } from './types'

export const getJobs = async (): Promise<Job[]> => {
  const response = await fetch(`${apiUrl}/jobs`)
  const { data } = await response.json()
  return data
}

export const getJob = async (jobId?: string): Promise<Job | null> => {
  if (!jobId) return null
  const response = await fetch(`${apiUrl}/jobs/${jobId}`)
  const { data } = await response.json()
  return data
}

export const getCandidates = async (
  jobId?: string
): Promise<Record<CandidateStatus, Candidate[]> | null> => {
  if (!jobId) return null
  const response = await fetch(`${apiUrl}/jobs/${jobId}/candidates`)
  const { data }: { data: Record<CandidateStatus, Candidate[]> } = await response.json()
  return data
}

export const getCandidatesForStatus = async (
  jobId?: string,
  candidateStatus?: CandidateStatus,
  afterPosition?: number
): Promise<Candidate[] | Record<CandidateStatus, Candidate[]> | null> => {
  if (!jobId) return []
  const params = new URLSearchParams(
    [
      candidateStatus ? [['status', candidateStatus]] : [],
      afterPosition ? [['after_position', afterPosition.toString()]] : [],
    ].flat()
  )
  const response = await fetch(`${apiUrl}/jobs/${jobId}/candidates?${params}`)
  const { data }: { data: Candidate[] } = await response.json()
  return data
}

export const updateCandidate = async (
  jobId?: string,
  candidate?: Candidate
): Promise<Candidate | null> => {
  if (!jobId || !candidate) return null
  const response = await fetch(`${apiUrl}/jobs/${jobId}/candidates/${candidate.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidate }),
  })
  const { data } = await response.json()
  return data
}
