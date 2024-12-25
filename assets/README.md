# Frontend technical test

Design and implement a scalable, real-time Kanban board application for managing candidate workflows

## Project overview

### Features

- Drag-and-drop functionality for cards:
  - [x] Within the same column
  - [x] Between different columns
  - [x] With proper handling of a11y
- [x] Proper handling of card positioning and ordering
- [ ] Real-time synchronization between users

### Performances

- [x] Centralized cache with optimistic and atomic updates
- [x] Design for scale (DOM size, minimum re-renders, hours of usage without a reload)
- [x] Handle thousands of candidates per column efficiently
- [ ] Handle hundreds of operations made by concurrent users

### Architecture

The given template was a "simple" Single Page Application using React without any server-side rendering or other hybrid approach, so I kept it that way since considering another approach would require more context and would probably be outside the scope of this test.

This is the file structure of the SPA:

```
|--- public                     // Static files
|--- src                        // Source files
|    |--- api                   // API calls and data manipulation
|    |--- components            // Reusable components
|    |--- pages                 // Pages entry points
|    |--- test                  // Testing setup and utilities
```

<!-- TODO -->

### Technical decisions and trade-offs

#### Backend

- Use [docker-compose](https://docs.docker.com/compose/) to isolate the PostgreSQL database required for the project from the host
- Added `plug-cors` dependency to allow requests from the frontend (allow all origins in development mode, can be allowed to some specific origins in production). This was the most popular CORS library for Elixir and Phoenix (https://hex.pm/packages?search=cors&sort=recent_downloads)
- Created a `run-dev` bash script to easily start the backend and the frontend in parallel

#### Frontend

- As a Drag-and-drop behavior is complex and requires a lot of effort to implement from scratch, I decided to look for a library that would already implement the core functionality and would allow me to focus on the application logic.

  The criteria for choosing the library were (in no particular order as all of them are important):

  - Active development
  - Licence and release frequency/quality
  - Good documentation
  - Wide browser support (including Mobile)
  - Top performance
  - Top accessibility
  - React-based or compatible
  - Style agnostic or customizable or based on styled-components as it is the CSS-in-JS library used in the project

  The libraries I considered were:

  - react-aria/dnd (https://react-spectrum.adobe.com/react-aria/dnd.html)
  - react-beautiful-dnd (https://github.com/atlassian/react-beautiful-dnd)
  - pragmatic-drag-and-drop (https://github.com/atlassian/pragmatic-drag-and-drop)
  - dnd-kit (https://github.com/clauderic/dnd-kit)

  I quickly discarded `react-aria/dnd` as the maintainability seemed low (ex: introduce breaking changes in minor version https://www.reddit.com/r/reactjs/comments/1css7vy/comment/lpgh3gs).

  I also discarded `react-beautiful-dnd` as it has been deprecated in favor of `pragmatic-drag-and-drop`.

  `pragmatic-drag-and-drop` was a very compelling option as it is developed by Atlassian (very much battle-tested) but the styling was quite opinionated and using a different Css-in-JS library (Emotion) and the project rely a lot on other packages.

  I settled on `dnd-kit` because it met all the criteria and the documentation was very good. // pattern ref forwarding

- I create a generic `CardOrganizer` component (data agnostic) that handles the drag-and-drop logic and the rendering of the columns and cards. This allows for a more modular and reusable codebase. The columns are memoized to avoid unnecessary re-renders. I used the reference forwarding pattern to allow the parent component to control the state of the cards and columns without too much wrapper nodes (useful for display the card overlay).

- I used [`mock-service-wortker`](https://mswjs.io/) to mock the API calls and data manipulation. This allow fine-grained control over the API responses and the ability to test edge network cases and error handling. It is more powerful than mocking `react-query`

### Future improvements

- Internationalization
- Dark mode
- Offline mode
- Authentication
- Zod or Yup for validation
- Virtual lists far card columns
- Monitoring/logging/error tracking (with Sentry, Datadog, etc)
- Multi select
- Get total number of candidates per status
- Load more candidates on column scroll (load per column as the backend endpoint returns date per column)

## Setup instructions

Locally:

- Run `./run-dev` to start the project in Development mode (backend on port 4000 and frontend on port 5173)

<!-- TODO: add live demo link -->
