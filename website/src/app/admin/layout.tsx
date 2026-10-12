import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kurnool One | Dedicated Management Console',
  description: 'Enterprise administration system for Kurnool One directory, city places, events, businesses, and professionals.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      {children}
    </div>
  );
}
