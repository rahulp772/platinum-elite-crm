import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MakeItCRM | Elite Real Estate Management Platform',
  description: 'The premium CRM standard for modern real estate agencies. Scale your agency with bank-grade security, intelligent role hierarchy, and predictive deal closing.',
  keywords: ['Real Estate CRM', 'Property Management Software', 'Lead Tracking', 'Real Estate Marketing', 'MakeItCRM', 'Real Estate Analytics'],
  openGraph: {
    title: 'MakeItCRM | Elite Real Estate Management',
    description: 'Transform your real estate agency with the most advanced CRM in the market.',
    url: 'https://makeitcrm.com/landing-v2',
    siteName: 'MakeItCRM',
    images: [
      {
        url: '/images/og-landing.png',
        width: 1200,
        height: 630,
        alt: 'MakeItCRM Dashboard Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MakeItCRM | Elite Real Estate Management',
    description: 'Scale your real estate agency with MakeItCRM. Intelligent, secure, and built for performance.',
    images: ['/images/og-landing.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function LandingV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
