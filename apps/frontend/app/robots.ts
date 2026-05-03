import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/landing-v2', '/landing-v2/'],
      disallow: '/',
    },
    sitemap: 'https://makeitcrm.com/sitemap.xml',
  }
}
