export const MODULES = [
  {
    slug: 'dashboard',
    title: 'Dashboard',
    desc: 'One command center for every platform',
    color: '#1A4467',
    icon: (
      <>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </>
    ),
  },
  {
    slug: 'themes-brands',
    title: 'Themes / Brands',
    desc: 'Keep every post on-brand, automatically',
    color: '#F2790C',
    icon: (
      <>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3C19.8 15.4 22 13 22 12c0-5.5-4.5-10-10-10z" />
        <circle cx="7.5" cy="10.5" r="1.2" fill="#0B4A73" />
        <circle cx="11" cy="7" r="1.2" fill="#0B4A73" />
        <circle cx="15.5" cy="8.5" r="1.2" fill="#0B4A73" />
      </>
    ),
  },
  {
    slug: 'create-post',
    title: 'Create Post',
    desc: 'Draft once, tailor for every channel',
    color: '#00A6F4',
    icon: <path d="M12 5v14M5 12h14" />,
  },
  {
    slug: 'create-blog',
    title: 'Create Blog',
    desc: 'Long-form lessons your audience saves',
    color: '#045C8C',
    icon: (
      <>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        <path d="M9 7h7M9 11h7" />
      </>
    ),
  },
  {
    slug: 'library',
    title: 'Library',
    desc: 'Every asset, caption and clip in one place',
    color: '#FF9F1C',
    icon: <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />,
  },
  {
    slug: 'approval-queue',
    title: 'Approval Queue',
    desc: 'Nothing goes live without a sign-off',
    color: '#16A34A',
    icon: (
      <>
        <path d="M12 2l8 3.5v5.5c0 5-3.4 8.9-8 11-4.6-2.1-8-6-8-11V5.5L12 2z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    slug: 'calendar',
    title: 'Calendar',
    desc: 'See your whole content month at a glance',
    color: '#E4405F',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
  },
  {
    slug: 'planner',
    title: 'Planner',
    desc: 'Plan campaigns, not just posts',
    color: '#0A66C2',
    icon: (
      <>
        <path d="M12 3l1.8 4.8L19 9l-4.8 1.8L12 16l-1.8-5.2L5 9l5.2-1.2L12 3z" />
        <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
      </>
    ),
  },
  {
    slug: 'integrations',
    title: 'Integrations',
    desc: 'Connect the tools your team already uses',
    color: '#7B4FE0',
    icon: (
      <>
        <path d="M9 3H5a2 2 0 00-2 2v4M15 3h4a2 2 0 012 2v4M9 21H5a2 2 0 01-2-2v-4M15 21h4a2 2 0 002-2v-4" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  {
    slug: 'notifications',
    title: 'Notifications',
    desc: 'The right nudge, right when it matters',
    color: '#12314C',
    icon: (
      <>
        <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 01-3.4 0" />
      </>
    ),
  },
]

export function moduleIcon(icon, color = '#0B4A73') {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      {icon}
    </svg>
  )
}
