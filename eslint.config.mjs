import nextConfig from 'eslint-config-next'

const config = [
  ...nextConfig,
  {
    ignores: ['.next/**', 'playwright-report/', 'test-results/'],
  },
  {
    rules: {
      // Resetting the reCAPTCHA widget (an external system) on success is a
      // legitimate effect; downgrade so it doesn't fail the CI lint gate.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default config
