// NEXTAUTH
import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from "next-auth/providers/credentials"

// PRISMA
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '../../../lib/prismadb'

// `````````````````````````````````````````````````````

export const authOptions = {
  // SECRET
  secret: process.env.NEXTAUTH_SECRET,

  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    // CredentialsProvider({
    //   // The name to display on the sign in form (e.g. 'Sign in with...')
    //   name: 'Credentials',
    //   // The credentials is used to generate a suitable form on the sign in page.
    //   // You can specify whatever fields you are expecting to be submitted.
    //   // e.g. domain, username, password, 2FA token, etc.
    //   // You can pass any HTML attribute to the <input> tag through the object.
    //   credentials: {
    //     username: { label: "Username", type: "text", placeholder: "jsmith" },
    //     password: { label: "Password", type: "password" }
    //   },
    //   async authorize(credentials, req) {
    //     // You need to provide your own logic here that takes the credentials
    //     // submitted and returns either a object representing a user or value
    //     // that is false/null if the credentials are invalid.
    //     // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
    //     // You can also use the `req` object to obtain additional parameters
    //     // (i.e., the request IP address)
    //     const res = await fetch("/your/endpoint", {
    //       method: 'POST',
    //       body: JSON.stringify(credentials),
    //       headers: { "Content-Type": "application/json" }
    //     })
    //     const user = await res.json()
  
    //     // If no error and we have user data, return it
    //     if (res.ok && user) {
    //       console.log("github user: ", user);
    //       return user
    //     }
    //     // Return null if user data could not be retrieved
    //     return null
    //   }
    // })
    // ...add more providers here
  ],

  // * PRISMA ADAPTER FOR NEXT-AUTH
  adapter: PrismaAdapter(prisma),

  // * DATABASE URL FOR NEXT-AUTH
  database: process.env.DATABASE_URL,

  // callback to return the user id in the session
  // callbacks: {
  //   async jwt({ token, account, profile }: { token: any, account: any, profile: any }) {
  //         // Persist the OAuth access_token and or the user id to the token right after signin
  //         if (account) {
  //           token.accessToken = account.access_token
  //           token.id = profile.id
  //         }
  //         return token
  //       },
  //       async session({ session, token, user }: { session: any, token: any, user: any }) {
  //             // Send properties to the client, like an access_token and user id from a provider.
  //             session.accessToken = token.accessToken
  //             session.user.id = token.id
              
  //             return session
  //           }
  // },

  //callbacks
  // callbacks: {
  //   async jwt({ token, account, profile }: { token: any, account: any, profile: any }) {
  //     // Persist the OAuth access_token and or the user id to the token right after signin
  //     if (account) {
  //       token.accessToken = account.access_token
  //       token.id = profile.id
  //     }
  //     return token
  //   },
  //   async session({ session, token, user }: { session: any, token: any, user: any }) {
  //     // Send properties to the client, like an access_token and user id from a provider.
  //     session.accessToken = token.accessToken
  //     session.user.id = token.id
      
  //     return session
  //   }
  // }
}

export default NextAuth(authOptions)
