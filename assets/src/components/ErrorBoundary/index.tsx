import { QueryErrorResetBoundary } from 'react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { Button } from '@welcome-ui/button'
import { Flex } from '@welcome-ui/flex'
import { Logo } from '@welcome-ui/logo'

function QueryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => {
            return (
              <Flex
                backgroundColor="beige-20"
                flexGrow={1}
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                gap={100}
              >
                <Logo w="400" />
                <div style={{ textAlign: 'center' }}>
                  <p>There was an error while loading your data.</p>
                  <Button onClick={() => resetErrorBoundary()}>Try again</Button>
                </div>
              </Flex>
            )
          }}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export default QueryErrorBoundary
