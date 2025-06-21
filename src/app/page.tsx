import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to NextAuth.js sign-in page
  redirect('/auth/signin')
}
