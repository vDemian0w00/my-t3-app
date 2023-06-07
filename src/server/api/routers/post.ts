import { z } from 'zod'
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from '@/server/api/trpc'
import { clerkClient } from '@clerk/nextjs'
import { User } from '@clerk/nextjs/dist/types/server'
import { TRPCError } from '@trpc/server'

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    pfp: user.profileImageUrl,
    emails: user.emailAddresses,
  }
}

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    })

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.userId),
        limit: 100,
      })
    ).map(filterUserForClient)

    return posts.map((post) => {
      const foundUser = users.find((user) => user.id === post.userId)

      if (!foundUser || !foundUser.username)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'User not found',
        })

      return {
        post,
        user: { ...foundUser, username: foundUser.username },
      }
    })
  }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session

      const post = await ctx.prisma.post.create({
        data: {
          userId,
          content: input.content,
        },
      })

      return post
    }),
})
