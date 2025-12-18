import { APP_CONFIG } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t py-4">
      <div className="text-muted-foreground container flex items-center justify-center text-sm">
        <p>
          {APP_CONFIG.name} v{APP_CONFIG.version}
        </p>
      </div>
    </footer>
  );
}
