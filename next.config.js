/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'https://vunmyyohwyrqoewpiedy.supabase.co/storage/v1/s3', // Your Supabase storage domain
      'avatars.githubusercontent.com', // For GitHub avatars
      'lh3.googleusercontent.com', // For Google avatars
    ],
  },
};

module.exports = nextConfig;
