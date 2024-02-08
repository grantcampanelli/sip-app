// * NEXTAUTH
import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'

export default function Page() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className='container'>
        <div>
        <h1>Sip</h1>
        <h3>Know what you&apos;re sippin&apos;</h3>
      </div>
        <div>
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="/bottles"
            rel="noopener noreferrer"
          >
            Bottles
          </a>  <a> | </a>
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="/wines"
            rel="noopener noreferrer"
          >
            Wines
          </a>
          <a> | </a>
          <a className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="/wineries"
            rel="noopener noreferrer">Wineries</a>
      </div>

      

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">

      </div>
        {/* USER IMAGE */}
        <Image
          // priority = true will load the image before the rest of the page (lazy loading is enabled by default in Next.js)
          priority
          src={session.user?.image || ''}
          alt='User Image'
          width={100}
          height={100}
        />
        Signed in as <b>{session.user?.name}</b>
        {/* SIGN OUT */}
        <button onClick={() => signOut()} className='sign-out'>
          Sign out
        </button>
      </div>
    )
  }
  return (
    <div className='container'>
      Not signed in
      {/* SIGN IN */}
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  )
}
