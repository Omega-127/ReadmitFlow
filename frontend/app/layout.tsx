import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SafetyBanner } from '@/components/layout/safety-banner';
import { AppShell } from '@/components/layout/app-shell';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReadmitFlow | Clinical Decision Support & Risk Triage',
  description:
    'Clinical-grade 30-day readmission risk triage, explainable SHAP drivers, clinician overrides, and care capacity planning with synthetic healthcare data.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <TooltipProvider delayDuration={300}>
          <SafetyBanner />
          <AppShell>{children}</AppShell>
        </TooltipProvider>
      </body>
    </html>
  );
}
