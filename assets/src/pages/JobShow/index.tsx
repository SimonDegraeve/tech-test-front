import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Text } from '@welcome-ui/text'
import { Box } from '@welcome-ui/box'

import {
  CandidateStatus,
  getCandidatePosition,
  useCandidates,
  useJob,
  useUpdateCandidate,
} from '../../api'
import { Candidate } from '../../api'
import CandidateCard from '../../components/Candidate'
import CardOrganizer, { ColumnUpdate } from '../../components/CardOrganizer'

const candidateStatusColumns: CandidateStatus[] = ['new', 'interview', 'hired', 'rejected']

function JobShow() {
  const { jobId } = useParams()

  const { job } = useJob(jobId)
  const { candidates } = useCandidates(jobId)
  const { mutateAsync } = useUpdateCandidate(jobId)

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
    const isAscendingOrder = from.sortable.index > to.sortable.index
    const newCandidatePosition = getCandidatePosition(
      columnCandidates as Candidate[],
      to.sortable.index,
      isAscendingOrder
    )

    // Mutate the candidate with the new status and position
    await mutateAsync({
      ...currentCandidate,
      status: newCandidateStatus,
      position: newCandidatePosition,
    })
  }

  return (
    <>
      <Box backgroundColor="neutral-70" p={20} alignItems="center">
        <Text variant="h5" color="white" m={0}>
          {job?.name}
        </Text>
      </Box>

      <CardOrganizer<CandidateStatus, Candidate>
        columns={candidateStatusColumns}
        items={sortedCandidates}
        onChange={onChange}
        renderCard={candidate => <CandidateCard candidate={candidate} />}
      />
    </>
  )
}

export default JobShow
