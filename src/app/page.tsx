import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard - wizard logic will be handled client-side in dashboard
  redirect('/dashboard');
}
