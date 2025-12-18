import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ExternalLink, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
        <p className="text-muted-foreground">Get in touch with me.</p>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Get in Touch
          </CardTitle>
          <CardDescription>
            Have questions, feedback, or just want to say hello? I&apos;d love to hear from you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            Whether you have a question about RESP Planner, found a bug, have a feature suggestion,
            or simply want to connect, feel free to reach out. I&apos;m always happy to hear from
            users and fellow developers alike.
          </p>

          {/* Email Contact */}
          <div className="bg-muted/50 rounded-lg border p-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary rounded-full p-3">
                <Mail className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground text-sm">
                  The best way to reach me for any inquiries or collaboration opportunities.
                </p>
                <Button asChild variant="outline" className="mt-2">
                  <Link href="mailto:contact@kapthang.dev">
                    <Mail className="mr-2 h-4 w-4" />
                    contact@kapthang.dev
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Time */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            I typically respond to emails within a week. To help me provide better context, please
            mention &quot;RESP Planner&quot; in your email subject or message. I appreciate your
            patience and look forward to connecting with you.
          </p>
        </CardContent>
      </Card>

      {/* Portfolio Link */}
      <Card>
        <CardHeader>
          <CardTitle>Want to Learn More?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Visit my portfolio website to learn more about my background, explore other projects,
            and find additional ways to connect.
          </p>
          <Button asChild>
            <Link href="https://kapthang.dev" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Portfolio
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
