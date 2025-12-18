import { generatePageMetadata, PAGE_METADATA } from '@/lib/metadata';

export const metadata = generatePageMetadata(PAGE_METADATA.tos);

export default function TosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
