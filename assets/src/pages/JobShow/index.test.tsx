import { describe, expect, test, vi } from 'vitest'
import { act, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render } from '../../test-utils'
import JobShow from '../../pages/JobShow'
import { candidates, jobs } from '../../test/data'
import { apiUrl } from '../../api'

describe('JobShow', () => {
  const columns = ['new', 'interview', 'hired', 'rejected']

  const renderComponent = () => (
    <MemoryRouter initialEntries={['/jobs/1']}>
      <Routes>
        <Route path="/jobs/:jobId" element={<JobShow />} />
      </Routes>
    </MemoryRouter>
  )

  test('renders job title', async () => {
    const { findByText } = render(renderComponent())

    expect(await findByText(jobs[0].name)).toBeInTheDocument()
  })

  test('renders every columns', async () => {
    const { getByText } = render(renderComponent())

    for (const column of columns) {
      expect(getByText(column)).toBeInTheDocument()
    }
  })

  test('renders candidates', async () => {
    const { findByText } = render(renderComponent())

    for (const candidate of candidates) {
      expect(await findByText(candidate.email)).toBeInTheDocument()
    }
  })

  test('update candidate to the Right', async () => {
    const updateCandidateSpy = vi.spyOn(window, 'fetch')
    const candidateEmail = candidates[0].email
    const { findByText, findByRole, getByRole, getByTestId } = render(renderComponent())

    // Wait for the candidate to be rendered
    expect(await findByRole('button', { name: candidateEmail })).toBeInTheDocument()

    // Select card
    act(() => {
      fireEvent.keyDown(getByRole('button', { name: candidateEmail }), { code: 'Space' })
    })

    // Move card to the right column
    act(() => {
      fireEvent.keyDown(getByRole('button', { name: candidateEmail }), { code: 'ArrowRight' })
    })
    await findByText('Draggable item 1 was moved over droppable area __empty__-interview.')

    // Commit the change
    act(() => {
      fireEvent.keyDown(getByRole('button', { name: candidateEmail }), { code: 'Space' })
    })
    await findByText('Draggable item 1 was dropped over droppable area __empty__-interview')

    // Ensure the server get the change
    expect(updateCandidateSpy).toHaveBeenCalledWith(`${apiUrl}/jobs/1/candidates/1`, {
      body: '{"candidate":{"id":1,"email":"user1@email.com","position":16384,"status":"interview"}}',
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    })

    // Ensure the card is in the correct column after server response
    expect(getByTestId(`column-interview`).contains(getByRole('button', { name: candidateEmail })))
  })

  test('update candidate to the Left', async () => {
    const updateCandidateSpy = vi.spyOn(window, 'fetch')
    const candidateEmail = candidates[3].email
    const { findByText, findByRole, getByRole, getByTestId } = render(renderComponent())

    // Wait for the candidate to be rendered
    expect(await findByRole('button', { name: candidateEmail })).toBeInTheDocument()

    // Select card
    act(() => {
      fireEvent.keyDown(getByRole('button', { name: candidateEmail }), { code: 'Space' })
    })

    // Move card to the left column
    act(() => {
      fireEvent.keyDown(getByRole('button', { name: candidateEmail }), { code: 'ArrowLeft' })
    })
    await findByText('Draggable item 4 was moved over droppable area __empty__-interview.')

    // Commit the change
    act(() => {
      fireEvent.keyDown(getByRole('button', { name: candidateEmail }), { code: 'Space' })
    })
    await findByText('Draggable item 4 was dropped over droppable area __empty__-interview')

    // Ensure the server get the change
    expect(updateCandidateSpy).toHaveBeenCalledWith(`${apiUrl}/jobs/1/candidates/4`, {
      body: '{"candidate":{"id":4,"email":"user4@email.com","position":40960,"status":"interview"}}',
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    })

    // Ensure the card is in the correct column after server response
    expect(getByTestId(`column-interview`).contains(getByRole('button', { name: candidateEmail })))
  })
})
