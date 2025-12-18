import { generatePageMetadata, PAGE_METADATA } from '@/lib/metadata';

export const metadata = generatePageMetadata(PAGE_METADATA.plans);

export default function PlansLayout({ children }: { children: React.ReactNode }) {
  return children;
}
