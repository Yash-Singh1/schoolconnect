import { type createTRPCContext } from "../trpc";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any is required for this generic to work
type GetReturnType<T> = T extends (...args: any[]) => infer R
  ? R
  : never;

// Gets a user given their ID
export async function getUserFromId(
  id: string,
  ctx: GetReturnType<typeof createTRPCContext>,
) {
  return await ctx.prisma.user.findFirst({
    where: {
      id,
    },
  });
}
