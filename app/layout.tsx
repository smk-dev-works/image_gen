import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monster Mixer — a little weird, a lot of you',
  description: 'Roll a friendly little monster. Keep the bits you love, remix the rest, and take your new friend home.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
