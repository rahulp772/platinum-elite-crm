import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://makeitcrm.com'
  
  return [
    {
      url: `${baseUrl}/landing-v2`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
  ]
}
