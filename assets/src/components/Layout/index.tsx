import { Box } from '@welcome-ui/box'
import { Flex } from '@welcome-ui/flex'
import { Link } from '@welcome-ui/link'

import { Suspense } from 'react'
import { Link as RouterLink, Outlet } from 'react-router-dom'
import Loader from '../Loader'
import QueryErrorBoundary from '../ErrorBoundary'

function Layout() {
  return (
    <Flex backgroundColor="beige-20" h="100vh" flexDirection="column">
      <Box backgroundColor="white" p={10}>
        <Flex gap={20} alignItems="center" maxWidth={1200} margin="auto">
          <img
            src="/wttj.svg"
            alt="Welcome to the jungle logo"
            style={{ width: 162, marginRight: 20 }}
          />
          <Link as={RouterLink} to="/" color="neutral-70" fontWeight={600}>
            <div> Jobs</div>
          </Link>
        </Flex>
      </Box>
      <Flex flexDirection="column" overflow="hidden" flexGrow={1}>
        <QueryErrorBoundary>
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </QueryErrorBoundary>
      </Flex>
    </Flex>
  )
}

export default Layout
