import { generatePageMetadata, PAGE_METADATA } from '@/lib/metadata';

export const metadata = generatePageMetadata(PAGE_METADATA.wizard);

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
