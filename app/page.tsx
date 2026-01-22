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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // 이미지 URL 결정: 환경 변수 우선, 없으면 로컬 경로
  const imageUrl = process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_URL || '/selah.jpg';

  // 이미지 preload 및 로딩 상태 관리 (즉시 시작)
  useEffect(() => {
    const img = new Image();
    
    // decode()를 사용하여 이미지 디코딩을 비동기로 처리
    if (img.decode) {
      img.src = imageUrl;
      img.decode()
        .then(() => {
          setImageLoaded(true);
        })
        .catch((error) => {
          // decode 실패 시 onload로 폴백
          console.warn('Image decode failed, using onload fallback:', error);
          img.onload = () => setImageLoaded(true);
          img.onerror = () => {
            console.error('Failed to load background image');
            setImageLoaded(true); // 에러가 나도 UI는 표시
          };
          // 이미지가 이미 로드되었을 수 있으므로 확인
          if (img.complete) {
            setImageLoaded(true);
          }
        });
    } else {
      // decode를 지원하지 않는 브라우저를 위한 폴백
      img.onload = () => {
        setImageLoaded(true);
      };
      img.onerror = () => {
        console.error('Failed to load background image');
        setImageLoaded(true);
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

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
    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    const origin = (envUrl && !envUrl.includes('localhost')) ? envUrl : window.location.origin;
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
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center relative"
      style={{
        backgroundImage: imageLoaded
          ? `linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.65)), url('${imageUrl}')`
          : undefined,
        backgroundColor: imageLoaded ? undefined : '#1a1a1a',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transition: imageLoaded ? 'opacity 0.5s ease-in-out' : 'none',
        opacity: imageLoaded ? 1 : 0.95,
      }}
      onMouseMove={handleMouseMove}
    >
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      )}
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
              variant="outline"
            >
              로그인
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
