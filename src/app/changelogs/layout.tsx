import { generatePageMetadata, PAGE_METADATA } from '@/lib/metadata';

export const metadata = generatePageMetadata(PAGE_METADATA.changelogs);

export default function ChangelogsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
