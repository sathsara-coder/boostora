import type { Metadata } from 'next';
import './globals.css';
import './admin.css';

export const metadata: Metadata = {
  title: 'Sathsara Yoshith | Creative Portfolio & Boostora LK',
  description: 'Creative design, motion, video and Meta advertising services by Sathsara Yoshith and Boostora LK in Sri Lanka.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
