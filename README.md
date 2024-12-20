# Wttj

## Requirements

- Elixir 1.17.2-otp-27
- Erlang 27.0.1
- Nodejs 20.11.0
- Postgresql
- Yarn

At WTTJ we use [ASDF](https://asdf-vm.com/) to manage our language version. If you have asdf install just run `asdf install`.

## Getting started

To start your Phoenix server:

- Run `mix setup` to install and setup dependencies: This will also create a db with two jobs (one with lot of candidates)
- Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`
- install assets and start front

```bash
cd assets
yarn
yarn dev
```

### tests

- backend: `mix test`
- front: `cd assets & yarn test`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

# Backend documentation

## Real Time

- A websocket connection is available at `ws://localhost:4000/socket/websocket`
- A Job channel is available to listen candidate update and can be subscribed by using this topic `job:<ID>`
- You can use [Phoenix](https://www.npmjs.com/package/phoenix) library

## API Reference

### Jobs

**List jobs**

`GET http://localhost:4000/api/jobs`

```jsonc
{
    "data": [
        {"id": 1, "name": "Full Stack developer"}
        {"id": 2, "name": "Senior Frontend developer"}
        #...
    ]
}
```

**Get a job**
`GET http://localhost:4000/api/jobs/:id`

| Parameter | Description                           |
| --------- | ------------------------------------- |
| job_id    | ID of the job to list candidates from |

```jsonc
{
  "data": {
    "id": 1,
    "name": "Full Stack developer"
  }
}
```

### Candidates

**List candidates for a given job**

`GET http://localhost:4000/api/jobs/:job_id/candidates`

This endpoint return an initial payload with 10 first candidates per column. see next endpoint to handle pagination.

| Parameter | Description                           |
| --------- | ------------------------------------- |
| job_id    | ID of the job to list candidates from |

```jsonc
{
    "data": {
        "new": [
            {
                "id": 1,
                "position": 16384.0,
                "status": "new",
                "email": "user1@wttj.co"
            },
            #...
        ],
        "rejected": [
            #...
        ],
        "interview": [
            #...
        ]
    }
}
```

**List candidates for a given column & after a given position**

`GET http://localhost:4000/api/jobs/:job_id/candidates?status=hired&after_position=16384.0`

| Parameter      | Description                                                           |
| -------------- | --------------------------------------------------------------------- |
| status         | Filter candidates by status (`new`, `interview`, `rejected`, `hired`) |
| after_position | Get candidates after this position value                              |

```jsonc
{
    "data": [
        {
            "id": 1,
            "position": 16384.0,
            "status": "new",
            "email": "user1@wttj.co"
        },
        #...
    ]
}
```

**Get a candidate**

`GET http://localhost:4000/api/jobs/:job_id/candidates/:id`

| Parameter | Description                     |
| --------- | ------------------------------- |
| job_id    | ID of the job                   |
| id        | ID of the candidate to retrieve |

```jsonc
{
  "data": {
    "id": 4,
    "position": 16384.0,
    "status": "rejected",
    "email": "user4@wttj.co"
  }
}
```

**Update a candidate**

`PUT/PATCH http://localhost:4000/api/jobs/:job_id/candidates/:id`

| Parameter | Description                   |
| --------- | ----------------------------- |
| job_id    | ID of the job                 |
| id        | ID of the candidate to update |

| Body     | Description                                                       |
| -------- | ----------------------------------------------------------------- |
| email    | Email of the candidate (required)                                 |
| position | Position of the candidate in the column (optional)                |
| status   | Status of the candidate (`new`, `interview`, `rejected`, `hired`) |

```jsonc
{
  "data": {
    "id": 4,
    "position": 16384.0,
    "status": "rejected",
    "email": "user4@wttj.co"
  }
}
```

On successful update, a message is dispatched on the corresponding job channel (ex: `job:1`) with the same payload.

## Learn more

- Official website: https://www.phoenixframework.org/
- Guides: https://hexdocs.pm/phoenix/overview.html
- Docs: https://hexdocs.pm/phoenix
- Forum: https://elixirforum.com/c/phoenix-forum
- Source: https://github.com/phoenixframework/phoenix
