import { useParams, Navigate } from 'react-router-dom'
import MarketingPage from './MarketingPage'
import { PageBanner, MockCard, FeatureCards, StepsSection, CtaBannerSection } from './pieces'
import { PRODUCT_CONTENT } from './productContent'

const VISUAL_TITLES = {
  dashboard: 'Dashboard — Overview',
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

function ScreenshotVisual({ slug }) {
  return (
    <MockCard>
      <img
        src={`/product-screenshots/${slug}.png`}
        alt={VISUAL_TITLES[slug]}
        style={{ borderRadius: 10, border: '1px solid var(--line)', width: '100%' }}
      />
    </MockCard>
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
