// * NEXTAUTH
import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'

export default function Page() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className='container'>
          <p>You're signed in</p>
      </div>
    )
  }
  return (
    <div className='container'>
        <p>Not signed in</p>
    </div>
  )
}