import { useParams, Navigate } from 'react-router-dom'
import MarketingPage from './MarketingPage'
import { PageBanner, FeatureCards, StepsSection, CtaBannerSection } from './pieces'
import { PRODUCT_CONTENT } from './productContent'

const VISUAL_TITLES = {
  dashboard: 'Dashboard Overview',
  'themes-brands': 'Themes / Brands',
  'create-post': 'Create Post',
  'create-blog': 'Create Blog',
  library: 'Library',
  'approval-queue': 'Approval Queue',
  calendar: 'Calendar',
  planner: 'Planner',
  integrations: 'Integrations',
  notifications: 'Notifications',
}

const SHORT_VISUALS = new Set(['integrations', 'notifications', 'planner', 'approval-queue'])

function ScreenshotVisual({ slug }) {
  const isShort = SHORT_VISUALS.has(slug)
  return (
    <div style={isShort ? { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 } : undefined}>
      {/* The screenshots carry the app's light grey page colour, so frame them on a white card
          to keep them from blending into the banner background. */}
      <div
        style={{
          width: '100%',
          background: '#fff',
          padding: 12,
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
        }}
      >
        <img
          src={`/product-screenshots/${slug}.png`}
          alt={VISUAL_TITLES[slug]}
          style={{ display: 'block', width: '100%', borderRadius: 8 }}
        />
      </div>
    </div>
  )
}

export default function ProductPage() {
  const { slug } = useParams()
  const content = PRODUCT_CONTENT[slug]

  if (!content) return <Navigate to="/" replace />

  return (
    <MarketingPage active="product">
      <PageBanner
        eyebrow={content.eyebrow}
        title={content.title}
        lead={content.lead}
        stats={content.stats}
        visual={VISUAL_TITLES[slug] ? <ScreenshotVisual slug={slug} /> : null}
      />
      <FeatureCards kicker={content.cardsKicker} title={content.cardsTitle} lead={content.cardsLead} cards={content.cards} />
      <StepsSection kicker="HOW IT WORKS" title={content.stepsTitle} lead={content.stepsLead} steps={content.steps} />
      <CtaBannerSection title={content.ctaTitle} lead={content.ctaLead} />
    </MarketingPage>
  )
}
