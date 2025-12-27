import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // ==========================================
  // OTIMIZAÇÕES DE IMAGEM
  // ==========================================
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'player.vimeo.com',
      },
      {
        // Supabase Storage - projeto específico
        protocol: 'https',
        hostname: 'jgcolkkztqimtvdpuvxy.supabase.co',
      },
    ],
    // Formatos modernos para melhor compressão
    formats: ['image/avif', 'image/webp'],
    // Cache de imagens otimizado
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 dias
  },

  // ==========================================
  // OTIMIZAÇÕES DE BUILD
  // ==========================================
  
  // Compressão de responses
  compress: true,

  // ==========================================
  // HEADERS DE CACHE
  // ==========================================
  async headers() {
    return [
      {
        // Cache para assets estáticos
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache para JS/CSS buildados
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache para páginas de cursos (revalidação)
        source: '/cursos/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        // Headers de segurança completos
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Permite iframes do mesmo domínio (para embeds)
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ]
  },

  // ==========================================
  // EXPERIMENTAL (quando estável, mover para configurações normais)
  // ==========================================
  experimental: {
    // Otimizar imports de pacotes grandes
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
