'use client'

import { AlertCircle, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function BackendUnavailableBanner() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Backend Service Unavailable</AlertTitle>
      <AlertDescription>
        The API backend is not currently available. Please check your configuration or contact support.
        {process.env.NEXT_PUBLIC_API_URL && (
          <span className="block mt-2 text-sm opacity-80">
            Attempting to connect to: {process.env.NEXT_PUBLIC_API_URL}
          </span>
        )}
      </AlertDescription>
    </Alert>
  )
}

export function BackendNotConfiguredBanner() {
  return (
    <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-400">
        Backend Not Configured
      </AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
        <p className="mb-2">
          The backend API has not been configured yet. To enable full functionality:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Deploy your backend API</li>
          <li>
            Set <code className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 rounded">
              NEXT_PUBLIC_API_URL
            </code> in Cloudflare Pages environment variables
          </li>
          <li>Redeploy this frontend</li>
        </ol>
        <a
          href="https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-yellow-800 dark:text-yellow-400 hover:underline"
        >
          Learn more about environment variables
          <ExternalLink className="h-3 w-3" />
        </a>
      </AlertDescription>
    </Alert>
  )
}
