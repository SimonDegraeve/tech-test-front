import { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Text } from '@welcome-ui/text'
import { Box } from '@welcome-ui/box'
import { Flex } from '@welcome-ui/flex'
import {
  CandidateStatus,
  getCandidatePositionInBetween,
  useJob,
  useUpdateCandidate,
  Candidate,
  useInfiniteCandidatesForStatus,
  maxCandidatesPerPage,
} from '../../api'
import CandidateCard from '../../components/Candidate'
import CardOrganizer from '../../components/CardOrganizer'
import { ColumnUpdate } from '../../components/CardOrganizer/helpers'

const candidateStatusColumns: CandidateStatus[] = ['new', 'interview', 'hired', 'rejected']

function JobShow() {
  const { jobId } = useParams()
  const { job } = useJob(jobId)

  const { fetchNextPage, hasNextPage, isFetchingNextPage, data } =
    useInfiniteCandidatesForStatus(jobId)

  const memoizedFetchNextPage = useCallback(
    (status: CandidateStatus, lastCandidate: Candidate) => {
      fetchNextPage({ pageParam: { status, lastPosition: lastCandidate?.position } })
    },
    [jobId]
  )

  const candidates = data?.pages?.reduce((acc, page) => {
    return (
      page &&
      Object.entries(page).reduce((acc, [status, candidates]) => {
        return {
          ...acc,
          [status]: new Map([...(acc[status as CandidateStatus] ?? []), ...candidates]),
        }
      }, acc)
    )
  }, {})

  const { mutateAsync: updateCandidate } = useUpdateCandidate(jobId)

  const sortedCandidates = useMemo(() => {
    if (!candidates) return {}

    return Object.fromEntries(
      Object.entries(candidates).map(([status, candidates]) => [
        status,
        Array.from(candidates.values()).sort((a, b) => a.position - b.position),
      ])
    )
  }, [candidates])

  const onChange = async ({ from, to, columns }: ColumnUpdate<CandidateStatus, Candidate>) => {
    const newCandidateStatus = to.sortable.containerId

    const currentCandidate = Object.values(candidates ?? {})
      .find(candidates => candidates.has(from.id))
      ?.get(from.id)

    // Skip mutation if the candidate has not changed
    const candidateHasChanged =
      currentCandidate?.position !== to.position || currentCandidate?.status !== newCandidateStatus
    if (!currentCandidate || !candidateHasChanged) {
      return
    }

    // Calculate the new candidate position based on previous and next candidate positions
    const newCandidatePosition = getCandidatePositionInBetween(
      columns[newCandidateStatus] ?? [],
      from.id
    )

    // Mutate the candidate with the new status and position
    await updateCandidate({
      ...currentCandidate,
      status: newCandidateStatus,
      position: newCandidatePosition,
    })
  }

  return (
    <>
      <Box color="neutral-70" backgroundColor="beige-30" p={20} alignItems="center">
        <Text variant="h5" m={0} maxWidth={1200} margin="auto">
          <Box as="span" color="neutral-70" fontWeight={500}>
            Candidates for :{' '}
          </Box>
          {job?.name}
        </Text>
      </Box>

      <Flex overflow="hidden" flexGrow={1} maxWidth={1200} margin="auto">
        <CardOrganizer<CandidateStatus, Candidate>
          columns={candidateStatusColumns}
          items={sortedCandidates}
          onChange={onChange}
          renderCard={candidate => <CandidateCard candidate={candidate} />}
          fetchNextPage={memoizedFetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          maxItemsCount={maxCandidatesPerPage}
        />
      </Flex>
    </>
  )
}

export default JobShow
