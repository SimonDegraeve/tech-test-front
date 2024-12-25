import { describe, expect, test } from 'vitest'

import { render } from '../../test-utils'
import JobShow from '../../pages/JobShow'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

describe('JobShow', () => {
  const columns = ['new', 'interview', 'hired', 'rejected']

  const renderComponent = () => (
    <MemoryRouter initialEntries={['/jobs/1']}>
      <Routes>
        <Route path="/jobs/:jobId" element={<JobShow />} />
      </Routes>
    </MemoryRouter>
  )

  test('renders every columns', async () => {
    const { getByText } = render(renderComponent())

    for (const column of columns) {
      expect(getByText(column)).toBeInTheDocument()
    }
  })
})
