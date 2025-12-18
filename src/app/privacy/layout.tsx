import { generatePageMetadata, PAGE_METADATA } from '@/lib/metadata';

export const metadata = generatePageMetadata(PAGE_METADATA.privacy);

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
