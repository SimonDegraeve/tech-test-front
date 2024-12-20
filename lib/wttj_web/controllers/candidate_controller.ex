defmodule WttjWeb.CandidateController do
  use WttjWeb, :controller

  alias WttjWeb.CandidateJSON
  alias Wttj.Candidates
  alias Wttj.Candidates.Candidate

  action_fallback WttjWeb.FallbackController

  def index(conn, %{"job_id" => job_id, "status" => status} = params) do
    candidates = Candidates.list_candidates(job_id, status, Map.get(params, "after_position", 0))
    render(conn, :index, candidates: candidates)
  end

  def index(conn, %{"job_id" => job_id}) do
    candidates =
      Ecto.Enum.values(Candidate, :status)
      |> Enum.into(%{}, fn status ->
        {status, Candidates.list_candidates(job_id, status)}
      end)

    render(conn, :initial, candidates: candidates)
  end

  def show(conn, %{"job_id" => job_id, "id" => id}) do
    candidate = Candidates.get_candidate!(job_id, id)
    render(conn, :show, candidate: candidate)
  end

  def update(conn, %{"job_id" => job_id, "id" => id, "candidate" => candidate_params}) do
    candidate = Candidates.get_candidate!(job_id, id)

    with {:ok, %Candidate{} = candidate} <-
           Candidates.update_candidate(candidate, candidate_params) do
      broadcast_update(candidate)
      render(conn, :show, candidate: candidate)
    end
  end

  defp broadcast_update(candidate) do
    WttjWeb.Endpoint.broadcast(
      "job:#{candidate.job_id}",
      "candidate:update",
      CandidateJSON.show(%{candidate: candidate})
    )
  end
end
