import fs from "fs";
import path from "path";
import { withReticle } from "@reticlehq/next";

class ThemeFallbackResolverPlugin {
  apply(resolver) {
    const target = resolver.ensureHook("file");
    resolver.getHook("file").tapAsync("ThemeFallbackResolverPlugin", (request, resolveContext, callback) => {
      const filePath = request.path;
      if (!filePath) return callback();

      // Normalize windows/unix slashes
      const normPath = filePath.replace(/\\/g, "/");

      // Check if path is inside src/themes/[themeName]/[core|changes]/[relativePath]
      const match = normPath.match(/\/src\/themes\/([a-zA-Z0-9_-]+)\/(core|changes)\/(.*)/);
      if (match) {
        const [, themeName, folderType, relativePath] = match;
        const baseDir = normPath.substring(0, normPath.indexOf("/src/themes/"));

        if (folderType === "core") {
          // Core -> Changes redirection:
          const changesFile = path.join(baseDir, "src", "themes", themeName, "changes", relativePath);
          if (fs.existsSync(changesFile)) {
            const newRequest = Object.assign({}, request, {
              path: changesFile
            });
            return resolver.doResolve(target, newRequest, `redirect core theme to changes theme: ${changesFile}`, resolveContext, callback);
          }
        } else if (folderType === "changes") {
          // Changes -> Core fallback:
          if (!fs.existsSync(filePath)) {
            // 1. Try theme core
            const coreFile = path.join(baseDir, "src", "themes", themeName, "core", relativePath);
            if (fs.existsSync(coreFile)) {
              const newRequest = Object.assign({}, request, {
                path: coreFile
              });
              return resolver.doResolve(target, newRequest, `fallback changes theme to core theme: ${coreFile}`, resolveContext, callback);
            }
            // 2. Try general src core
            const generalCoreFile = path.join(baseDir, "src", relativePath);
            if (fs.existsSync(generalCoreFile)) {
              const newRequest = Object.assign({}, request, {
                path: generalCoreFile
              });
              return resolver.doResolve(target, newRequest, `fallback changes theme to general core: ${generalCoreFile}`, resolveContext, callback);
            }
          }
        }
      } else if (normPath.includes("/src/") && !normPath.includes("/src/themes/") && !normPath.includes("/src/components/")) {
        // Check if path is in src/ but outside src/themes/ and outside src/components/
        const activeTheme = process.env.NEXT_PUBLIC_ACTIVE_THEME;
        if (activeTheme) {
          const srcIdx = normPath.indexOf("/src/");
          const relativePath = normPath.substring(srcIdx + 5);
          const baseDir = normPath.substring(0, srcIdx);

          const overrideFile = path.join(baseDir, "src", "themes", activeTheme, "changes", relativePath);
          if (fs.existsSync(overrideFile)) {
            const newRequest = Object.assign({}, request, {
              path: overrideFile
            });
            return resolver.doResolve(target, newRequest, `redirect core to theme changes: ${overrideFile}`, resolveContext, callback);
          }
        }
      }

      callback();
    });
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push(new ThemeFallbackResolverPlugin());
    return config;
  },
};

export default withReticle(nextConfig);
