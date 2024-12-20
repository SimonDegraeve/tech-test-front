defmodule Wttj.Candidates.Candidate do
  use Ecto.Schema
  import Ecto.Changeset

  schema "candidates" do
    field :email, :string
    field :position, :float
    field :status, Ecto.Enum, values: [:new, :interview, :rejected, :hired], default: :new
    field :job_id, :id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(candidate, attrs) do
    candidate
    |> cast(attrs, [:email, :status, :position, :job_id])
    |> validate_required([:email, :status, :position, :job_id])
  end

  def magic_number do
    16384.0
  end
end
