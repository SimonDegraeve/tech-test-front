# Run the backend and frontend in parallel
(
    trap 'kill 0' SIGINT; \
    # Start the backend
    docker compose up -d && mix phx.server & \
    # Start the frontend
    cd assets && yarn && yarn dev \
) 
