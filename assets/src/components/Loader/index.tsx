import { Flex } from '@welcome-ui/flex'
import { WelcomeLoader } from '@welcome-ui/welcome-loader'

function Loader() {
  return (
    <Flex
      backgroundColor="beige-20"
      flexGrow={1}
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      gap={100}
    >
      <WelcomeLoader />
      <div>Loading...</div>
    </Flex>
  )
}

export default Loader
