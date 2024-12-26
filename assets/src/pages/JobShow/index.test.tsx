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

  test.each([
    [
      'Up',
      {
        candidateEmail: candidates[1].email,
        from: 2,
        to: 1,
        body: '{"candidate":{"id":2,"email":"user2@email.com","position":8192,"status":"new"}}',
      },
    ],
    [
      'Left',
      {
        candidateEmail: candidates[3].email,
        from: 4,
        to: 1,
        body: '{"candidate":{"id":4,"email":"user4@email.com","position":24576,"status":"new"}}',
      },
    ],
    [
      'Down',
      {
        candidateEmail: candidates[0].email,
        from: 1,
        to: 2,
        body: '{"candidate":{"id":1,"email":"user1@email.com","position":40960,"status":"new"}}',
      },
    ],
    [
      'Right',
      {
        candidateEmail: candidates[3].email,
        from: 4,
        to: 1,
        body: '{"candidate":{"id":4,"email":"user4@email.com","position":24576,"status":"new"}}',
      },
    ],
  ])('update candidate when moving %s', async (name, { candidateEmail, from, to, body }) => {
    const updateCandidateSpy = vi.spyOn(window, 'fetch')
    const { findByText, findByRole, getByRole, getByTestId } = render(renderComponent())

    // Wait for the candidate to be rendered
    expect(await findByRole('button', { name: candidateEmail })).toBeInTheDocument()

    // Select card
    act(() => {
      fireEvent.keyDown(getByRole('button', { name: candidateEmail }), { code: 'Space' })
    })

    // Move card
    act(() => {
      fireEvent.keyDown(getByRole('button', { name: candidateEmail }), { code: `Arrow${name}` })
    })
    await findByText(`Draggable item ${from} was moved over droppable area ${to}.`)

    // Commit the change
    act(() => {
      fireEvent.keyDown(getByRole('button', { name: candidateEmail }), { code: 'Space' })
    })
    await findByText(`Draggable item ${from} was dropped over droppable area ${to}`)

    // Ensure the server get the change
    expect(updateCandidateSpy).toHaveBeenCalledWith(`${apiUrl}/jobs/1/candidates/${from}`, {
      body,
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    })

    // Ensure the  getByRole('button', { name: candidateEmail }) is in the correct column after server response
    expect(getByTestId(`column-interview`).contains(getByRole('button', { name: candidateEmail })))
  })

  test('update candidate to Right', async () => {
    const updateCandidateSpy = vi.spyOn(window, 'fetch')
    const candidateEmail = candidates[3].email
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
    await findByText('Draggable item 4 was moved over droppable area 1.')

    // Commit the change
    act(() => {
      fireEvent.keyDown(getByRole('button', { name: candidateEmail }), { code: 'Space' })
    })
    await findByText('Draggable item 4 was dropped over droppable area 1')

    // Ensure the server get the change
    expect(updateCandidateSpy).toHaveBeenCalledWith(`${apiUrl}/jobs/1/candidates/4`, {
      body: '{"candidate":{"id":4,"email":"user4@email.com","position":24576,"status":"new"}}',
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    })

    // Ensure the  getByRole('button', { name: candidateEmail }) is in the correct column after server response
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
    await findByText('Draggable item 4 was moved over droppable area 1.')

    // Commit the change
    act(() => {
      fireEvent.keyDown(getByRole('button', { name: candidateEmail }), { code: 'Space' })
    })
    await findByText('Draggable item 4 was dropped over droppable area 1')

    // Ensure the server get the change
    expect(updateCandidateSpy).toHaveBeenCalledWith(`${apiUrl}/jobs/1/candidates/4`, {
      body: '{"candidate":{"id":4,"email":"user4@email.com","position":24576,"status":"new"}}',
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    })

    // Ensure the card is in the correct column after server response
    expect(getByTestId(`column-interview`).contains(getByRole('button', { name: candidateEmail })))
  })
})
