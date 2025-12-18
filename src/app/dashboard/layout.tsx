import { generatePageMetadata, PAGE_METADATA } from '@/lib/metadata';

export const metadata = generatePageMetadata(PAGE_METADATA.dashboard);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
