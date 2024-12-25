import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { apiUrl } from '../api'
import { jobCandidates, jobs } from './data'

export const handlers = [
  http.get(`${apiUrl}/jobs/:jobId`, () => {
    return HttpResponse.json({ data: jobs[0] })
  }),

  http.get(`${apiUrl}/jobs/:jobId/candidates`, () => {
    return HttpResponse.json({ data: jobCandidates })
  }),

  http.patch(`${apiUrl}/jobs/:jobId/candidates/:candidateId`, req => {
    return HttpResponse.json({
      data: Object.values(jobCandidates)
        .flat()
        .find(candidate => candidate.id.toString() === req.params.candidateId),
    })
  }),
]

const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Drag and drop features rely on scrollIntoView which is not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = function () {}
