"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  email?: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session?.user) {
        setProfile({ email: data.session.user.email ?? undefined });
      } else {
        setProfile(null);
      }
      setLoading(false);
    };
    fetchSession();
  }, [supabase]);

  const handleSignIn = async () => {
    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?next=/dashboard`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
    if (error) {
      console.error("Login error:", error);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev.slice(-8), { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1200);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.65)), url('/selah.jpg')`,
      }}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {ripples.map((r) => (
          <span
            key={r.id}
            className="ripple"
            style={{ left: r.x, top: r.y }}
          />
        ))}
      </div>
      <main className="relative z-10 text-center px-4 w-full max-w-3xl flex flex-col items-center gap-8">
        <div className="space-y-4 text-white drop-shadow-lg">
          <p className="text-sm md:text-base uppercase tracking-[0.2em]">
            서울-안디옥교회 찬양콘티 서비스
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            "Selah"
          </h1>
          {!loading && profile && (
            <p className="text-sm md:text-base text-gray-200">
              로그인됨: <span className="font-semibold">{profile.email}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          {loading ? (
            <p className="text-white text-sm">로딩 중...</p>
          ) : profile ? (
            <Link href="/dashboard" className="w-full">
              <Button
                className="w-full text-base font-semibold"
                size="lg"
                variant="default"
              >
                들어가기
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleSignIn}
              className="w-full text-base font-semibold"
              size="lg"
              variant="secondary"
            >
              로그인
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
