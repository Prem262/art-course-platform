import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'The Art Studio — Private Online Art Learning',
  description: 'Mindful art courses in Painting, Botanical Art, Zentangle, and Line Arts.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userProfile = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', user.id)
        .maybeSingle();

      userProfile = profile || {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        role: user.user_metadata?.role || 'student',
      };
    }
  } catch (error) {
    // In dev or during initial migration before DB is linked, continue gracefully
  }

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-[#FAF8F5] text-[#141413]">
        <Navbar user={userProfile} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
