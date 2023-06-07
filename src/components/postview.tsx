import { RouterOutputs } from '@/utils/api'
import dayjs from 'dayjs'
import Image from 'next/image'
import Link from 'next/link'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

type PostWithUser = RouterOutputs['post']['getAll'][number]

const PostView = (props: PostWithUser) => {
  const { post, user } = props
  return (
    <div
      className='flex flex-row items-center gap-3 border-b border-slate-300 p-5'
      key={post.id}
    >
      <Image
        src={user.pfp}
        alt='Profile picture'
        className='h-12 w-12 rounded-full'
        width={48}
        height={48}
      />
      <div className='flex flex-col '>
        <div className='flex gap-2 text-violet-200 hover:cursor-pointer'>
          <Link href={`/@${user.username}`}>
            <span className='hover:text-violet-400'>{`@${user.username}`}</span>
          </Link>{' '}
          <Link href={`/post/${post.id}`}>
            <span className='hover:text-violet-400'>{`· ${dayjs(
              post.createdAt,
            ).fromNow()}`}</span>
          </Link>
        </div>
        <span className='text-2xl'>{post.content}</span>
      </div>
    </div>
  )
}

export default PostView
