import { describe, expect, test } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render } from '../../test-utils'
import JobIndex from '../../pages/JobIndex'
import { jobs } from '../../test/data'

describe('Layout', () => {
  const renderComponent = () => (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<JobIndex />} />
      </Routes>
    </MemoryRouter>
  )

  test('renders every jobs', async () => {
    const { findByRole } = render(renderComponent())

    for (const job of jobs) {
      const element = await findByRole('link', { name: job.name })
      expect(element).toBeInTheDocument()
      expect(element).toHaveAttribute('href', `/jobs/${job.id}`)
    }
  })
})
