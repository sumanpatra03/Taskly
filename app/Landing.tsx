'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

const features = [
  'Intuitive Kanban boards',
  'Real-time collaboration',
  'Custom workflows',
  'Advanced task tracking',
];

const LandingPage: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Hero Section */}
      <div className="container pt-32 pb-20">
        {/* Content */}
        <div className="max-w-[800px] mx-auto text-center space-y-8 mb-20">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Organize your work,
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                One task at a time
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
              Goes beyond basic to-do lists, offering intuitive tools for
              prioritizing and managing projects and tasks with ease.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" asChild>
                <Link href="/projects" className="gap-2">
                  View Projects <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/create-account" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-4 max-w-[600px] mx-auto">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* App Screenshot with Fade Effect */}
        <div className="relative w-full max-w-[1200px] mx-auto mt-20">
          <div className="relative">
            <div className="relative bg-background/95 backdrop-blur rounded-lg shadow-2xl">
              <Image
                src={
                  resolvedTheme === 'dark'
                    ? '/projex-dark.png'
                    : '/projex-light.png'
                }
                alt="App preview"
                width={1824}
                height={1080}
                className="rounded-lg w-full"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Gradient Effect */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-primary/5 to-background"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[40rem] w-[40rem] rounded-full bg-primary/5 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
