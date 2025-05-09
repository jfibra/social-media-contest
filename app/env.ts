// Use proper formatting for API base URL and ensure HTTPS
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.leuteriorealty.com/lr/v1/public/api"
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://contest.leuteriorealty.com"

// Ensure NEXT_PUBLIC_API_BASE_URL_2 uses HTTPS
let apiBaseUrl2 = process.env.NEXT_PUBLIC_API_BASE_URL_2 || "https://api.leuteriorealty.com/lr/v2/public/api"
if (apiBaseUrl2.startsWith("http:")) {
  apiBaseUrl2 = apiBaseUrl2.replace("http:", "https:")
}
export const API_BASE_URL_2 = apiBaseUrl2
