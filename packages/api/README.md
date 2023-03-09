# `@acme/api`

The main interface for the API of the application. This package contains the tRPC server that is then used by the Next.js app to host the API.

For an introduction to tRPC, the best resource to get started is Theo's video on it:

[![tRPC - The React Framework for APIs](https://i.ytimg.com/vi/cHWFwtX0TLU/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBSm-WF5fDfd9asRZpZ9m0JAmEVOQ)](https://www.youtube.com/watch?v=0ZJgIjIuY7U)

## Directory Structure

Here is a breakdown of the directory structure of this package:

```text
api
  ├─ index.ts -- exports the tRPC router and types
  |
  └─ src
       ├─ trpc.ts -- Intializes context and defines procedure types
       ├─ root.ts -- Joins all the subrouters into a single root router
       ├─ router
       |    ├─ auth.ts   -- Authentication router
       |    ├─ class.ts  -- Router for the Class model
       |    ├─ events.ts -- Router for the Event model
       |    ├─ post.ts   -- Router for the Post model
       |    ├─ school.ts -- Router for the School model
       |    ├─ user.ts   -- Router for the User model
       └─ utils
            ├─ getGithubUser.ts -- Fetches a user from the GitHub API
            ├─ getUserFromId.ts -- Fetches a user from the database
            └─ uploadImage.ts   -- Uploads an image to Imgbb
```
