alias Wttj.Candidates.Candidate

{:ok, job} = Wttj.Jobs.create_job(%{name: "Full Stack Developer"})

Wttj.Candidates.create_candidate(%{
  job_id: job.id,
  email: "user1@wttj.co",
  position: Candidate.magic_number()
})

Wttj.Candidates.create_candidate(%{
  job_id: job.id,
  email: "user2@wttj.co",
  position: Candidate.magic_number() * 2
})

Wttj.Candidates.create_candidate(%{
  job_id: job.id,
  email: "user3@wttj.co",
  position: Candidate.magic_number(),
  status: :interview
})

Wttj.Candidates.create_candidate(%{
  job_id: job.id,
  email: "user4@wttj.co",
  position: Candidate.magic_number(),
  status: :rejected
})

Wttj.Candidates.create_candidate(%{
  job_id: job.id,
  email: "user5@wttj.co",
  position: Candidate.magic_number() * 2,
  status: :rejected
})

{:ok, job2} = Wttj.Jobs.create_job(%{name: "Frontend Developer (2K candidates)"})

Ecto.Enum.values(Candidate, :status)
|> IO.inspect()
|> Enum.map(&{&1, Enum.random(300..600)})
|> Enum.each(fn {status, count} ->
  Enum.each(1..count, fn i ->
    Wttj.Candidates.create_candidate(%{
      job_id: job2.id,
      email: "user#{System.unique_integer()}@wttj.co",
      position: Candidate.magic_number() * i,
      status: status
    })
  end)
end)
