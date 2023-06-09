import { LoadingSpinner } from '@/components/Spinner'
import { api } from '@/utils/api'
import { useUser } from '@clerk/nextjs'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { type NextPage, InferGetStaticPropsType, GetStaticProps } from 'next'
import Head from 'next/head'
import { toast } from 'react-hot-toast'
dayjs.extend(relativeTime)
import { createServerSideHelpers } from '@trpc/react-query/server'
import { appRouter } from '@/server/api/root'
import SuperJSON from 'superjson'
import { NJSON } from 'next-json'
import { prisma } from '@/server/db'
import { PageLayout } from '@/components/layout'
import Image from 'next/image'
import PostView from '@/components/postview'

const ProfileFeed = ({ userId }: { userId: string }) => {
  const { data, isLoading } = api.post.getPostsByUserId.useQuery({
    userId,
  })

  if (isLoading) return <LoadingSpinner />

  if (!data || data.length === 0) return <div>User hasnt posted yet...</div>

  return (
    <div className='flex flex-col'>
      {data.map((post) => {
        return <PostView key={post.post.id} {...post} />
      })}
    </div>
  )
}

const ProfilePage: NextPage<{ slug: string }> = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const { data, isLoading: userLoading } =
    api.profiles.getUserByUsername.useQuery({
      username: props.slug,
    })

  if (userLoading) return <LoadingSpinner />

  if (!data) return <div>404</div>

  return (
    <>
      <Head>
        <title>{`· @${data.username}`}</title>
        <meta name='description' content='Generated by create-t3-app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <PageLayout>
        <div className='h-full'>
          <div className='relative h-36 w-full bg-slate-600'>
            <Image
              src={data.pfp}
              alt={`${data.username}'s profile picture`}
              className='absolute bottom-0 left-0 -mb-[48px] ml-4 rounded-full border-4 border-black'
              width={128}
              height={128}
            />
          </div>
          <div className='h-[64px]' />
          <div className='border-b border-slate-400 p-4 text-2xl font-bold'>{`@${data.username}`}</div>
          <ProfileFeed userId={data.id} />
        </div>
      </PageLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  // const helpers = createServerSideHelpers({
  //   router: appRouter,
  //   ctx: {
  //     prisma,
  //     session: null,
  //   },
  //   transformer: SuperJSON,
  // })

  const slug = context.params?.slug

  if (typeof slug !== 'string') throw new Error('No slug provided')

  // await helpers.profiles.getUserByUsername.prefetch({
  //   username: slug,
  // })

  return {
    props: {
      // trpcState: NJSON.stringify(helpers.dehydrate()),
      slug,
    },
  }
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export default ProfilePage
