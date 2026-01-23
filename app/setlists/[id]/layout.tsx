import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params

    if (!id || id === 'undefined') {
        return {
            title: '콘티를 찾을 수 없습니다',
        }
    }

    try {
        const supabase = await createClient()
        const { data: setlist, error } = await supabase
            .from('setlists')
            .select('id, name, date, description')
            .eq('id', id)
            .single()

        if (error || !setlist) {
            return {
                title: '콘티를 찾을 수 없습니다',
            }
        }

        const dateStr = format(new Date(setlist.date), 'yyyy년 M월 d일')
        const title = `${setlist.name} - ${dateStr}`
        const description = setlist.description || `${dateStr} 찬양 콘티`

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'article',
                images: [
                    {
                        url: '/selah.jpg',
                        width: 1200,
                        height: 630,
                        alt: setlist.name,
                    },
                ],
            },
        }
    } catch (error) {
        console.error('Metadata generation error:', error)
        return {
            title: 'Selah - 콘티',
        }
    }
}

export default function SetlistLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
