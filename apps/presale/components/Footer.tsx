import Link from 'next/link';
import { PRESALE_CONFIG } from '@/config/presale';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 mt-8">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
        <p>© {new Date().getFullYear()} AR Holdings Group Corp · Dot Protocol</p>
        <div className="flex gap-6">
          <Link href={PRESALE_CONFIG.websiteUrl} className="hover:text-primary transition-colors">
            Website
          </Link>
          <Link href={`${PRESALE_CONFIG.websiteUrl}/community`} className="hover:text-primary transition-colors">
            Community
          </Link>
        </div>
      </div>
    </footer>
  );
}
