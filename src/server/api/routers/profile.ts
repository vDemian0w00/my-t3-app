import { z } from 'zod'
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from '@/server/api/trpc'
import { clerkClient } from '@clerk/nextjs'
import { User } from '@clerk/nextjs/dist/types/server'
import { TRPCError } from '@trpc/server'
import { getUsersList } from '@/utils/clerk/promises'
import { filterUserForClient } from '@/utils/helpers'

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(
      z.object({
        // starts with @
        username: z.string().min(1).optional(),
        firstName: z.string().min(1).optional(),
        // .regex(/^@/, 'Username must start with @'),
      }),
    )
    .query(async ({ input }) => {
      const userTrimmed = input.username?.replace(/^@/, '')

      console.log({ userTrimmed })

      const [user] = await getUsersList(
        userTrimmed
          ? {
              username: [userTrimmed],
            }
          : {
              // emailAddress
            },
      )

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      return filterUserForClient(user)
    }),
})
