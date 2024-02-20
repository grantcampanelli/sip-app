import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Header from '../components/header'
import 'tailwindcss/tailwind.css';


// * NEXTAUTH - import SessionProvider
import { SessionProvider } from 'next-auth/react'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <>
      <Head>
        <title>Sip</title>
        <meta name='description' content="Know what you're sippin'" />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {/* NOTE: NEXTAUTH - wrap the app with SessionProvider */}
      <SessionProvider session={session}>
          <Header />
        <Component {...pageProps} />
      </SessionProvider>
    </>
  )
}
