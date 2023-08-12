import { Platform } from "react-native";
import { useAtom } from "jotai";

import { tokenAtom } from "../store";
import { api } from "./api";

export const usePostSubscription = (
  postsParams: NonNullable<
    Parameters<
      ReturnType<(typeof api)["useContext"]>["post"]["all"]["getInfiniteData"]
    >[0]
  >,
  userId: string | undefined,
  postsQuery: ReturnType<
    | (typeof api)["post"]["all"]["useInfiniteQuery"]
    | (typeof api)["post"]["all"]["useQuery"]
  >,
) => {
  // Cache utilities
  const util = api.useContext();

  // Get token from store
  const [token] = useAtom(tokenAtom);

  // Subscribe to posts
  api.post.onPost.useSubscription(
    {
      token,
      userId,
    },
    {
      async onData(data) {
        console.log(Platform.OS, data);

        if (data.authorId === userId) {
          return;
        }

        const recentPostsData = util.post.all.getInfiniteData(postsParams)!;

        if (recentPostsData.pages.length) {
          util.post.all.setInfiniteData(postsParams, (postsData) => {
            return {
              ...postsData!,
              pages: [
                {
                  ...postsData!.pages[0]!,
                  posts: [data, ...postsData!.pages[0]!.posts],
                },
                ...postsData!.pages.slice(1),
              ],
            };
          });
        } else {
          void util.post.all.invalidate();
          void postsQuery.refetch();
        }
      },
      onError(err) {
        console.error("Subscription error", err);
        void util.post.all.invalidate();
        void postsQuery.refetch();
      },
    },
  );
};
