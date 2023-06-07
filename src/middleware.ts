import { withClerkMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
export default withClerkMiddleware(() => {
  console.log('middleware runnin')
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
