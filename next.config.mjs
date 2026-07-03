/** @type {import('next').NextConfig} */
const nextConfig = {
  // firebase-admin's auth module pulls in jwks-rsa -> jose (ESM-only), which
  // Turbopack's serverless bundling mishandles (ERR_REQUIRE_ESM at runtime)
  // even though firebase-admin is on Next's default auto-external list.
  // Forcing the whole chain external avoids bundling it at all.
  serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose", "google-auth-library"],
};

export default nextConfig;
