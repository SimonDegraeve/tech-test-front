type Job = {
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

const apiUrl = 'http://localhost:4000/api'

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
  jobId?: string,
  candidateStatus?: CandidateStatus
): Promise<Candidate[]> => {
  if (!jobId) return []
  const response = await fetch(`${apiUrl}/jobs/${jobId}/candidates`)
  const { data }: { data: Record<CandidateStatus, Candidate[]> } = await response.json()

  if (candidateStatus) {
    return data[candidateStatus]
  }

  return Object.values(data).flat()
}
