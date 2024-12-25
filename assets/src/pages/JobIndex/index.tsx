import { Link as RouterLink } from 'react-router-dom'
import { Link } from '@welcome-ui/link'
import { Text } from '@welcome-ui/text'
import { Box } from '@welcome-ui/box'
import { useJobs } from '../../api'

function JobIndex() {
  const { jobs } = useJobs()

  return (
    <>
      <Box color="neutral-70" backgroundColor="beige-30" p={20} alignItems="center">
        <Text variant="h5" m={0} maxWidth={1200} margin="auto">
          List of opened jobs :
        </Text>
      </Box>

      <Box as="ul" maxWidth={1200} margin="20 auto" w="100%">
        {jobs?.map(job => (
          <li key={job.id}>
            <Link as={RouterLink} to={`/jobs/${job.id}`}>
              {job.name}
            </Link>
          </li>
        ))}
      </Box>
    </>
  )
}

export default JobIndex
