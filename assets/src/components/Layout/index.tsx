import { Suspense } from 'react'
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import { Box } from '@welcome-ui/box'
import { Flex } from '@welcome-ui/flex'
import { Link } from '@welcome-ui/link'
import { Logo } from '@welcome-ui/logo'
import Loader from '../Loader'
import QueryErrorBoundary from '../ErrorBoundary'

function Layout() {
  const location = useLocation()
  return (
    <Flex backgroundColor="beige-20" h="100vh" flexDirection="column">
      <Box backgroundColor="white" p={10}>
        <Flex gap={20} alignItems="center" maxWidth={1200} margin="auto">
          <Logo w="162" />
          <Link as={RouterLink} to="/" color="neutral-70" fontWeight={600} marginLeft="auto">
            <div> Jobs</div>
          </Link>
        </Flex>
      </Box>
      <Flex flexDirection="column" overflow="hidden" flexGrow={1}>
        <QueryErrorBoundary key={location.key}>
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </QueryErrorBoundary>
      </Flex>
    </Flex>
  )
}

export default Layout
