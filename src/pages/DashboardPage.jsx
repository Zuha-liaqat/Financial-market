import { useNavigate } from 'react-router-dom'
import { calendarEvents } from '../data/calendarEvents'

const statCards = [
  {
    value: '12',
    label: 'Drafted this week',
    accent: 'text-brand-500',
    detail: '↑ across 3 platforms',
    detailColor: 'text-brand-500',
  },
  {
    value: '4',
    label: 'Awaiting your review',
    accent: 'text-orange-500',
    detail: 'Oldest: 6h ago',
    detailColor: 'text-orange-500',
  },
  {
    value: '3',
    label: 'Scheduled to post',
    accent: 'text-black',
    detail: 'Next: Thu 9:00 AM',
    detailColor: 'text-black',
  },
  {
    value: '18',
    label: 'Published this month',
    accent: 'text-brand-500',
    detail: (
      <>
        Across <span className="font-semibold text-[#0A66C2]">LinkedIn</span>,{' '}
        <span className="font-semibold text-[#E4405F]">Instagram</span> and{' '}
        <span className="font-semibold text-black">X/Twitter</span>
      </>
    ),
  },
]

const platforms = [
  {
    name: 'LinkedIn',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    drafted: 5,
    scheduled: 2,
    published: 9,
    barColor: 'bg-sky-500',
  },
  {
    name: 'Instagram',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dash-ig" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEDA75" />
            <stop offset="25%" stopColor="#FA7E1E" />
            <stop offset="50%" stopColor="#D62976" />
            <stop offset="75%" stopColor="#962FBF" />
            <stop offset="100%" stopColor="#4F5BD5" />
          </linearGradient>
        </defs>
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="url(#dash-ig)" strokeWidth="2" />
        <circle cx="12" cy="12" r="4.2" stroke="url(#dash-ig)" strokeWidth="2" />
        <circle cx="17.3" cy="6.7" r="1.2" fill="url(#dash-ig)" />
      </svg>
    ),
    drafted: 4,
    scheduled: 1,
    published: 6,
    barColor: 'bg-[#E4405F]',
  },
  {
    name: 'X/Twitter',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="black">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    drafted: 3,
    scheduled: 0,
    published: 3,
    barColor: 'bg-black',
  },
]

const recentActivity = [
  {
    icon: 'check',
    iconBg: 'bg-cyan-100 text-cyan-600',
    text: '3 LinkedIn posts approved for BVB Weekly Market Recap',
    time: '32 MIN AGO',
    author: 'ALEX V.',
  },
  {
    icon: 'clock',
    iconBg: 'bg-purple-100 text-purple-600',
    text: 'Relay drafted 6 new posts from the Investment Academy folder',
    time: '2H AGO',
    author: 'RELAY AI',
  },
  {
    icon: 'doc',
    iconBg: 'bg-neutral-200 text-neutral-600',
    text: 'Termenul Zilei brief added to the library',
    time: '5H AGO',
    author: 'ALEX V.',
  },
  {
    icon: 'info',
    iconBg: 'bg-orange-100 text-orange-500',
    text: 'Feel the Markets interview theme starts in 3 days — no source material added yet',
    time: '1D AGO',
    author: 'SYSTEM',
  },
]

const activityIcons = {
  check: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75l2.25 2.25L15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  clock: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  doc: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  info: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
}

function getUpcomingDate(dayOffset) {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  return d
}

function formatMonthDay(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

const eventPlatforms = {
  'Investment Academy: New Episode': ['INSTAGRAM', 'LINKEDIN'],
  'Feel the Markets: Analyst Interview': ['LINKEDIN'],
  'Termenul Zilei: Dividend Yield': ['LINKEDIN', 'INSTAGRAM'],
  'BVB Weekly Market Recap': ['TWITTER'],
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const upcomingEvents = calendarEvents
    .filter((e) => e.dayOffset >= 0)
    .sort((a, b) => a.dayOffset - b.dayOffset)
    .slice(0, 3)

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-neutral-200 bg-white p-5"
          >
            <p className={`text-3xl font-bold ${card.accent}`}>{card.value}</p>
            <p className="mt-1 text-sm text-neutral-500">{card.label}</p>
            <p className={`mt-2 text-xs font-medium ${card.detailColor ?? ''}`}>
              {card.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Platforms at a glance */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-black">Platforms at a glance</h2>
            <button
              onClick={() => navigate('/calendar')}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Open calendar →
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {platforms.map((p) => {
              const total = p.drafted + p.scheduled + p.published
              return (
                <div
                  key={p.name}
                  className="rounded-lg border border-neutral-200 bg-white p-4"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <span className="shrink-0">{p.icon}</span>
                    <span className="truncate text-sm font-semibold text-black">{p.name}</span>
                  </div>
                  <div className="mb-3 flex items-center justify-between gap-1">
                    <div className="min-w-0 flex-1 text-center">
                      <p className="text-lg font-bold text-black">{p.drafted}</p>
                      <p className="truncate text-[9px] font-semibold tracking-wider text-neutral-400">
                        DRAFTED
                      </p>
                    </div>
                    <div className="min-w-0 flex-1 text-center">
                      <p className="text-lg font-bold text-black">{p.scheduled}</p>
                      <p className="truncate text-[9px] font-semibold tracking-wider text-neutral-400">
                        SCHEDULED
                      </p>
                    </div>
                    <div className="min-w-0 flex-1 text-center">
                      <p className="text-lg font-bold text-black">{p.published}</p>
                      <p className="truncate text-[9px] font-semibold tracking-wider text-neutral-400">
                        PUBLISHED
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className={`h-full rounded-full ${p.barColor}`}
                      style={{ width: `${(p.published / total) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top post this week */}
        <div>
          <h2 className="mb-3 text-xl font-bold text-black">Top post this week</h2>
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <p className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-orange-500">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              BEST PERFORMER
            </p>
            <p className="text-sm leading-relaxed text-neutral-700">
              &quot;Understanding dividend yield is the first step to building real
              wealth — here&apos;s how we break it down in this week&apos;s Investment
              Academy episode.&quot;
            </p>
            <div className="mt-5 border-t border-neutral-200 pt-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-lg font-bold text-black">4.2k</p>
                  <p className="text-[9px] font-semibold tracking-wider text-neutral-400">
                    VIEWS
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-black">312</p>
                  <p className="text-[9px] font-semibold tracking-wider text-neutral-400">
                    REACTIONS
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-black">28</p>
                  <p className="text-[9px] font-semibold tracking-wider text-neutral-400">
                    REPOSTS
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent activity */}
        <div>
          <h2 className="mb-3 text-xl font-bold text-black">Recent activity</h2>
          <div className="space-y-2">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white px-4 py-3.5"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.iconBg}`}
                >
                  {activityIcons[item.icon]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-black">{item.text}</p>
                  <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-neutral-400">
                    {item.time} • {item.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming up */}
        <div>
          <h2 className="mb-3 text-xl font-bold text-black">Coming up</h2>
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-neutral-400">No upcoming events</p>
            ) : (
    <div className="space-y-3">
                {upcomingEvents.map((event, i) => {
                  const date = getUpcomingDate(event.dayOffset)
                  const plats = eventPlatforms[event.title] || []
                  return (
                    <div key={event.id}>
                      {i > 0 && <div className="mb-4 border-t border-neutral-200" />}
                      <div className="flex items-start gap-4">
                        <span className="shrink-0 rounded bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-600">
                          {formatMonthDay(date)}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-black">{event.title}</p>
                          <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-neutral-400">
                            {plats.join(' • ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
