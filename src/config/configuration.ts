export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/edupath',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'change-me-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-secret',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    /** RazorpayX account number (Dashboard → RazorpayX → My Account) */
    xAccountNumber: process.env.RAZORPAY_X_ACCOUNT_NUMBER || '',
    /** IMPS (fast) or NEFT */
    payoutMode: (process.env.RAZORPAY_PAYOUT_MODE || 'IMPS').toUpperCase() as 'IMPS' | 'NEFT' | 'RTGS',
    /** When true and keys missing, simulate successful bank payout locally */
    payoutMock: process.env.RAZORPAY_PAYOUT_MOCK !== 'false',
  },
  cors: {
    origin:
      process.env.CORS_ORIGIN?.split(',') ||
      ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  /** Prefix for course media stored as paths like /uploads/... */
  media: {
    publicBase: (process.env.PUBLIC_MEDIA_BASE || '').replace(/\/$/, ''),
    /** Directory under process.cwd() where uploaded videos are stored */
    uploadDir: (process.env.MEDIA_UPLOAD_DIR || 'uploads').replace(/^\/+|\/+$/g, ''),
    maxVideoMb: Math.min(2048, Math.max(16, parseInt(process.env.MEDIA_MAX_VIDEO_MB || '512', 10) || 512)),
  },
  platform: {
    userId: process.env.PLATFORM_WALLET_USER_ID || '000000000000000000000000',
  },
  mail: {
    webhookUrl: process.env.MAIL_WEBHOOK_URL || '',
    from: process.env.MAIL_FROM || 'StartSuccess <noreply@startsuccess.local>',
  },
});
