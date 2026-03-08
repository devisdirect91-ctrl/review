'use client'

import { useFormStatus } from 'react-dom'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  loadingLabel?: string
  className?: string
}

export default function SubmitButton({ label, loadingLabel, className }: Props) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
        'bg-indigo-600 text-white hover:bg-indigo-700',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        className
      )}
    >
      {pending && (
        <svg
          className="animate-spin h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {pending ? (loadingLabel ?? label) : label}
    </button>
  )
}
