/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BASE_API_URL: process.env.BASE_API_URL,
    IMAGE_FALLBACK: process.env.IMAGE_FALLBACK,
    CLOUDINARY_UPLOAD: process.env.CLOUDINARY_UPLOAD,
    CLOUDINARY_TOKEN: process.env.CLOUDINARY_TOKEN,
    GOOGLE_ID: process.env.GOOGLE_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
    RAJA_ONGKIR_API_KEY: process.env.RAJA_ONGKIR_API_KEY,
    SECRET: process.env.SECRET,
  },
  images: {
    domains: [
      "via.placeholder.com",
      "res.cloudinary.com",
      "cdn.kyou.id",
      "images.tokopedia.net",
      "dummyimage.com",
      "images.unsplash.com",
      "plus.unsplash.com",
      "down-id.img.susercontent.com",
      "m.media-amazon.com",
      "ui-avatars.com",
    ],
  },
  output: "standalone",
  basePath: "/vm4",
  experimental: {
    esmExternals: false,
  },
};

module.exports = nextConfig;
