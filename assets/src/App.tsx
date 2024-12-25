import { createTheme, WuiProvider } from '@welcome-ui/core'
import { createGlobalStyle } from 'styled-components'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import JobIndex from './pages/JobIndex'
import Layout from './components/Layout'
import JobShow from './pages/JobShow'

const theme = createTheme()

const GlobalStyles = createGlobalStyle`
* {
  outline-color: ${theme.colors['primary-40']};
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}
`

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <JobIndex /> },
      { path: 'jobs/:jobId', element: <JobShow /> },
    ],
  },
])

function App() {
  return (
    <>
      <GlobalStyles />
      <WuiProvider theme={theme}>
        <RouterProvider router={router} />
      </WuiProvider>
    </>
  )
}

export default App
