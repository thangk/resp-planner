'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHANGELOG, APP_CONFIG } from '@/lib/constants';

export default function ChangelogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Changelogs</h1>
        <p className="text-muted-foreground">
          Version history and release notes for {APP_CONFIG.name}.
        </p>
      </div>

      <div className="space-y-6">
        {CHANGELOG.map((release) => (
          <Card key={release.version}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary rounded-md px-2.5 py-1 text-sm font-medium">
                  v{release.version}
                </span>
                <span className="text-muted-foreground text-base font-normal">{release.date}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <h3 className="font-medium">{release.title}</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                {release.changes.map((change, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
