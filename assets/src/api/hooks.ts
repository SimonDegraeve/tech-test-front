import { useQuery } from 'react-query'
import { getCandidates, getJob, getJobs } from './fetchers'
import { useMemo } from 'react'
import { Candidate, SortedCandidates } from './types'

export const queryKeyRegistry = {
  jobs: 'jobs',
  job: (jobId: string | undefined) => ['job', jobId],
  candidates: (jobId: string | undefined) => ['candidates', jobId],
}

export const useJobs = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: queryKeyRegistry.jobs,
    queryFn: getJobs,
  })

  return { isLoading, error, jobs: data }
}

export const useJob = (jobId?: string) => {
  const { isLoading, error, data } = useQuery({
    queryKey: queryKeyRegistry.job(jobId),
    queryFn: () => getJob(jobId),
    enabled: !!jobId,
  })

  return { isLoading, error, job: data }
}

export const useCandidates = (jobId?: string) => {
  const { isLoading, error, data } = useQuery({
    queryKey: queryKeyRegistry.candidates(jobId),
    queryFn: () => getCandidates(jobId),
    enabled: !!jobId,
  })

  return { isLoading, error, candidates: data }
}

export const useSortedCandidates = (jobId?: string) => {
  const { candidates, ...rest } = useCandidates(jobId)

  const sortedCandidates = useMemo(() => {
    if (!candidates) return {}

    return candidates.reduce<SortedCandidates>((acc, c: Candidate) => {
      acc[c.status] = [...(acc[c.status] || []), c].sort((a, b) => a.position - b.position)
      return acc
    }, {})
  }, [candidates])

  return { candidates: sortedCandidates, ...rest }
}
