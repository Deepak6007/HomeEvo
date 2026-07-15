"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PublicNavProps {
  onSignIn?: () => void
  onGetStarted?: () => void
}

export function PublicNav({ onSignIn, onGetStarted }: PublicNavProps) {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  // Track scroll positioning to apply sticky blur effects
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lock body scroll when mobile menu is active
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  const handleNavClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-cream/80 backdrop-blur-md border-b border-border/50 py-3 shadow-sm"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 z-50">
              <div className="h-9 w-9 rounded-xl bg-orange flex items-center justify-center text-white shadow-md shadow-orange/20">
                <Flame className="h-5 w-5 fill-current" />
              </div>
              <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
                HomeEvo
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="#how-it-works"
                className="text-sm font-semibold tracking-wide text-muted-foreground hover:text-orange transition-colors font-body"
              >
                How It Works
              </Link>
              <Link
                href="#services"
                className="text-sm font-semibold tracking-wide text-muted-foreground hover:text-orange transition-colors font-body"
              >
                Services
              </Link>
              <Link
                href="#vendors"
                className="text-sm font-semibold tracking-wide text-muted-foreground hover:text-orange transition-colors font-body"
              >
                For Vendors
              </Link>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onSignIn}
                className="font-bold text-sm text-foreground hover:text-orange px-4 h-9"
              >
                Sign In
              </Button>
              <Button
                onClick={onGetStarted}
                className="bg-orange text-white hover:bg-orange/95 px-5 h-9 font-bold text-sm tracking-wide shadow-md shadow-orange/10 hover:shadow-lg transition-all duration-300"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden z-50 p-2 text-foreground hover:text-orange focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-35 bg-cream flex flex-col justify-between p-6 pt-24 transition-all duration-500 md:hidden ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        {/* Decorative elements */}
        <div className="absolute top-[20%] right-[-10%] w-72 h-72 rounded-full bg-orange/5 filter blur-3xl" />
        <div className="absolute bottom-[10%] left-[-10%] w-72 h-72 rounded-full bg-orange/5 filter blur-3xl" />

        {/* Mobile Navigation Links */}
        <nav className="flex flex-col gap-6 pt-8 z-10">
          <Link
            href="#how-it-works"
            onClick={handleNavClick}
            className="font-display text-3xl font-extrabold tracking-tight hover:text-orange transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="#services"
            onClick={handleNavClick}
            className="font-display text-3xl font-extrabold tracking-tight hover:text-orange transition-colors"
          >
            Services
          </Link>
          <Link
            href="#vendors"
            onClick={handleNavClick}
            className="font-display text-3xl font-extrabold tracking-tight hover:text-orange transition-colors"
          >
            For Vendors
          </Link>
        </nav>

        {/* Mobile CTAs & Info */}
        <div className="space-y-6 pb-12 z-10">
          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              onClick={() => {
                handleNavClick()
                onSignIn?.()
              }}
              className="w-full h-12 border-border text-foreground hover:bg-muted font-bold tracking-wide"
            >
              Sign In
            </Button>
            <Button
              onClick={() => {
                handleNavClick()
                onGetStarted?.()
              }}
              className="w-full h-12 bg-orange text-white hover:bg-orange/95 font-bold tracking-wide shadow-lg shadow-orange/10"
            >
              Get Started
            </Button>
          </div>

          <div className="border-t border-border/60 pt-6 flex flex-col gap-1 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Andhra Pradesh's #1 Construction Marketplace
            </span>
            <span className="text-[10px] font-normal text-muted-foreground/60 font-mono">
              &copy; {new Date().getFullYear()} HomeEvo. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
