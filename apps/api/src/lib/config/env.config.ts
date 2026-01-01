export default () => ({
  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtSecretExpiries: process.env.JWT_ACCESS_EXPIRES_IN,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtRefreshSecretExpiries: process.env.JWT_REFRESH_EXPIRES_IN,
    encryptSecretKey: process.env.ENCRYPT_SECRET_KEY,
    resetPasswordBaseUrl: process.env.RESET_PASSWORD_BASE_URL,
    production: process.env.NODE_ENV,
  },

  s3: {
    region: process.env.S3_REGION,
    bucket: process.env.S3_BUCKET,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
  },
});
