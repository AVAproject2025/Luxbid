import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { validateImage, processImage } from '@/lib/upload'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 images allowed' },
        { status: 400 }
      )
    }

    const processedImages = []

    for (const file of files) {
      // Convert File to buffer
      const buffer = Buffer.from(await file.arrayBuffer())
      
      const uploadedFile = {
        originalname: file.name,
        buffer,
        mimetype: file.type,
        size: file.size
      }

      // Validate image
      const validation = validateImage(uploadedFile)
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        )
      }

      // Process image
      const processedImage = await processImage(uploadedFile)
      processedImages.push(processedImage)
    }

    return NextResponse.json({
      message: 'Images uploaded successfully',
      images: processedImages.map(img => ({
        filename: img.filename,
        url: img.url,
        thumbnailUrl: img.thumbnailUrl
      }))
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    )
  }
}
