export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      {/* Pattern de fond subtil */}
      <div
        className="fixed inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="w-full max-w-[420px]">{children}</div>
    </div>
  )
}
