import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, Lock, Eye } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">
          How RESP Planner handles your data and protects your privacy.
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy First
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            RESP Planner is designed with your privacy as a top priority. This application does not
            collect, store, or transmit any of your personal or financial data to external servers.
            Your information stays exactly where it belongs — with you.
          </p>
        </CardContent>
      </Card>

      {/* Local Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Local Data Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            All data you enter into RESP Planner — including children&apos;s information, savings
            plans, and portfolio configurations — is stored locally in your browser&apos;s storage.
            This means:
          </p>
          <ul className="text-muted-foreground list-inside list-disc space-y-2">
            <li>Your data never leaves your device</li>
            <li>No account or sign-up is required</li>
            <li>No data is sent to any server or third party</li>
            <li>Clearing your browser data will remove all stored information</li>
          </ul>
        </CardContent>
      </Card>

      {/* No Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            No Tracking or Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            RESP Planner does not use any analytics services, tracking pixels, or cookies to monitor
            your activity. There are no third-party scripts collecting information about how you use
            this application.
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Your Responsibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Since all data is stored locally on your device, you are responsible for its security.
            If you use a shared or public computer, be mindful that others with access to that
            browser may be able to view your saved data. You can clear your data at any time from
            the Settings page.
          </p>
        </CardContent>
      </Card>

      {/* Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            This privacy policy may be updated from time to time. Any changes will be reflected on
            this page. The core commitment to local-only data storage and user privacy will remain
            unchanged.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
