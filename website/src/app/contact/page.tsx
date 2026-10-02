import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowLeft, ShieldCheck, Clock, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Contact Us & Grievance Redressal | Kurnool One',
  description: 'Official contact and Grievance Officer details for Kurnool One.',
};

export default function ContactPage() {
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
          <div className="space-y-2 border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Support & Grievances</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contact Us</h1>
            <p className="text-xs text-slate-500">
              We are here to support Kurnool residents, local shop merchants, and skilled professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Merchant & General Support */}
            <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-4">
              <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Merchant & Citizen Helpdesk
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                For questions regarding business listings, verified badges, category additions, or general platform inquiries:
              </p>
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <a href="mailto:support@kurnoolone.com" className="font-bold hover:underline">
                    support@kurnoolone.com
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-bold">+91 98480 12345 (Mon–Sat, 10 AM – 6 PM)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Kurnool, Andhra Pradesh 518002</span>
                </div>
              </div>
            </div>

            {/* Grievance Officer Box */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Resident Grievance Officer
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Appointed pursuant to Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021:
              </p>
              <div className="space-y-2 text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200">
                <p><strong>Officer:</strong> Resident Grievance Officer</p>
                <p><strong>Designation:</strong> Compliance & Redressal Lead</p>
                <p><strong>Email:</strong> <a href="mailto:grievance@kurnoolone.com" className="text-blue-600 font-bold hover:underline">grievance@kurnoolone.com</a></p>
                <p><strong>Turnaround:</strong> Grievance acknowledged within 24 hours, resolved within 15 days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
