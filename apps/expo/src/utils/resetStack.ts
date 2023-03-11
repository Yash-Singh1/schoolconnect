// Reset the stack to the root and optionally push a new route

import { type useNavigation, type useRouter } from "expo-router";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any type is required for this generic to work properly
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

/**
 * @param ctx Contains the router and navigation objects, each from `useRouter` and `useNavigation` respectively
 * @param nextRoute A route to push on top of the root route, optional
 */
export function resetStack(
  ctx: {
    router: GetReturnType<typeof useRouter>;
    navigation: GetReturnType<typeof useNavigation>;
  },
  nextRoute?: string,
) {
  /* eslint-disable @typescript-eslint/no-unsafe-call */
  // @ts-expect-error -- TODO: Again the typings forgot this function
  if (ctx.navigation.getState().index > 0) ctx.navigation.popToTop();
  /* eslint-enable @typescript-eslint/no-unsafe-call */
  if (nextRoute) ctx.router.push(nextRoute);
}
