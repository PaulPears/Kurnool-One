'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function BusinessLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?returnUrl=/business/dashboard');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="text-xs font-bold text-slate-600">Redirecting to Unified Kurnool One Sign-In...</span>
    </div>
  );
}
