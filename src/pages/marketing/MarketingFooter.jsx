import { Link } from 'react-router-dom'
import MarketingLogo from './MarketingLogo'
import { MODULES } from './navData'

export default function MarketingFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link to="/" className="brand">
              <MarketingLogo />
            </Link>
            <p>The AI-powered content studio that drafts, approves and publishes your posts everywhere, on time and on brand.</p>
          </div>
          <div className="foot-col">
            <h5>Product</h5>
            {MODULES.slice(0, 5).map((m) => (
              <Link to={`/product/${m.slug}`} key={m.slug}>
                {m.title}
              </Link>
            ))}
          </div>
          <div className="foot-col">
            <h5>More</h5>
            {MODULES.slice(5).map((m) => (
              <Link to={`/product/${m.slug}`} key={m.slug}>
                {m.title}
              </Link>
            ))}
          </div>
          <div className="foot-col">
            <h5>Company</h5>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>&copy; {new Date().getFullYear()} Financial Market. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
