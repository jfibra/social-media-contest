import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-realty-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-realty-text mb-6">Page Not Found</h2>
        <p className="text-realty-text mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          href="/"
          className="bg-realty-primary hover:bg-realty-secondary text-white px-6 py-3 rounded-md font-medium transition-colors duration-300"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  )
}
