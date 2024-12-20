defmodule WttjWeb.JobChannel do
  use WttjWeb, :channel

  def join("job:" <> _id, _payload, socket) do
    {:ok, socket}
  end
end
