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
      <img
        src={`/product-screenshots/${slug}.png`}
        alt={VISUAL_TITLES[slug]}
        style={{ display: 'block', width: '100%', background: '#fff', borderRadius: 12 }}
      />
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
