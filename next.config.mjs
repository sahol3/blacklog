/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: ['lh3.googleusercontent.com', 'res.cloudinary.com', 'avatars.githubusercontent.com'],
    },
};

export default nextConfig;
