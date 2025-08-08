import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

export interface UploadedFile {
  originalname: string
  buffer: Buffer
  mimetype: string
  size: number
}

export interface ProcessedImage {
  filename: string
  path: string
  url: string
  thumbnailPath?: string
  thumbnailUrl?: string
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_DIMENSION = 2048
const THUMBNAIL_SIZE = 300

export function validateImage(file: UploadedFile): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 10MB.'
    }
  }

  return { valid: true }
}

export async function processImage(file: UploadedFile): Promise<ProcessedImage> {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = file.originalname.split('.').pop()?.toLowerCase() || 'jpg'
  const filename = `${timestamp}-${randomString}.${extension}`
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })

  // Process the image
  let processedBuffer = sharp(file.buffer)
  
  // Get image metadata
  const metadata = await processedBuffer.metadata()
  
  // Resize if necessary
  if (metadata.width && metadata.width > MAX_DIMENSION) {
    processedBuffer = processedBuffer.resize(MAX_DIMENSION, null, {
      withoutEnlargement: true,
      fit: 'inside'
    })
  }
  
  if (metadata.height && metadata.height > MAX_DIMENSION) {
    processedBuffer = processedBuffer.resize(null, MAX_DIMENSION, {
      withoutEnlargement: true,
      fit: 'inside'
    })
  }

  // Convert to WebP for better compression
  const webpBuffer = await processedBuffer.webp({ quality: 80 }).toBuffer()
  const webpFilename = filename.replace(/\.[^/.]+$/, '.webp')
  const webpPath = join(uploadsDir, webpFilename)
  
  // Save the processed image
  await writeFile(webpPath, webpBuffer)
  
  // Create thumbnail
  const thumbnailBuffer = await sharp(file.buffer)
    .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 70 })
    .toBuffer()
  
  const thumbnailFilename = `thumb-${webpFilename}`
  const thumbnailPath = join(uploadsDir, thumbnailFilename)
  await writeFile(thumbnailPath, thumbnailBuffer)

  return {
    filename: webpFilename,
    path: webpPath,
    url: `/uploads/${webpFilename}`,
    thumbnailPath,
    thumbnailUrl: `/uploads/${thumbnailFilename}`
  }
}

export async function deleteImage(filename: string): Promise<void> {
  const { unlink } = await import('fs/promises')
  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  
  try {
    // Delete main image
    await unlink(join(uploadsDir, filename))
    
    // Delete thumbnail if it exists
    const thumbnailFilename = `thumb-${filename}`
    await unlink(join(uploadsDir, thumbnailFilename))
  } catch (error) {
    console.error('Error deleting image:', error)
  }
}
