'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Music, List, Share2, LogIn, Edit, Trash2, Plus, Search } from 'lucide-react'

export default function GuidePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Selah 사용 가이드</h1>
        <p className="text-lg text-gray-600">
          서울-안디옥교회 찬양콘티 서비스 사용 방법을 안내합니다.
        </p>
      </div>

      <div className="space-y-8">
        {/* 로그인 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <LogIn className="h-6 w-6 text-blue-600" />
              <CardTitle>1. 로그인</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              콘티 수정 및 관리 기능을 사용하려면 회원가입 후 로그인해야 합니다.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>첫 화면에서 <strong>"로그인"</strong> 버튼 클릭</li>
              <li>
                <strong>회원가입 (처음 사용하는 경우):</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li><strong>"회원가입"</strong> 버튼 클릭</li>
                  <li>이메일, 비밀번호(6자 이상, 특수문자 포함), 이름, 소속 찬양팀명 입력</li>
                  <li><strong>"회원가입"</strong> 버튼 클릭하여 계정 생성</li>
                </ul>
              </li>
              <li>
                <strong>로그인 (이미 계정이 있는 경우):</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>이메일과 비밀번호 입력</li>
                  <li><strong>"로그인"</strong> 버튼 클릭</li>
                </ul>
              </li>
              <li>로그인 완료 후 자동으로 메인 페이지로 이동</li>
            </ol>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>참고:</strong> 로그인하지 않아도 콘티 보기와 공유는 가능합니다.
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>비밀번호 규칙:</strong> 6자 이상, 특수문자 포함 필수
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 악보 등록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Music className="h-6 w-6 text-blue-600" />
              <CardTitle>2. 악보 등록</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              찬양 악보를 등록하여 콘티에 사용할 수 있습니다.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>메인 페이지에서 <strong>"악보 등록"</strong> 카드 클릭</li>
              <li>
                <strong>악보 이미지 업로드:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>이미지 파일을 드래그 앤 드롭</li>
                  <li>또는 클릭하여 파일 선택</li>
                  <li>클립보드에서 이미지 붙여넣기 (Ctrl+V)</li>
                </ul>
              </li>
              <li>
                <strong>기본 정보 입력:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>곡명 (필수)</li>
                  <li>아티스트 (필수)</li>
                  <li>Key (필수)</li>
                </ul>
              </li>
              <li>
                <strong>추가 정보 입력 (선택):</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>송폼 (예: I - V - P - V)</li>
                  <li>BPM (예: 120)</li>
                  <li>박자 (4/4, 3/4, 6/8 등)</li>
                  <li>설명</li>
                </ul>
              </li>
              <li><strong>"등록"</strong> 버튼 클릭</li>
            </ol>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>팁:</strong> 악보는 모든 사용자가 수정할 수 있지만, 삭제는 작성자만 가능합니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 콘티 등록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <List className="h-6 w-6 text-blue-600" />
              <CardTitle>3. 콘티 등록</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              예배 콘티를 생성하고 찬양 곡을 추가합니다.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>메인 페이지에서 <strong>"콘티 만들기"</strong> 카드 클릭</li>
              <li>
                <strong>기본 정보 입력:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>예배 날짜 선택</li>
                  <li>예배명 입력 (예: 주일예배, 수요예배)</li>
                  <li><strong>"확인"</strong> 버튼 클릭</li>
                </ul>
              </li>
              <li>
                <strong>콘티 설명 입력 (선택):</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>상단의 콘티 설명 입력란에 내용 작성</li>
                </ul>
              </li>
              <li>
                <strong>찬양 곡 추가:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>검색창에서 곡명, 아티스트, Key로 검색</li>
                  <li>검색 결과에서 곡 클릭하여 추가</li>
                  <li>여러 곡을 순서대로 추가 가능</li>
                  <li>선택된 곡 목록에서 <strong>"X"</strong> 버튼으로 삭제 가능</li>
                </ul>
              </li>
              <li><strong>"저장"</strong> 버튼 클릭</li>
            </ol>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>팁:</strong> 곡을 추가한 순서대로 콘티에 표시됩니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 콘티 수정 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Edit className="h-6 w-6 text-blue-600" />
              <CardTitle>4. 콘티 수정</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              본인이 작성한 콘티만 수정할 수 있습니다.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>콘티 목록 페이지에서 본인이 작성한 콘티의 <strong>"수정"</strong> 버튼 클릭</li>
              <li>
                <strong>수정 가능한 항목:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>콘티 설명</li>
                  <li>찬양 곡 추가/삭제</li>
                  <li>곡 순서 변경 (삭제 후 다시 추가하여 순서 조정)</li>
                </ul>
              </li>
              <li><strong>"변경사항 저장"</strong> 버튼 클릭</li>
            </ol>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>주의:</strong> 다른 사람이 작성한 콘티는 수정할 수 없습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 콘티 공유 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Share2 className="h-6 w-6 text-blue-600" />
              <CardTitle>5. 콘티 공유</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              콘티 링크를 복사하여 다른 사람과 공유할 수 있습니다.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>콘티 목록에서 <strong>공유 버튼</strong> (Share 아이콘) 클릭</li>
              <li>링크가 클립보드에 자동으로 복사됨</li>
              <li>복사된 링크를 메신저, 이메일 등으로 공유</li>
            </ol>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>참고:</strong> 공유 링크는 읽기 전용입니다. 수정할 수 없습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 악보 관리 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Music className="h-6 w-6 text-blue-600" />
              <CardTitle>6. 악보 관리</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              등록된 악보를 확인하고 관리할 수 있습니다.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>메인 페이지에서 <strong>"악보 목록"</strong> 카드 클릭</li>
              <li>
                <strong>악보 수정:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>모든 사용자가 수정 가능</li>
                  <li>각 악보의 <strong>"수정"</strong> 버튼 클릭</li>
                  <li>정보 수정 후 저장</li>
                </ul>
              </li>
              <li>
                <strong>악보 삭제:</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>작성자만 삭제 가능</li>
                  <li>본인이 작성한 악보의 <strong>"삭제"</strong> 버튼 클릭</li>
                </ul>
              </li>
            </ol>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>참고:</strong> 악보 목록은 게시판 형식으로 표시되며, 악보 이미지는 표시되지 않습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 권한 안내 */}
        <Card>
          <CardHeader>
            <CardTitle>권한 안내</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold mb-2">악보</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>조회:</strong> 모든 사용자</li>
                  <li><strong>등록:</strong> 로그인한 사용자</li>
                  <li><strong>수정:</strong> 모든 사용자</li>
                  <li><strong>삭제:</strong> 작성자만</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">콘티</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>조회:</strong> 모든 사용자</li>
                  <li><strong>등록:</strong> 로그인한 사용자</li>
                  <li><strong>수정:</strong> 작성자만</li>
                  <li><strong>삭제:</strong> 작성자만</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 도움말 */}
        <Card>
          <CardHeader>
            <CardTitle>도움말</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>문제가 발생했나요?</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>로그인이 안 되나요? → 이메일과 비밀번호가 올바른지 확인하세요. 비밀번호는 6자 이상, 특수문자 포함이 필요합니다.</li>
                <li>회원가입이 안 되나요? → 이미 사용 중인 이메일인지 확인하세요. 비밀번호 규칙을 만족하는지 확인하세요.</li>
                <li>이미지가 업로드되지 않나요? → 이미지 파일 형식(jpg, png 등)을 확인하세요.</li>
                <li>콘티를 수정할 수 없나요? → 본인이 작성한 콘티인지 확인하세요.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 돌아가기 버튼 */}
        <div className="flex justify-center pt-4">
          <Link href="/dashboard">
            <Button size="lg">
              메인 페이지로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
