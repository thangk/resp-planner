import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText, AlertTriangle, Scale, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground">Terms and conditions for using RESP Planner.</p>
      </div>

      {/* Acceptance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Acceptance of Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using RESP Planner, you acknowledge that you have read, understood, and
            agree to be bound by these Terms of Service. If you do not agree with any part of these
            terms, please do not use this application.
          </p>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            RESP Planner is provided as an educational and planning tool only. The information,
            calculations, and projections provided by this application are for informational
            purposes and should not be considered financial, tax, or legal advice.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            While efforts are made to ensure accuracy, RESP rules, grant amounts, and income
            thresholds are subject to change by the Canadian government. Always verify current rules
            with official sources and consult with qualified financial professionals before making
            investment decisions.
          </p>
        </CardContent>
      </Card>

      {/* No Warranty */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            No Warranty
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            RESP Planner is provided &quot;as is&quot; without warranty of any kind, express or
            implied. The developer makes no guarantees regarding the accuracy, reliability, or
            completeness of any information or calculations provided by this application.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Investment returns and projections are hypothetical and based on user-provided
            assumptions. Actual results may vary significantly from projections.
          </p>
        </CardContent>
      </Card>

      {/* Limitation of Liability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Limitation of Liability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            In no event shall the developer be liable for any direct, indirect, incidental, special,
            or consequential damages arising out of or in connection with the use of RESP Planner.
            This includes, but is not limited to, any financial losses or decisions made based on
            information provided by this application.
          </p>
        </CardContent>
      </Card>

      {/* Changes */}
      <Card>
        <CardHeader>
          <CardTitle>Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            These terms may be updated from time to time. Continued use of RESP Planner after any
            changes constitutes acceptance of the updated terms.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
