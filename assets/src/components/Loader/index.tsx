import { Flex } from '@welcome-ui/flex'

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
      <img
        src="/wttj.svg"
        alt="Welcome to the jungle logo"
        style={{
          animation: 'pulse 2s infinite ease-in-out',
        }}
      />
      <div>Loading...</div>
    </Flex>
  )
}

export default Loader
