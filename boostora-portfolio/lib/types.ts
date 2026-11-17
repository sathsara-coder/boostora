export type Asset = { url: string; type: 'image' | 'video' | 'pdf'; alt?: string };
export type Service = { id: string; title: string; description: string; icon: string };
export type Testimonial = { id: string; quote: string; name: string; position: string };
export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  client: string;
  cover: string;
  assets: Asset[];
};
export type ProjectRow = {
  id: string;
  draft_data: Project;
  published_data: Project | null;
  draft_order: number;
  published_order: number;
  is_published: boolean;
  pending_delete: boolean;
};
export type MediaRow = { id: string; object_path: string; url: string; file_name: string; mime_type: string; size_bytes: number; created_at: string };
export type Enquiry = { id: string; name: string; email: string; service: string; message: string; status: 'new' | 'read' | 'replied'; created_at: string };
export type SiteContent = {
  hero: { eyebrow: string; title: string; accent: string; description: string; profileImage: string; backgroundImage: string };
  about: { name: string; tagline: string; biography: string; portrait: string; skills: string[]; achievements: string[]; experience: string; cvUrl: string };
  boostora: { name: string; description: string; phone: string; whatsapp: string; location: string; email: string; facebook: string; instagram: string; logo: string };
  services: Service[];
  testimonials: Testimonial[];
  appearance: { primary: string; secondary: string; background: string; font: string; animationEnabled: boolean; intensity: number };
  seo: { title: string; description: string; keywords: string };
};
export const CATEGORIES = ['Graphic Design', 'Poster Design', 'Video Editing', 'Branding', 'Motion Graphics', 'Advertising Creatives'] as const;
export const serviceIcons = ['palette', 'video', 'orbit', 'megaphone', 'instagram', 'sparkles', 'pen', 'camera'] as const;
export const DEFAULT_MESSAGE = "Hello Boostora LK! I'm interested in your advertising and creative services. Can I get more information?";
export function whatsAppUrl(phone: string, message = DEFAULT_MESSAGE) {
  const digits = (phone || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message).replace(/'/g, '%27').replace(/!/g, '%21')}` : '';
}
export const safeExternalUrl = (url: string) => /^https:\/\//i.test(url) ? url : '';
