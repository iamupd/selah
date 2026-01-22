import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Music, List, Share2, BookOpen } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            찬양 콘티 관리
          </h1>
          <p className="text-lg text-gray-600">
            찬양인도자를 위한 간편한 콘티 공유 서비스
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Music className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>악보 등록</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                이미지를 업로드하거나 붙여넣어 악보를 등록하세요
              </p>
              <Link href="/songs/new">
                <Button className="w-full">악보 등록하기</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <List className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>콘티 만들기</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                예배 정보를 입력하고 찬양 곡을 추가하세요
              </p>
              <Link href="/setlists/new">
                <Button className="w-full">콘티 만들기</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Share2 className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>콘티 공유</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                링크를 공유하여 누구나 볼 수 있게 하세요
              </p>
              <Link href="/setlists">
                <Button variant="outline" className="w-full">
                  콘티 목록 보기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/songs">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">악보 목록</h3>
                    <p className="text-sm text-gray-600">
                      등록된 모든 악보를 확인하세요
                    </p>
                  </div>
                  <Music className="h-6 w-6 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/setlists">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">콘티 목록</h3>
                    <p className="text-sm text-gray-600">
                      모든 콘티를 관리하고 공유하세요
                    </p>
                  </div>
                  <List className="h-6 w-6 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-8">
          <Link href="/guide">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-blue-900">사용 가이드</h3>
                    <p className="text-sm text-blue-700">
                      Selah 서비스 사용 방법을 확인하세요
                    </p>
                  </div>
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
