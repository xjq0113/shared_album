import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const photoId = params.id

  // 这是一个占位符，实际的实现在 /api/photos/[id]/download/route.ts 中
  return NextResponse.json(
    { error: '不支持的请求' },
    { status: 405 }
  )
}
