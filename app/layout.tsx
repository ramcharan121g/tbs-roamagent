import type { Metadata } from 'next';
import './globals.css';
import { OmniVoiceAgent } from '@/components/OmniVoiceAgent';
import { AuthProvider } from '@/lib/auth/auth-context';

export const metadata: Metadata = {
  title: 'Prayanam — Agentic AI Travel Concierge',
  description:
    'Agentic AI Travel Concierge for Indian intercity travel. Multi-leg itinerary planning, transparent resilience heuristics, and coordinated disruption recovery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col bg-[#080c0a] text-gray-100 antialiased"
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          <OmniVoiceAgent />
        </AuthProvider>
      </body>
    </html>
  );
}
