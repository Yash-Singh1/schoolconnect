import { type createTRPCContext } from "../trpc";

// Typescript generic to get the return type of a function
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

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
