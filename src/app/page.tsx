"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, BarChart2, Cpu, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Footer } from "@/components/Footer";

export default function Home() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) {
      router.push("/account");
    }
  }, [session, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Where Market Depth Meets{" "}
            <span className="text-chart-1">Algorithmic Precision</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Experience institutional-grade market simulation with real-time
            order matching, depth visualization, and advanced trading features.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-6">
            <Activity className="h-12 w-12 mb-4 text-chart-1" />
            <h3 className="text-xl font-semibold mb-2">Real-Time Matching</h3>
            <p className="text-muted-foreground">
              Experience instant order execution with our sophisticated matching
              engine.
            </p>
          </Card>

          <Card className="p-6">
            <BarChart2 className="h-12 w-12 mb-4 text-chart-2" />
            <h3 className="text-xl font-semibold mb-2">Market Depth</h3>
            <p className="text-muted-foreground">
              Visualize liquidity across price levels with interactive depth
              charts.
            </p>
          </Card>

          <Card className="p-6">
            <Cpu className="h-12 w-12 mb-4 text-chart-3" />
            <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-muted-foreground">
              Track market statistics, VWAP, and other key metrics in real-time.
            </p>
          </Card>

          <Card className="p-6">
            <Lock className="h-12 w-12 mb-4 text-chart-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
            <p className="text-muted-foreground">
              Built with enterprise-grade security and data protection
              standards.
            </p>
          </Card>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
