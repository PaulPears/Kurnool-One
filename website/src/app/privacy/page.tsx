import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, ArrowLeft, Eye, FileText, Phone, Trash2 } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Kurnool One',
  description: 'Privacy Policy and Data Protection practices for Kurnool One mobile app and website under India DPDP Act 2023.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Kurnool One Home</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8">
          {/* Header */}
          <div className="space-y-2 border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Legal & Privacy Compliance</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-slate-500">
              Last Updated: September 2026 | Effective for Kurnool One Android App and KurnoolOne.com
            </p>
          </div>

          {/* Non-Affiliation Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <p className="font-bold mb-1">Government Non-Affiliation Disclaimer:</p>
            <p>
              Kurnool One is an independent private digital city directory and community discovery platform operated by local technology entrepreneurs. It is <strong>NOT affiliated with, authorized by, endorsed by, or in any way officially connected</strong> with the Government of Andhra Pradesh, Kurnool Municipal Corporation (KMC), or the District Collectorate of Kurnool.
            </p>
          </div>

          {/* Section 1: Overview */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              1. Information We Collect
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We collect information to provide local city directory services, verify shop owners, and facilitate contact between Kurnool citizens and verified local professionals:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600 leading-relaxed">
              <li>
                <strong>Mobile Phone Number:</strong> Used as the primary identity credential for Business and Professional accounts to prevent fraudulent listings and impersonation.
              </li>
              <li>
                <strong>Business & Professional Listing Data:</strong> Storefront names, trade categories, operational hours, shop addresses, photos, service areas, and consultation fees voluntarily provided for public directory display.
              </li>
              <li>
                <strong>Device & Network Information:</strong> App version, operating system, and anonymous crash logs strictly for app performance diagnostics.
              </li>
            </ul>
          </section>

          {/* Section 2: Zero SMS Permission Policy */}
          <section className="space-y-3 p-5 rounded-2xl bg-blue-50/50 border border-blue-200">
            <h2 className="text-lg font-bold text-blue-950 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              2. Zero SMS Permission Policy (Play Store Compliant)
            </h2>
            <p className="text-xs text-blue-900 leading-relaxed">
              In strict accordance with Google Play Developer Policy on Sensitive Permissions, Kurnool One <strong>DOES NOT request or declare dangerous SMS permissions</strong> (such as <code>READ_SMS</code> or <code>RECEIVE_SMS</code>).
            </p>
            <p className="text-xs text-blue-900 leading-relaxed">
              For phone OTP verification, Kurnool One relies solely on Google Play Services native <strong>SMS Retriever API</strong>. The app cannot read your inbox, private messages, or any SMS unrelated to the Kurnool One one-time login code.
            </p>
          </section>

          {/* Section 3: Credential Separation */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              3. Business vs Professional Credential Exclusivity
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              To prevent misrepresentation and maintain high directory trust, Kurnool One enforces strict role exclusivity:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>A mobile number registered as a commercial Business cannot register or sign in as an individual Professional.</li>
              <li>A mobile number registered as a Professional cannot register or sign in as a Business.</li>
              <li>Separate credentials are required if an individual operates both an enterprise and a personal practice.</li>
            </ul>
          </section>

          {/* Section 4: Data Retention & Deletion */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-blue-600" />
              4. Data Retention & Account Erasure
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              In compliance with India’s <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> and Google Play Account Deletion requirements, users may delete their account and associated data at any time:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>Directly inside the mobile app: <code>Profile &gt; Settings &gt; Delete Account</code>.</li>
              <li>Public Web Portal: Via our public deletion tool at <Link href="/delete-account" className="text-blue-600 font-bold hover:underline">kurnoolone.com/delete-account</Link>.</li>
            </ul>
          </section>

          {/* Section 5: Grievance Officer */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base font-bold text-slate-900">5. Grievance Officer (IT Rules 2021)</h2>
            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p><strong>Designation:</strong> Resident Grievance Officer</p>
              <p><strong>Entity:</strong> Kurnool One Platform</p>
              <p><strong>Location:</strong> Kurnool, Andhra Pradesh 518002, India</p>
              <p><strong>Email:</strong> <a href="mailto:grievance@kurnoolone.com" className="text-blue-600 hover:underline">grievance@kurnoolone.com</a></p>
              <p><strong>Response Turnaround:</strong> Acknowledged within 24 hours, resolved within 15 days.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
