import { createTheme, WuiProvider } from '@welcome-ui/core'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import JobIndex from './pages/JobIndex'
import Layout from './components/Layout'
import JobShow from './pages/JobShow'
import { createGlobalStyle } from 'styled-components'

const theme = createTheme()

const GlobalStyles = createGlobalStyle`
* {
  outline-color: ${theme.colors['primary-40']};
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
