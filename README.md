# Frontend technical test

Design and implement a scalable, real-time Kanban board application for managing candidate workflows

<img width="1463" alt="image" src="https://github.com/user-attachments/assets/7a9b1201-48b6-41fb-8b89-983dc3836e3e" />

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

### Technical decisions and trade-offs

#### Backend

- Use [docker-compose](https://docs.docker.com/compose/) to isolate the PostgreSQL database required for the project from the host
- Added `plug-cors` dependency to allow requests from the frontend (allow all origins in development mode, should be allowed to some specific origins in production). This was the most popular CORS library for Elixir and Phoenix (https://hex.pm/packages?search=cors&sort=recent_downloads)
- Created a `run-dev` bash script to easily start the backend and the frontend in parallel

#### Frontend

- As a drag-and-drop behavior is complex and requires a lot of effort to implement from scratch, I decided to look for a library that would already implement the core functionality and would allow me to focus on the application logic.

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

  I settled on `dnd-kit` with the [sortable](https://docs.dndkit.com/presets/sortable) because it met all the criteria and the documentation was very good.

- I created a generic `CardOrganizer` component (data agnostic) that handles the drag-and-drop logic and the rendering of the columns and cards. This allows for a more modular and reusable codebase. The columns are memoized to avoid unnecessary re-renders (with the assumption that the data displays inside the card (ex: user email) will not change during the lifecycle of the component). I used the reference forwarding pattern to allow the parent component to control the state of the cards and columns without too many wrapper nodes (useful for display the card overlay). I created a system of placeholder for empty lists so the user can trigger the collision detection and drop the card in an empty column.

- For the calculation of the new candidate position after reordering, I used an algorithm to set the candidate new position to be half-way between the previous and the next candidate in the same column. This way the user can reorder the cards multiple times without the need to shift the position of all the other cards, this is efficient but is not unlimited as the position of the cards will ultimately converge to 1 if the user keeps reordering the cards. The maximum interval between two positions is 16384 (value taken from the backend DB that allow up to 14 permutations, 16384=2^14).

- I used the features from `react-query` to handle a centralized cache with optimistic and atomic updates. I did not invalidate the cache after a mutation, as I assume that a successful PATCH call means the client update can be trusted. I kept the default query options to re-fetch the data when the window is focused to keep the data up-to-date.

- I explored the [welcome-ui](https://www.welcome-ui.com/components) design system to know which components are available and how to use them (ex: Logo, Loader, Toast, etc)

- I updated the design of the columns to take the full height of the screen to get the same design no matter the number of cards in the columns. Columns are also independently scrollable while displaying all essential info (page title, column title, etc) so the user can align cards from different columns as they please (ex: show beginning of first column and end of second column at the same time). I also added an animation to rotate the dragged card to give a visual feedback to the user and created a semi transparent card preview to show where the card will be dropped. I also used the theme from the welcome-ui design system to have a consistent design with the branding (ex: yellow outline when moving cards with the keyboard).

- I handled the queries loading states with (Suspense)[https://react.dev/reference/react/Suspense] and a nice looking loader, so the user knows can differentiate between loading and empty state (ex: candidates count being 0 while loading, can be confusing for the user).

- I handled the queries error states with (ErrorBoundaries)[https://legacy.reactjs.org/docs/error-boundaries.html] to inform the user of the eventual error and give them the ability to retry the operation. The mutations errors are handled within the component triggering the mutation to give a more specific error message to the user with a Toast notification.

- I used [`mock-service-wortker`](https://mswjs.io/) to mock the API calls and data manipulation. This allow fine-grained control over the API responses and the ability to test edge network cases and error handling. It is more powerful than mocking `react-query`

- I did not have time to implement the real-time synchronization between users, but I would have used change the `staleTime` and `refetchInterval` settings of react-query to let most of updates come from the socket connection. I tried to use the `socket.io` library to handle the WebSocket connection with the server, but I then realized I would probably need to use something like [Phoenix LiveView](https://hexdocs.pm/phoenix_live_view/js-interop.html). I am not too familiar with Elixir/Phoenix yet, I decided to focus on having a full working page for the user, before adding this bonus feature.

### Future improvements

Related to the features:

- Support selecting multiple cards at once
- Virtual list rendering for card columns, so we can handle even more candidates per column efficiently
- Get total number of candidates per status, as the backend is paginated, we would need an endpoint to get the total number of candidates and not rely on the partial number of candidates returned by the endpoint, this is more performant.

General:

- E2E tests with Cypress/Playwright etc, especially for the drag-and-drop behavior, real browser behavior with those complex events cannot be fully tested with unit/integration tests as they rely on jsdom which is just a simulation of the browser environment
- Zod or Yup for validation of any data coming from outside the web application
- Authentication
- Offline mode
- Internationalization
- Monitoring/logging/error tracking (with Sentry, Datadog, etc)
- CI/CD pipeline

## Setup instructions

Locally:

- Run `./run-dev` to start the project in Development mode (backend on port 4000 and frontend on port 5173)

- `cd assets && yarn test` to run the frontend tests

## Screenshots

<img width="1461" alt="image" src="https://github.com/user-attachments/assets/e69e52eb-38fd-47b8-be92-776fefa23e55" />

<img width="1461" alt="image" src="https://github.com/user-attachments/assets/5c244e57-f445-4063-bfaf-cf15297c5a8c" />

<img width="1465" alt="image" src="https://github.com/user-attachments/assets/4352b606-57ba-4481-8621-16a621a3706f" />

<img width="1461" alt="image" src="https://github.com/user-attachments/assets/9c82c0da-94c2-4802-bf3c-59c6f8d15b8d" />
