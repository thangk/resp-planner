import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, GraduationCap, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">About</h1>
        <p className="text-muted-foreground">Learn more about me and this project.</p>
      </div>

      {/* Developer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Hi, I&apos;m Kap Thang
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            I&apos;m a software developer currently pursuing my Master of Science in Computer
            Science. I have a passion for building intuitive and impactful digital experiences, and
            I enjoy creating modern web applications with Next.js as well as mobile apps using React
            Native.
          </p>
          <div className="text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Ontario, Canada</span>
          </div>
        </CardContent>
      </Card>

      {/* About This Project */}
      <Card>
        <CardHeader>
          <CardTitle>About RESP Planner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            RESP Planner is one of my hobby side projects. I built it to help Canadian families
            better understand and plan their Registered Education Savings Plans. My goal is to
            simplify the complexities of RESP rules, government grants, and long-term education
            savings projections.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            I built this using Next.js and Tailwind CSS, with a privacy-first approach where all
            your data stays securely in your browser. No accounts, no servers storing your
            information — just a useful tool that respects your privacy.
          </p>
        </CardContent>
      </Card>

      {/* More Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Explore More of My Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Interested in seeing more of what I&apos;ve built? Check out my portfolio for a full
            list of projects, ranging from web applications to mobile apps and everything in
            between.
          </p>
          <Button asChild>
            <Link href="https://kapthang.dev/projects" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View All Projects
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
