"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles, LogOut, User, LayoutDashboard,
  Search, Zap, Stethoscope, DollarSign, Calendar
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  user?: { email?: string; full_name?: string; role?: string } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const isHealer = user?.role === "healer";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={user ? (isHealer ? "/dashboard/healer" : "/dashboard") : "/"} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/30 transition-shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg gradient-text">Healio</span>
            {isHealer && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 hidden sm:inline">
                Healer
              </span>
            )}
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {isHealer ? (
              // Healer nav
              <>
                <Link href="/dashboard/healer">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/healer/availability">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Calendar className="w-4 h-4" /> Availability
                  </Button>
                </Link>
                <Link href="/dashboard/healer/earnings">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <DollarSign className="w-4 h-4" /> Earnings
                  </Button>
                </Link>
              </>
            ) : (
              // User nav
              <>
                <Link href="/healers">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Search className="w-4 h-4" /> Browse Healers
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Zap className="w-4 h-4" /> Pricing
                  </Button>
                </Link>
                {user && (
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href={isHealer ? "/dashboard/healer/profile" : "/profile"}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.full_name || user.email?.split("@")[0]}</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="gradient" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
