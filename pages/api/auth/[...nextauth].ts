// NEXTAUTH
import NextAuth, {NextAuthOptions} from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from "next-auth/providers/credentials"

// PRISMA
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '../../../lib/prismadb'

// `````````````````````````````````````````````````````

export const authOptions: NextAuthOptions = {
  // SECRET
  secret: process.env.SECRET,

  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    // CredentialsProvider({
    //   // The name to display on the sign in form (e.g. 'Sign in with...')
    //   name: 'Credentials',
    //   // The credentials is used to generate a suitable form on the sign in page.
    //   // You can specify whatever fields you are expecting to be submitted.
    //   // e.g. domain, username, password, 2FA token, etc.
    //   // You can pass any HTML attribute to the <input> tag through the object.
    //   credentials: {
    //     email: { label: "Email", type: "email", placeholder: "jsmith@google.com" },
    //     username: { label: "Username", type: "text", placeholder: "jsmith" },
    //     password: { label: "Password", type: "password" }
    //   },
    //   // async authorize(credentials, req) {
    //   //   // Add logic here to look up the user from the credentials supplied
    //   //   const user = { id: '1', name: 'J Smith', email: 'jsmith@google.com' }
    //   //   return user;
    //   // }
    //
    //   async authorize(credentials, req) {
    //     // You need to provide your own logic here that takes the credentials
    //     // submitted and returns either a object representing a user or value
    //     // that is false/null if the credentials are invalid.
    //     // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
    //     // You can also use the `req` object to obtain additional parameters
    //     // (i.e., the request IP address)
    //     console.log("credentials: ", JSON.stringify(credentials))
    //
    //     const res = await fetch(`${process.env.NEXTAUTH_URL}/check-credentials`, {
    //
    //       method: 'POST',
    //       body: JSON.stringify(credentials),
    //       headers: { "Content-Type": "application/json" }
    //       // headers: {
    //       //   "Content-Type": "application/x-www-form-urlencoded",
    //       //   "Accept": "application/json"
    //       // },
    //
    //     })
    //     console.log("credentials authorizing...")
    //     const user = await res.json()
    //     console.log("credentials user: ", user)
    //
    //     // If no error and we have user data, return it
    //     if (res.ok && user) {
    //       console.log("github user: ", user);
    //       return user
    //     }
    //     // Return null if user data could not be retrieved
    //     return null
    //   }
    // }

    // ...add more providers here
  ],


  debug: process.env.NODE_ENV === 'development',

  // * PRISMA ADAPTER FOR NEXT-AUTH
  adapter: PrismaAdapter(prisma),

  // * DATABASE URL FOR NEXT-AUTH
  //database: process.env.DATABASE_URL,


  // callbacks for nextjs nextauth session and jwt
  // callbacks: {
  //   async session(session: any, user: any) {
  //     // Add property to session, like an access_token from a provider.
  //     session.accessToken = user.accessToken
  //     console.log("callback for session: ", session, user)
  //     return session
  //   },
  //   async jwt(token: any, user: any, account: any, profile: any, isNewUser: any) {
  //     // Add access_token to the token right after signin
  //     if (account?.accessToken) {
  //       token.accessToken = account.accessToken
  //     }
  //     // console.log("callback for jwt: ", token, user, account, profile, isNewUser)
  //     return token
  //   }
  // },

  

  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      /* Step 1: update the token based on the user object */
      // if (user) {
      //   token.role = user.role;
      //   token.subscribed = user.subscribed;
      // }
      return token;
    },
    session: ({ session, token }: { session: any, token: any }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    })
  }
}

// const handler = NextAuth(authOptions)
// export {handler as GET, handler as POST}

export default NextAuth(authOptions)
