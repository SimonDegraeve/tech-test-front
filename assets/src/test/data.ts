export const jobs = [
  {
    id: 1,
    name: 'Job 1',
  },
]

export const candidates = [
  {
    id: 1,
    email: 'user1@email.com',
    position: 16384,
    status: 'new' as const,
  },
  {
    id: 2,
    email: 'user2@email.com',
    position: 32768,
    status: 'new' as const,
  },
  {
    id: 3,
    email: 'user3@email.com',
    position: 49152,
    status: 'new' as const,
  },
  {
    id: 4,
    email: 'user4@email.com',
    position: 65536,
    status: 'rejected' as const,
  },
]

export const jobCandidates = {
  new: [candidates[0], candidates[1], candidates[2]],
  interview: [],
  hired: [],
  rejected: [candidates[3]],
}
