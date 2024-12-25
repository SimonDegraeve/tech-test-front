import { Button } from '@welcome-ui/button'
import { QueryErrorResetBoundary } from 'react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { Flex } from '@welcome-ui/flex'

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
                <img src="/wttj.svg" alt="Welcome to the jungle logo" style={{ width: 400 }} />
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
