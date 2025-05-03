import Image from "next/image"
import { ArrowRight, Award, Users, TrendingUp } from "lucide-react"

export default function AboutSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 opacity-0 animate-fadeIn">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Social Media Contests for Real Estate Professionals</h2>
          <p className="text-lg text-realty-text">
            At Leuterio Realty & Brokerage and Filipino Homes, we empower our agents through engaging social media
            contests tied to our events. Team leaders can also create their own contests through our CRM platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md opacity-0 animate-fadeIn animate-delay-100">
            <div className="bg-realty-primary bg-opacity-10 p-4 rounded-full inline-block mb-4">
              <Award className="h-8 w-8 text-realty-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Event-Based Contests</h3>
            <p className="text-realty-text mb-4">
              Our social media contests are designed for agents attending our company events, providing opportunities to
              engage and win prizes.
            </p>
            <a
              href="#"
              className="inline-flex items-center text-realty-secondary hover:text-realty-primary transition-colors"
            >
              Learn more <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md opacity-0 animate-fadeIn animate-delay-200">
            <div className="bg-realty-primary bg-opacity-10 p-4 rounded-full inline-block mb-4">
              <Users className="h-8 w-8 text-realty-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Team Leader Tools</h3>
            <p className="text-realty-text mb-4">
              Team leaders can create their own contests through our CRM platform at leuteriorealty.com for their
              specific events and team activities.
            </p>
            <a
              href="#"
              className="inline-flex items-center text-realty-secondary hover:text-realty-primary transition-colors"
            >
              Learn more <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md opacity-0 animate-fadeIn animate-delay-300">
            <div className="bg-realty-primary bg-opacity-10 p-4 rounded-full inline-block mb-4">
              <TrendingUp className="h-8 w-8 text-realty-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Boost Your Visibility</h3>
            <p className="text-realty-text mb-4">
              Participating in our contests helps agents increase their social media presence and connect with potential
              clients in the Philippine real estate market.
            </p>
            <a
              href="#"
              className="inline-flex items-center text-realty-secondary hover:text-realty-primary transition-colors"
            >
              Learn more <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative opacity-0 animate-fadeIn">
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
              <Image src="/placeholder.svg?key=r30nt" alt="Real Estate Event" fill className="object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg w-48 opacity-0 animate-fadeIn animate-delay-400">
              <div className="text-realty-highlight font-bold text-xl">200+</div>
              <div className="text-realty-text">Active Sales Agents</div>
            </div>
          </div>

          <div className="space-y-6 opacity-0 animate-fadeIn animate-delay-200">
            <h2 className="text-3xl md:text-4xl font-bold">Why Our Social Media Contests Work</h2>
            <p className="text-realty-text">
              Our contests are strategically designed to increase engagement, generate leads, and build brand awareness
              for both our company and our individual agents.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-realty-highlight rounded-full p-1 mr-3 mt-1">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-realty-text">Increased visibility for agents attending company events</p>
              </li>
              <li className="flex items-start">
                <div className="bg-realty-highlight rounded-full p-1 mr-3 mt-1">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-realty-text">Higher engagement rates compared to traditional marketing</p>
              </li>
              <li className="flex items-start">
                <div className="bg-realty-highlight rounded-full p-1 mr-3 mt-1">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-realty-text">Team leaders can create customized contests for their specific needs</p>
              </li>
              <li className="flex items-start">
                <div className="bg-realty-highlight rounded-full p-1 mr-3 mt-1">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-realty-text">Building personal brands for our sales agents</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
