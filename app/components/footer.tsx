import Link from "next/link"
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-realty-primary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Leuterio Realty & Brokerage</h3>
            <p className="text-gray-300">
              Empowering real estate professionals through innovative marketing and social media strategies.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/leuteriorealty"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
              </a>
              <a
                href="https://www.instagram.com/filipinohomesleuteriorealty/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
              </a>
              <a href="https://x.com/leuteriorealty" target="_blank" rel="noopener noreferrer" aria-label="X Twitter">
                <Twitter className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
              </a>
              <a
                href="https://www.linkedin.com/company/leuterio-realty-&-brokerage/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/contests" className="text-gray-300 hover:text-white transition-colors">
                  All Contests
                </Link>
              </li>
              <li>
                <a
                  href="https://leuteriorealty.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Main Website
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white">Contact Us</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-realty-highlight" />
                <span className="text-gray-300">133F Aznar Road, Sambag 2, Urgello St. Cebu City</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-realty-highlight" />
                <span className="text-gray-300">(+63) 977 815 0888</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-realty-highlight" />
                <a
                  href="mailto:info.leuteriorealty@gmail.com"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  info.leuteriorealty@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-white">
          <p>&copy; {currentYear} Leuterio Realty & Brokerage. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
