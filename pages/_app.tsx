import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Header from "../components/header";
import "@mantine/core/styles.css";
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "next-auth/react";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <>
      <Head>
        <title>Sip</title>
        <meta name="description" content="Know what you're sippin'" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <ColorSchemeScript />
      </Head>
      <Analytics />

      <SessionProvider session={session}>
        <MantineProvider
        theme={{
            primaryColor: "red",
            }}
        >
          <ModalsProvider>
            <Header />
            <Component {...pageProps} />
          </ModalsProvider>
        </MantineProvider>
      </SessionProvider>
    </>
  );
}
