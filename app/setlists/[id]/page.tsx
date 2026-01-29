import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import SetlistView from './SetlistView'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params
  const id = resolvedParams.id

  const supabase = await createClient()

  const { data: setlist } = await supabase
    .from('setlists')
    .select('name, date, description')
    .eq('id', id)
    .single()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ? (process.env.NEXT_PUBLIC_APP_URL.startsWith('http') ? process.env.NEXT_PUBLIC_APP_URL : `https://${process.env.NEXT_PUBLIC_APP_URL}`)
    : 'https://selah-worship.vercel.app'; // Fallback

  if (!setlist) {
    return {
      title: '콘티 - Selah',
      description: '찬양 콘티 공유',
      openGraph: {
        images: [`${baseUrl}/selah.jpg`]
      }
    }
  }

  const dateStr = format(new Date(setlist.date), 'yyyy년 M월 d일')
  const title = `${setlist.name || '콘티'} - ${dateStr}`
  const description = setlist.description || `${dateStr} 찬양 콘티`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/setlists/${id}`,
      images: [
        {
          url: `${baseUrl}/selah.jpg`,
          width: 1200,
          height: 630,
          alt: 'Selah',
        },
      ],
    },
  }
}

export default function Page() {
  return <SetlistView />
}
