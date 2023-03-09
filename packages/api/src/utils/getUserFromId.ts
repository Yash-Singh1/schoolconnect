import { type createTRPCContext } from "../trpc";

type GetReturnType<T> = T extends (...args: any[]) => Promise<infer R>
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
