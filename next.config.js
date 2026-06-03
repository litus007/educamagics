// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // tldraw i alguns paquets de LiveKit necessiten ser transpilats
  transpilePackages: ["tldraw", "@tldraw/tldraw"],

  // Headers de seguretat
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          // Permetre càmera/micro per a LiveKit
          {
            key: "Permissions-Policy",
            value: "camera=self, microphone=self, display-capture=self",
          },
        ],
      },
    ];
  },

  // Redireccions post-login per rol (gestionades per middleware)
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
