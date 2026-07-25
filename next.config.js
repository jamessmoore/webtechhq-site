/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/sign-up',
        destination: '/signup',
        permanent: true,
      },
      // /signup used to be its own tool-agnostic "get started" page collecting
      // name+email up front. Opportunity Finder and Prompt Pilot are both
      // usable anonymously now (see src/proxy.ts), so there's no more
      // pre-tool-use signup step to land on - anyone arriving via a /signup
      // link (Hero CTA, SignInForm's "sign up" link, NextAuth's newUser page,
      // proxy.ts's gated-route fallback, etc.) goes straight to the flagship
      // tool instead. The SignUpForm component and /api/auth/signup route are
      // untouched - they're still how an account actually gets created, both
      // from this redirected flow and from the claim-a-result flow on
      // /tools/opportunity-finder and /tools/prompt-pilot.
      {
        source: '/signup',
        destination: '/tools/opportunity-finder',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
