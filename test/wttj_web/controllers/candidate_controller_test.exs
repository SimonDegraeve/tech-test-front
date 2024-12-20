defmodule WttjWeb.CandidateControllerTest do
  use WttjWeb.ConnCase

  import Wttj.JobsFixtures
  import Wttj.CandidatesFixtures

  @update_attrs %{
    position: 43.0,
    status: :interview
  }
  @invalid_attrs %{position: nil, status: nil, email: nil}

  setup %{conn: conn} do
    job = job_fixture()

    {:ok, conn: put_req_header(conn, "accept", "application/json"), job: job}
  end

  describe "index" do
    test "lists all candidates", %{conn: conn, job: job} do
      candidate = candidate_fixture(%{job_id: job.id, position: 1.0})
      conn = get(conn, ~p"/api/jobs/#{job}/candidates")

      assert json_response(conn, 200)["data"] == %{
               "hired" => [],
               "interview" => [],
               "new" => [
                 %{
                   "email" => candidate.email,
                   "id" => candidate.id,
                   "position" => candidate.position,
                   "status" => "#{candidate.status}"
                 }
               ],
               "rejected" => []
             }
    end

    test "lists candidates in specific colum", %{conn: conn, job: job} do
      candidate_fixture(%{job_id: job.id, position: 1.0})
      candidate_fixture(%{job_id: job.id, position: 3.0})
      candidate = candidate_fixture(%{job_id: job.id, position: 4.0})

      conn = get(conn, ~p"/api/jobs/#{job}/candidates?status=new&after_position=3.0")

      assert json_response(conn, 200)["data"] == [
               %{
                 "email" => candidate.email,
                 "id" => candidate.id,
                 "position" => candidate.position,
                 "status" => "#{candidate.status}"
               }
             ]
    end
  end

  describe "update candidate" do
    test "renders candidate when data is valid", %{
      conn: conn,
      job: job
    } do
      candidate = candidate_fixture(%{job_id: job.id, position: 43.0, status: "interview"})

      email = unique_user_email()
      attrs = Map.put(@update_attrs, :email, email)
      conn = put(conn, ~p"/api/jobs/#{job}/candidates/#{candidate}", candidate: attrs)

      assert json_response(conn, 200)["data"] == %{
               "id" => candidate.id,
               "email" => email,
               "position" => candidate.position,
               "status" => "interview"
             }

      conn = get(conn, ~p"/api/jobs/#{job}/candidates/#{candidate.id}")

      assert json_response(conn, 200)["data"] == %{
               "id" => candidate.id,
               "email" => email,
               "position" => candidate.position,
               "status" => "interview"
             }
    end

    test "renders errors when data is invalid", %{conn: conn, job: job} do
      candidate = candidate_fixture(%{job_id: job.id, position: 43.0, status: "interview"})
      conn = put(conn, ~p"/api/jobs/#{job}/candidates/#{candidate}", candidate: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end
end
