import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import crypto from 'crypto'
import path from 'path'

const BUCKET_NAME = process.env.S3_BUCKET_NAME ?? 's3-greet'
const REGION = process.env.AWS_REGION ?? 'ap-northeast-1'

const s3 = new S3Client({ region: REGION })

function generateKey(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase()
  const hash = crypto.randomBytes(16).toString('hex')
  return `restaurants/${hash}${ext}`
}

function getPublicUrl(key: string): string {
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`
}

export function extractKeyFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    // Remove leading slash
    return parsed.pathname.slice(1)
  } catch {
    return null
  }
}

export async function uploadFile(
  file: Express.Multer.File,
): Promise<string> {
  const key = generateKey(file.originalname)

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  )

  return getPublicUrl(key)
}

export async function deleteFile(fileUrl: string): Promise<void> {
  const key = extractKeyFromUrl(fileUrl)
  if (!key) return

  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }),
  )
}
