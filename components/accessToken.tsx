/* eslint-disable @typescript-eslint/no-unused-vars */
import { useSession, signIn, signOut } from "next-auth/react"
import { Session } from "next-auth"

// Extend the Session type to include accessToken
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

export default function Component() {
  const { data: session } = useSession()
  const accessToken = session?.accessToken as string | undefined

  return <div>Access Token: {accessToken ?? "No access token available"}</div>
}