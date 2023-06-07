import { z } from 'zod'
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from '@/server/api/trpc'
import { clerkClient } from '@clerk/nextjs'
import { TRPCError } from '@trpc/server'
import { Ratelimit } from '@upstash/ratelimit' // for deno: see above
import { Redis } from '@upstash/redis'
import { filterUserForClient } from '@/utils/helpers'
import { Post } from '@prisma/client'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit',
})

const addUsersToPosts = async (posts: Post[]) => {
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

    return addUsersToPosts(posts)
  }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session

      const { success } = await ratelimit.limit(userId)

      if (!success)
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'You are doing that too much',
        })

      const post = await ctx.prisma.post.create({
        data: {
          userId,
          content: input.content,
        },
      })

      return post
    }),

  getPostByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = await clerkClient.users.getUser(input.userId)

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      const posts = await ctx.prisma.post.findMany({
        where: {
          userId: input.userId,
        },
        take: 100,
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
      })

      return addUsersToPosts(posts)
    }),
})
