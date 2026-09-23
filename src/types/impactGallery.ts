export interface ImpactGallery {
  id: string;
  title: string;
  subtitle?: string;
  province: string;
  year: number;
  description: string;
  cover_image_url?: string;
  video_url?: string;
  gallery_urls: string[];
  achievements: string[];
  people_reached: number;
  girls_reached?: number;
  boys_reached?: number;
  schools_impacted?: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}
