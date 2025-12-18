import { generatePageMetadata, PAGE_METADATA } from '@/lib/metadata';

export const metadata = generatePageMetadata(PAGE_METADATA.settings);

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
