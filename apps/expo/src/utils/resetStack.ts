// Reset the stack to the root and optionally push a new route

import { type useNavigation, type useRouter } from "expo-router";
import { type StackActions } from "@react-navigation/native";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any type is required for this generic to work properly
export type GetReturnType<T> = T extends (...args: any[]) => infer R
  ? R
  : never;
export type NavigatorOverride = GetReturnType<typeof useNavigation> &
  typeof StackActions;

/**
 * @param ctx Contains the router and navigation objects, each from `useRouter` and `useNavigation` respectively
 * @param nextRoute A route to push on top of the root route, optional
 */
export function resetStack(
  ctx: {
    router: GetReturnType<typeof useRouter>;
    navigation: NavigatorOverride;
  },
  nextRoute?: string,
) {
  if (ctx.navigation.getState().index > 0) ctx.navigation.popToTop();
  if (nextRoute) ctx.router.push(nextRoute);
}
