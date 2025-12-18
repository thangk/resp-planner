import { generatePageMetadata, PAGE_METADATA } from '@/lib/metadata';

export const metadata = generatePageMetadata(PAGE_METADATA.portfolio);

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
