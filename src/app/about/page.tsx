import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Code2, Smartphone, GraduationCap, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">About</h1>
        <p className="text-muted-foreground">Learn more about the developer behind RESP Planner.</p>
      </div>

      {/* Developer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Meet the Developer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-medium">Kap Thang</p>
          <p className="text-muted-foreground leading-relaxed">
            A passionate software developer currently pursuing a Master of Science in Computer
            Science from Ontario, Canada. With a deep enthusiasm for building intuitive and
            impactful digital experiences, Kap specializes in creating modern web applications and
            mobile solutions that make a difference in people&apos;s lives.
          </p>
          <div className="text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Ontario, Canada</span>
          </div>
        </CardContent>
      </Card>

      {/* Technical Expertise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Technical Expertise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary rounded-md p-2">
                  <Code2 className="h-4 w-4" />
                </div>
                <span className="font-medium">Web Development</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Building performant and scalable web applications using Next.js and the modern React
                ecosystem. From responsive designs to complex state management, Kap crafts seamless
                user experiences.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary rounded-md p-2">
                  <Smartphone className="h-4 w-4" />
                </div>
                <span className="font-medium">Mobile Development</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Creating cross-platform mobile applications with React Native. Delivering
                native-like performance and beautiful interfaces on both iOS and Android platforms.
              </p>
            </div>
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
            RESP Planner is one of Kap&apos;s hobby side projects, born from a desire to help
            Canadian families better understand and plan their Registered Education Savings Plans.
            This tool aims to simplify the complexities of RESP rules, government grants, and
            long-term education savings projections.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Built with modern technologies including Next.js, Tailwind CSS, and a privacy-first
            approach where all data stays securely in your browser, RESP Planner represents
            Kap&apos;s commitment to creating useful, accessible tools for everyone.
          </p>
        </CardContent>
      </Card>

      {/* More Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Explore More Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Interested in seeing more of Kap&apos;s work? Check out the full portfolio of projects,
            ranging from web applications to mobile apps and everything in between.
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
