import { type Endpoints } from "@octokit/types";

type UserResponse = Endpoints["GET /user"]["response"]["data"];

/**
 * Retrieve GitHub user data from the GitHub API given access token.
 * @see https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user
 */
export async function getGitHubUser(
  accessToken: string,
): Promise<UserResponse> {
  const response = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (response.status >= 400) {
    throw new Error("GitHub API error");
  }
  return (await response.json()) as UserResponse;
}
