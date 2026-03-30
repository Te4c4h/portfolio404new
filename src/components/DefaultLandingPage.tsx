"use client";

import PricingSection from "@/components/PricingSection";

export default function DefaultLandingPage() {
  return (
    <div className="min-h-screen bg-[#131313] text-[#fafafa]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#131313]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-[#70E844] font-bold text-xl">Portfolio 404</span>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="/login" 
                className="text-gray-300 hover:text-white transition"
              >
                Log In
              </a>
              <a 
                href="/register" 
                className="px-4 py-2 bg-[#70E844] text-[#131313] font-semibold rounded-lg hover:opacity-90 transition"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[#fafafa]">
            Build Your <span className="text-[#70E844]">Portfolio</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Create a stunning personal portfolio in minutes. Free to start. No coding required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/register" 
              className="px-8 py-4 bg-[#70E844] text-[#131313] font-bold text-lg rounded-lg hover:opacity-90 transition"
            >
              Create Your Portfolio
            </a>
            <a 
              href="/catalog" 
              className="px-8 py-4 border border-[#70E844] text-[#70E844] font-bold text-lg rounded-lg hover:bg-[#70E844]/10 transition"
            >
              Explore Examples
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose <span className="text-[#70E844]">Portfolio 404</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#181818] rounded-xl border border-white/5">
              <div className="w-12 h-12 bg-[#70E844]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#70E844]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Create your portfolio in minutes with our intuitive drag-and-drop builder.</p>
            </div>
            <div className="p-6 bg-[#181818] rounded-xl border border-white/5">
              <div className="w-12 h-12 bg-[#70E844]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#70E844]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Fully Customizable</h3>
              <p className="text-gray-400">Customize colors, fonts, and layouts to match your personal brand.</p>
            </div>
            <div className="p-6 bg-[#181818] rounded-xl border border-white/5">
              <div className="w-12 h-12 bg-[#70E844]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#70E844]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">SEO Optimized</h3>
              <p className="text-gray-400">Get found online with built-in SEO optimization and analytics.</p>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your <span className="text-[#70E844]">Portfolio</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of creators showcasing their work online.
          </p>
          <a 
            href="/register" 
            className="inline-block px-8 py-4 bg-[#70E844] text-[#131313] font-bold text-lg rounded-lg hover:opacity-90 transition"
          >
            Get Started Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500">
            © 2024 Portfolio 404. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="/login" className="text-gray-500 hover:text-white transition">Log In</a>
            <a href="/register" className="text-gray-500 hover:text-white transition">Sign Up</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
