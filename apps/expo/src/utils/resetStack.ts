// Reset the stack to the root and optionally push a new route

import { type useNavigation, type useRouter } from "expo-router";

type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

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
