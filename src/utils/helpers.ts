import { User } from '@clerk/nextjs/dist/types/server'

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    pfp: user.profileImageUrl,
    emails: user.emailAddresses,
  }
}
