import { generatePageMetadata, PAGE_METADATA } from '@/lib/metadata';

export const metadata = generatePageMetadata(PAGE_METADATA.children);

export default function ChildrenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
