import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const isProduction = () => process.env.NODE_ENV === 'production'

// ── S3 helpers (production) ──

let s3: S3Client

function getS3(): S3Client {
  if (!s3) {
    const region = process.env.AWS_REGION ?? 'ap-northeast-1'
    s3 = new S3Client({ region })
  }
  return s3
}

function getBucket(): string {
  const bucket = process.env.S3_BUCKET_NAME
  if (!bucket) throw new Error('S3_BUCKET_NAME is not set')
  return bucket
}

function getS3Prefix(): string {
  const rawPrefix = process.env.S3_KEY_PREFIX ?? ''
  if (!rawPrefix) return ''
  // Normalize to path fragments only (no leading/trailing slash)
  return rawPrefix.replace(/^\/+|\/+$/g, '')
}

function withS3Prefix(key: string): string {
  const prefix = getS3Prefix()
  return prefix ? `${prefix}/${key}` : key
}

// ── Local helpers (development) ──

function getMediaDir(): string {
  return path.resolve(process.cwd(), 'media', 'restaurants')
}

function ensureMediaDir(): void {
  const dir = getMediaDir()
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// ── Shared ──

function generateFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase()
  const hash = crypto.randomBytes(16).toString('hex')
  return `${hash}${ext}`
}

function getS3PublicUrl(key: string): string {
  const bucket = getBucket()
  const region = process.env.AWS_REGION ?? 'ap-northeast-1'
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
}

function extractS3Key(url: string): string | null {
  try {
    const parsed = new URL(url)
    return parsed.pathname.slice(1)
  } catch {
    return null
  }
}

function isS3ObjectUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname.includes('.s3.') && parsed.pathname.length > 1
  } catch {
    return false
  }
}

function extractLocalFilename(url: string): string | null {
  const prefix = '/media/restaurants/'
  const idx = url.indexOf(prefix)
  if (idx === -1) return null
  return url.slice(idx + prefix.length)
}

// ── Public API ──

export async function uploadFile(file: Express.Multer.File): Promise<string> {
  const filename = generateFilename(file.originalname)

  if (isProduction()) {
    const key = withS3Prefix(`restaurants/${filename}`)
    await getS3().send(
      new PutObjectCommand({
        Bucket: getBucket(),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    )
    return getS3PublicUrl(key)
  }

  // Local storage
  ensureMediaDir()
  const filePath = path.join(getMediaDir(), filename)
  fs.writeFileSync(filePath, file.buffer)

  const port = process.env.PORT ?? '4000'
  return `http://localhost:${port}/media/restaurants/${filename}`
}

export async function deleteFile(fileUrl: string): Promise<void> {
  if (isProduction()) {
    const key = extractS3Key(fileUrl)
    if (!key) return
    await getS3().send(
      new DeleteObjectCommand({
        Bucket: getBucket(),
        Key: key,
      }),
    )
    return
  }

  // Local storage
  const filename = extractLocalFilename(fileUrl)
  if (!filename) return
  const filePath = path.join(getMediaDir(), filename)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

export async function resolveFileUrl(fileUrl?: string | null): Promise<string | undefined> {
  if (!fileUrl) return undefined

  // In development we keep local URLs untouched.
  if (!isProduction()) {
    return fileUrl
  }

  // Non-S3 values (emoji icons, external URLs) should pass through as-is.
  if (!isS3ObjectUrl(fileUrl)) {
    return fileUrl
  }

  const key = extractS3Key(fileUrl)
  if (!key) return fileUrl

  const expiresIn = Number(process.env.S3_SIGNED_URL_EXPIRES_IN ?? '3600')
  return getSignedUrl(
    getS3(),
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
    }),
    { expiresIn },
  )
}
