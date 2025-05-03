import Image from "next/image"
import Link from "next/link"

export default function DefaultHeroSection() {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-realty-primary to-realty-secondary">
      {/* SVG Pattern Background */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{ backgroundImage: 'url("/images/pattern.png")', backgroundSize: "100px 100px" }}
      />

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

      <div className="container relative z-10 mx-auto px-4 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-white space-y-6 animate-fadeIn">
            <div className="inline-block bg-realty-highlight px-4 py-2 rounded-md text-sm font-medium mb-2 shadow-lg">
              SOCIAL MEDIA CONTESTS
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Real Estate Social Media Contests
            </h1>

            <p className="text-lg md:text-xl text-gray-100 max-w-xl">
              Join our exciting social media contests for real estate agents and win amazing prizes! Showcase your
              experience and engage with the community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/contests"
                className="bg-realty-highlight hover:bg-opacity-90 text-white px-8 py-3 rounded-md font-medium text-center transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
              >
                View All Contests
              </Link>
              <a
                href="https://leuteriorealty.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-gray-100 text-realty-primary px-8 py-3 rounded-md font-medium text-center transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
              >
                Access CRM Platform
              </a>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative flex justify-center items-center">
              {/* Default Image */}
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="/placeholder.svg?key=b48cv"
                  alt="Real Estate Social Media Contests"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
