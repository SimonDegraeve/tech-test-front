import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Text } from '@welcome-ui/text'
import { Box } from '@welcome-ui/box'
import { Flex } from '@welcome-ui/flex'
import {
  CandidateStatus,
  getCandidatePosition,
  useCandidates,
  useJob,
  useUpdateCandidate,
  Candidate,
} from '../../api'
import CandidateCard from '../../components/Candidate'
import CardOrganizer, { ColumnUpdate } from '../../components/CardOrganizer'

const candidateStatusColumns: CandidateStatus[] = ['new', 'interview', 'hired', 'rejected']

function JobShow() {
  const { jobId } = useParams()

  const { job } = useJob(jobId)
  const { candidates } = useCandidates(jobId)
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

  const onChange = async ({ from, to }: ColumnUpdate<CandidateStatus, Candidate>) => {
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

    // Get the candidates of the new column
    const columnCandidates = to.sortable.items.map(id =>
      Object.values(candidates ?? {})
        .find(candidates => candidates.has(id))
        ?.get(id)
    )
    if (columnCandidates.some(candidate => !candidate)) {
      return
    }

    // Calculate the new candidate position based on ascending or descending order
    const isDescendingOrder = from.sortable.index > to.sortable.index
    const newCandidatePosition = getCandidatePosition(
      columnCandidates as Candidate[],
      to.sortable.index,
      isDescendingOrder
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
        />
      </Flex>
    </>
  )
}

export default JobShow
