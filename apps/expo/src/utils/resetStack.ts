// Reset the stack to the root and optionally push a new route

import { type useNavigation, type useRouter } from "expo-router";
import { type StackActions } from "@react-navigation/native";

// Typescript generic to get the return type of a function
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Overrides the default navigation object
// This is safe because we know we are using a StackNavigator
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
  // Pop to the root route if we are already on a child route
  if (ctx.navigation.getState().index > 0) ctx.navigation.popToTop();

  // Push a new route if one is provided
  if (nextRoute) ctx.router.push(nextRoute);
}
