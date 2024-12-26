// API url, should be configured to be different in production, with environment variables
export const apiUrl = 'http://localhost:4000/api'

// Allow to handle many manipulations on the candidate position, value taken from the backend
export const candidatePositionInterval = 16384 // 2^14 allow up to 14 permutations

export const maxCandidatesPerPage = 10
