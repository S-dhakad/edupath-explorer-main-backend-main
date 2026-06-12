#!/usr/bin/env bash
# Creates the S3 bucket + public-read policy for videos/images and CORS for browser playback.
# Usage: AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... ./scripts/setup-s3-bucket.sh

set -euo pipefail

REGION="${AWS_REGION:-ap-south-1}"
BUCKET="${AWS_S3_BUCKET:-startsuccess-media}"

echo "Creating bucket s3://${BUCKET} in ${REGION}..."
if [ "$REGION" = "us-east-1" ]; then
  aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" 2>/dev/null || true
else
  aws s3api create-bucket \
    --bucket "$BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration "LocationConstraint=${REGION}" 2>/dev/null || true
fi

echo "Disabling block-public-access (required for public media)..."
aws s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

echo "Applying bucket policy (public read for media folders)..."
aws s3api put-bucket-policy --bucket "$BUCKET" --policy "$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadMedia",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::${BUCKET}/videos/*",
        "arn:aws:s3:::${BUCKET}/images/*",
        "arn:aws:s3:::${BUCKET}/media/*",
        "arn:aws:s3:::${BUCKET}/avatars/*"
      ]
    }
  ]
}
EOF
)"

echo "Setting CORS (video playback from frontend)..."
aws s3api put-bucket-cors --bucket "$BUCKET" --cors-configuration "$(cat <<EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF
)"

PUBLIC_BASE="https://${BUCKET}.s3.${REGION}.amazonaws.com"
echo ""
echo "Done. Add to backend .env:"
echo "AWS_S3_BUCKET=${BUCKET}"
echo "AWS_REGION=${REGION}"
echo "AWS_S3_PUBLIC_BASE=${PUBLIC_BASE}"
echo "PUBLIC_MEDIA_BASE=${PUBLIC_BASE}"
echo ""
echo "Add to frontend .env:"
echo "VITE_S3_MEDIA_BASE=${PUBLIC_BASE}"
echo "VITE_MEDIA_BASE=${PUBLIC_BASE}"
