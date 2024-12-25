import { useMutation, useQuery, useQueryClient } from 'react-query'
import { getCandidates, getJob, getJobs, updateCandidate } from './fetchers'
import { Candidate, CandidateStatus } from './types'
import { toast, Toast } from '@welcome-ui/toast'

/**
 * Registry of query keys used in the app
 *
 * Note: Always use a query key from this registry accross the app to avoid typos and make it easier to find all the places where a query key is used.
 */

export const queryKeyRegistry = {
  jobs: 'jobs',
  job: (jobId: string | undefined) => ['job', jobId],
  candidates: (jobId: string | undefined) => ['candidates', jobId],
}

/**
 * ReactQuery hooks to interact with the API
 */

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

type CandidateId = string | number
type CandidatesResponse = Partial<Record<CandidateStatus, Map<CandidateId, Candidate>>>

export const useCandidates = (
  jobId?: string
): {
  isLoading: boolean
  error: unknown
  candidates: CandidatesResponse | null | undefined
} => {
  const { isLoading, error, data } = useQuery({
    queryKey: queryKeyRegistry.candidates(jobId),
    queryFn: () =>
      getCandidates(jobId).then(data =>
        data
          ? Object.fromEntries(
              Object.entries(data).map(([status, candidates]) => [
                status,
                new Map(candidates.map(candidate => [candidate.id, candidate])),
              ])
            )
          : {}
      ),
    enabled: !!jobId,
  })

  return { isLoading, error, candidates: data }
}

// USE MAP

export const useUpdateCandidate = (jobId?: string) => {
  const queryClient = useQueryClient()
  const candidatesQueryKey = queryKeyRegistry.candidates(jobId)

  return useMutation({
    mutationFn: (candidate: Candidate) => updateCandidate(jobId, candidate),
    onMutate: async candidate => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: candidatesQueryKey })

      // Snapshot the previous value
      const previousCandidates = queryClient.getQueryData<CandidatesResponse>(candidatesQueryKey)

      // Optimistically update to the new value
      queryClient.setQueryData<CandidatesResponse>(candidatesQueryKey, oldCandidates =>
        Object.fromEntries(
          Object.entries(oldCandidates ?? { [candidate.status]: [] }).map(
            ([status, candidates]) => {
              let hasChanged = false

              if (candidates.has(candidate.id)) {
                hasChanged = true
                candidates.delete(candidate.id)
              }

              if (status === candidate.status) {
                hasChanged = true
                candidates.set(candidate.id, candidate)
              }

              return [status, hasChanged ? new Map(candidates) : candidates]
            }
          )
        )
      )

      // Return a context object with the snapshotted value
      return { previousCandidates }
    },

    onError: (err, newCandidate, context) => {
      // If the mutation fails,
      // use the context returned from onMutate to roll back
      if (context?.previousCandidates) {
        queryClient.setQueryData<CandidatesResponse>(candidatesQueryKey, context.previousCandidates)
      }

      console.log('---------')
      // NOTE: should monitor the error via Sentry/Datadog or other error tracking service
      toast(
        <Toast.Growl variant="danger">
          <Toast.Title>Oops! An error occurred.</Toast.Title>
          Could not update the candidate "{newCandidate?.email}"
        </Toast.Growl>
      )
    },
    onSettled: () => {
      // Optionally: refetch after error or success:
      // queryClient.invalidateQueries({ queryKey: candidatesQueryKey })
    },
  })
}
