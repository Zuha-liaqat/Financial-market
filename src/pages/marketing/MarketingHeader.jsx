import { useState } from 'react'
import { Link } from 'react-router-dom'
import MarketingLogo from './MarketingLogo'
import { MODULES, moduleIcon } from './navData'

export default function MarketingHeader({ active = 'home' }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header>
      <nav className="wrap">
        <Link to="/" className="brand">
          <MarketingLogo />
        </Link>

        <div className="nav-links">
          <Link to="/" className={active === 'home' ? 'active' : ''}>
            Home
          </Link>
          <div className="has-drop">
            <a href="#" onClick={(e) => e.preventDefault()} className={active === 'product' ? 'active' : ''}>
              Product ▾
            </a>
            <div className="dropdown">
              {MODULES.map((m) => (
                <Link key={m.slug} to={`/product/${m.slug}`}>
                  <span className="dico">{moduleIcon(m.icon)}</span>
                  <span>
                    <strong>{m.title}</strong>
                    <span className="sub">{m.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <Link to="/pricing" className={active === 'pricing' ? 'active' : ''}>
            Pricing
          </Link>
          <Link to="/about" className={active === 'about' ? 'active' : ''}>
            About Us
          </Link>
          <Link to="/contact" className={active === 'contact' ? 'active' : ''}>
            Contact
          </Link>
        </div>

        <div className="navcta">
          <Link to="/login" className="btn btn-ghost">
            Log In
          </Link>
          <Link to="/pricing" className="btn btn-primary">
            Start Free Trial
          </Link>
        </div>

        <button type="button" className="burger" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16181D" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </nav>
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        <Link to="/" onClick={() => setMobileOpen(false)}>
          Home
        </Link>
        <Link to="/product/dashboard" onClick={() => setMobileOpen(false)}>
          Product
        </Link>
        <Link to="/pricing" onClick={() => setMobileOpen(false)}>
          Pricing
        </Link>
        <Link to="/about" onClick={() => setMobileOpen(false)}>
          About Us
        </Link>
        <Link to="/contact" onClick={() => setMobileOpen(false)}>
          Contact
        </Link>
        <Link
          to="/pricing"
          className="btn btn-primary"
          style={{ marginTop: 8, justifyContent: 'center' }}
          onClick={() => setMobileOpen(false)}
        >
          Start Free Trial
        </Link>
      </div>
    </header>
  )
}
