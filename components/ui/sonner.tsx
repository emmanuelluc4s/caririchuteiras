'use client'

import { Toaster as SonnerToaster, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group-[.toaster]:bg-bg-secondary group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-gray-400',
          actionButton: 'group-[.toast]:bg-neon group-[.toast]:text-white',
          cancelButton: 'group-[.toast]:bg-bg-tertiary group-[.toast]:text-gray-400',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
