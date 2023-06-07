import { LoadingSpinner, Spinner } from '@/components/Spinner'
import { PageLayout } from '@/components/layout'
import PostView from '@/components/postview'
import { api } from '@/utils/api'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { type NextPage } from 'next'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import { toast } from 'react-hot-toast'
dayjs.extend(relativeTime)

const CreatePostWizard = () => {
  const { user } = useUser()

  const [content, setContent] = useState('')

  const handleSubmit = useCallback(() => {
    if (!content || content.trim() === '') return
    mutate({ content })
  }, [content])

  const ctx = api.useContext()

  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      setContent('')
      ctx.post.getAll.invalidate()
    },
    onError: (err) => {
      toast.error(
        err.data?.zodError?.fieldErrors?.content?.[0] ?? 'Failed to post',
      )
    },
  })

  if (!user) return null

  return (
    <div className='flex h-full w-full gap-3 p-2'>
      <UserButton
        userProfileMode='navigation'
        appearance={{
          baseTheme: dark,
          elements: {
            formButtonPrimary:
              'bg-transparent text-violet-100 hover:text-violet-200 rounded-md px-2 text-2xl w-20 h-20',
          },
        }}
      ></UserButton>
      {/* <Image
        src={user.profileImageUrl}
        alt='Profile picture'
        className='h-20 w-20 rounded-full'
        width={80}
        height={80}
      /> */}
      <input
        placeholder='Type some idea!'
        className='grow bg-transparent text-violet-100 outline-none placeholder:text-violet-200'
        value={content}
        type='text'
        onChange={(e) => setContent(e.target.value)}
        disabled={isPosting}
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit()
          }
        }}
      />
      {content !== '' && !isPosting ? (
        <button
          className='animate-bounce rounded-md px-2 text-2xl text-violet-50 transition-all hover:text-violet-200 '
          onClick={handleSubmit}
          disabled={isPosting}
        >
          Post
        </button>
      ) : null}

      {isPosting ? (
        <div className='flex items-center justify-center'>
          <Spinner />
        </div>
      ) : null}
    </div>
  )
}

const Feed = () => {
  const data = api.post.getAll.useQuery()
  if (data.isLoading) return <LoadingSpinner />

  if (!data.data) return null

  return (
    <div className='flex'>
      {data.data.length === 0 ? (
        <div className='text-white'>No posts available.</div>
      ) : (
        <div className='flex w-full flex-col'>
          {data.data.map((fullPost) => (
            <PostView {...fullPost} key={fullPost.post.id} />
          ))}
        </div>
      )}
    </div>
  )
}

const Home: NextPage = (props) => {
  api.post.getAll.useQuery()
  const user = useUser()

  if (!user.isLoaded) return <LoadingSpinner />

  return (
    <>
      <PageLayout>
        <div className='flex justify-center border-b border-slate-400 px-1 py-4'>
          {user.isSignedIn ? <CreatePostWizard /> : <SignInButton />}
        </div>
        <Feed />
      </PageLayout>
    </>
  )
}

export default Home
