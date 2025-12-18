import { generatePageMetadata, PAGE_METADATA } from '@/lib/metadata';

export const metadata = generatePageMetadata(PAGE_METADATA.changelog);

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
