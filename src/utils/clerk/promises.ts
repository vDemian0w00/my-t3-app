import { clerkClient } from '@clerk/nextjs'
type UserListParams = Parameters<typeof clerkClient.users.getUserList>[0]

export const getUsersList = async (params: UserListParams) => {
  const users = await clerkClient.users.getUserList(params)

  return users
}
