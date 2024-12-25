import { Box } from '@welcome-ui/box'
import { Flex } from '@welcome-ui/flex'
import { Link } from '@welcome-ui/link'
import { Suspense } from 'react'
import { Link as RouterLink, Outlet } from 'react-router-dom'
import Loader from '../Loader'

function Layout() {
  return (
    <Flex backgroundColor="beige-20" h="100vh" flexDirection="column">
      <Box backgroundColor="black" p={20}>
        <Flex>
          <Link as={RouterLink} to="/" color="white">
            <div>Jobs</div>
          </Link>
        </Flex>
      </Box>
      <Flex flexGrow={1} flexDirection="column">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </Flex>
    </Flex>
  )
}

export default Layout
