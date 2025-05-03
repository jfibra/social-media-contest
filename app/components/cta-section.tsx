import Link from "next/link"

export default function CTASection() {
  return (
    <section className="py-16 bg-realty-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto opacity-0 animate-fadeIn">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Create Your Own Contest?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Team leaders can access our CRM platform to create customized social media contests for their events.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contests"
              className="bg-realty-highlight hover:bg-opacity-90 text-white px-8 py-3 rounded-md font-medium text-center transition-all duration-300"
            >
              View All Contests
            </Link>
            <a
              href="https://leuteriorealty.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-realty-primary text-white px-8 py-3 rounded-md font-medium text-center transition-all duration-300"
            >
              Access CRM Platform
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
