import { v2 as cloudinary } from "cloudinary";

/**
 * Server-only Cloudinary SDK, configured once at import time.
 *
 * Used for signed uploads/transformations/deletions (admin product &
 * gallery image management). Client-side rendering/optimized delivery of
 * already-uploaded images goes through `next-cloudinary` components
 * instead, not this module.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
