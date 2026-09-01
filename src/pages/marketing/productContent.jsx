import { ICONS } from './icons'

export const PRODUCT_CONTENT = {
  dashboard: {
    crumbLabel: 'Dashboard',
    eyebrow: 'PRODUCT — DASHBOARD',
    title: (
      <>
        One command center for <em>every</em> platform.
      </>
    ),
    lead: "See what's drafted, what's waiting on you, and what's already live — across LinkedIn, Instagram and X — without opening three different apps.",
    stats: [
      { value: '12', label: 'Drafted this week' },
      { value: '4', label: 'Awaiting review' },
      { value: '18', label: 'Published this month' },
    ],
    cardsKicker: 'OVERVIEW',
    cardsTitle: 'Everything, at a glance',
    cardsLead: 'The dashboard pulls every workflow below into one screen.',
    cards: [
      { icon: ICONS.grid, title: 'Live status counts', desc: 'Drafted, scheduled, awaiting review and published — updated the moment anything changes.' },
      { icon: ICONS.star, title: 'Top-performer surfacing', desc: 'The dashboard automatically highlights your best post of the week, with views, reactions and reposts.' },
      { icon: ICONS.calendar, title: 'Coming-up preview', desc: "A rolling look at what's scheduled next, so nothing sneaks past the calendar." },
    ],
    stepsTitle: 'From login to insight in seconds',
    stepsLead: 'No configuration required — the dashboard is ready the moment your accounts are connected.',
    steps: [
      { title: 'Connect your platforms', desc: 'Link LinkedIn, Instagram and X once through Integrations.' },
      { title: 'Work as usual', desc: 'Draft, review and schedule posts across the other modules.' },
      { title: 'Check the dashboard', desc: 'Everything you and your team touched shows up here automatically.' },
    ],
    ctaTitle: 'Ready to see your own numbers?',
    ctaLead: 'Start a free trial and connect your first platform in under five minutes.',
  },

  'themes-brands': {
    crumbLabel: 'Themes / Brands',
    eyebrow: 'PRODUCT — THEMES / BRANDS',
    title: (
      <>
        Keep every post on-brand, <em>automatically</em>.
      </>
    ),
    lead: 'Store your logo, palette, fonts and voice once. Every draft — no matter who writes it — inherits the same look and tone.',
    stats: [
      { value: '1', label: 'Setup, once' },
      { value: '100%', label: 'On-brand posts' },
      { value: '3+', label: 'Brand kits supported' },
    ],
    cardsKicker: 'THEMES & BRANDS',
    cardsTitle: 'One brand kit, every platform',
    cardsLead: 'Set it up once and stop re-checking colors and logos on every post.',
    cards: [
      { icon: ICONS.palette, title: 'Locked color palette', desc: 'Define your primary, accent and neutral colors so every graphic pulls from the same set.' },
      { icon: ICONS.plus, title: 'Reusable templates', desc: 'Save post layouts for quotes, stats and announcements so drafting starts halfway done.' },
      { icon: ICONS.shield, title: 'Consistency checks', desc: 'The approval queue flags anything that drifts from your saved brand guidelines.' },
    ],
    stepsTitle: 'Set your brand up in three steps',
    stepsLead: 'A one-time setup that pays off on every post afterward.',
    steps: [
      { title: 'Upload your assets', desc: 'Logo, color codes and fonts go in once.' },
      { title: 'Save your voice', desc: 'Define tone guidelines your writers and AI drafts follow.' },
      { title: 'Reuse everywhere', desc: 'Every new post starts pre-styled to match.' },
    ],
    ctaTitle: 'Give every post a consistent brand voice.',
    ctaLead: 'Set up your first brand kit in minutes.',
  },

  'create-post': {
    crumbLabel: 'Create Post',
    eyebrow: 'PRODUCT — CREATE POST',
    title: (
      <>
        Draft once, tailor for <em>every</em> channel.
      </>
    ),
    lead: 'Write a single idea and adapt the tone, length and hashtags per platform — without opening three separate composers.',
    stats: [
      { value: '3', label: 'Platforms at once' },
      { value: '60s', label: 'Avg. draft time' },
      { value: '1', label: 'Click to submit' },
    ],
    cardsKicker: 'CREATE POST',
    cardsTitle: 'Built for fast, accurate drafting',
    cardsLead: 'Everything a writer needs, nothing that slows them down.',
    cards: [
      { icon: ICONS.plus, title: 'Multi-platform composer', desc: 'Write once and preview how the post will look on LinkedIn, Instagram and X before you submit.' },
      { icon: ICONS.palette, title: 'On-brand by default', desc: 'Fonts, colors and tone pull automatically from your saved brand kit.' },
      { icon: ICONS.shield, title: 'One-click submission', desc: 'Send a finished draft straight into the Approval Queue — no extra steps.' },
    ],
    stepsTitle: 'From idea to submitted draft',
    stepsLead: 'Three steps, most of them automatic.',
    steps: [
      { title: 'Start typing', desc: 'Write your core idea in the composer.' },
      { title: 'Adjust per platform', desc: 'Tweak tone or length for each channel if needed.' },
      { title: 'Submit for review', desc: 'One click sends it to your approval queue.' },
    ],
    ctaTitle: 'Write your next post in under a minute.',
    ctaLead: 'See how the composer feels with a free trial.',
  },

  'create-blog': {
    crumbLabel: 'Create Blog',
    eyebrow: 'PRODUCT — CREATE BLOG',
    title: (
      <>
        Long-form lessons your audience <em>saves</em>.
      </>
    ),
    lead: 'Turn a daily term into a full article — with structure, formatting and SEO guidance built into the editor.',
    stats: [
      { value: '6 min', label: 'Avg. read time' },
      { value: '1-click', label: 'Publish to site' },
      { value: '100%', label: 'SEO-checked' },
    ],
    cardsKicker: 'CREATE BLOG',
    cardsTitle: 'A distraction-free long-form editor',
    cardsLead: 'Everything you need to turn a lesson into an article worth bookmarking.',
    cards: [
      { icon: ICONS.document, title: 'Structured editor', desc: 'Headings, pull-quotes and callouts formatted automatically as you write.' },
      { icon: ICONS.grid, title: 'SEO guidance', desc: 'Built-in checks for title length, readability and keyword placement before you publish.' },
      { icon: ICONS.folder, title: 'Auto-saved to Library', desc: 'Every draft and published article is filed automatically for later reuse.' },
    ],
    stepsTitle: 'From outline to published article',
    stepsLead: 'The editor keeps you focused on writing.',
    steps: [
      { title: 'Draft the outline', desc: 'Start from a term-of-the-day or a blank page.' },
      { title: 'Format as you write', desc: 'Headings and pull-quotes are one click away.' },
      { title: 'Publish or schedule', desc: 'Push live now or queue it into the Calendar.' },
    ],
    ctaTitle: "Turn today's lesson into a full article.",
    ctaLead: 'Try the blog editor free for 14 days.',
  },

  library: {
    crumbLabel: 'Library',
    eyebrow: 'PRODUCT — LIBRARY',
    title: (
      <>
        Every asset, caption and clip in <em>one</em> place.
      </>
    ),
    lead: 'Stop digging through folders and old chat threads. Search your entire content history in seconds.',
    stats: [
      { value: '128+', label: 'Assets stored' },
      { value: '34', label: 'Saved captions' },
      { value: '1', label: 'Search bar' },
    ],
    cardsKicker: 'LIBRARY',
    cardsTitle: "A searchable home for everything you've made",
    cardsLead: 'Every image, caption, and video your team has ever used, tagged and ready to reuse.',
    cards: [
      { icon: ICONS.folder, title: 'Smart tagging', desc: "Assets are tagged by platform, topic and brand kit automatically as they're uploaded." },
      { icon: ICONS.plus, title: 'Reuse in one click', desc: 'Drop any saved image or caption straight into a new draft.' },
      { icon: ICONS.plug, title: 'Synced from every module', desc: 'Anything created in Create Post, Create Blog or Planner lands here automatically.' },
    ],
    stepsTitle: 'Find anything in seconds',
    stepsLead: 'Search beats scrolling.',
    steps: [
      { title: 'Upload or auto-save', desc: 'Assets land here from every other module.' },
      { title: 'Tag and organize', desc: 'Filter by platform, campaign or brand.' },
      { title: 'Reuse instantly', desc: 'Drop straight into your next draft.' },
    ],
    ctaTitle: 'Never recreate an asset twice.',
    ctaLead: 'Start organizing your content library today.',
  },

  'approval-queue': {
    crumbLabel: 'Approval Queue',
    eyebrow: 'PRODUCT — APPROVAL QUEUE',
    title: (
      <>
        Nothing goes live without a <em>sign-off</em>.
      </>
    ),
    lead: 'Every draft — from any writer, on any platform — passes through review before it can be scheduled or published.',
    stats: [
      { value: '4', label: 'Awaiting review' },
      { value: '6h', label: 'Oldest pending' },
      { value: '100%', label: 'Posts reviewed' },
    ],
    cardsKicker: 'APPROVAL QUEUE',
    cardsTitle: 'A safety net for every post',
    cardsLead: 'Catch mistakes before your audience does.',
    cards: [
      { icon: ICONS.shield, title: 'Clear review states', desc: 'Every draft is marked drafted, awaiting review, or approved — never ambiguous.' },
      { icon: ICONS.bell, title: 'Reviewer alerts', desc: 'Reviewers get notified the moment something needs their attention.' },
      { icon: ICONS.grid, title: 'Full audit trail', desc: 'See who drafted, who approved and when — for every single post.' },
    ],
    stepsTitle: 'From draft to approved in three steps',
    stepsLead: 'Built to be fast, not just thorough.',
    steps: [
      { title: 'Draft is submitted', desc: 'A writer sends a finished post from Create Post or Create Blog.' },
      { title: 'Reviewer checks it', desc: 'Brand, accuracy and tone are checked against your guidelines.' },
      { title: 'Approve or return', desc: 'Approved posts move to Calendar; flagged ones go back with notes.' },
    ],
    ctaTitle: 'Publish with confidence, every time.',
    ctaLead: 'Add a review step to your workflow today.',
  },

  calendar: {
    crumbLabel: 'Calendar',
    eyebrow: 'PRODUCT — CALENDAR',
    title: (
      <>
        See your whole content month at a <em>glance</em>.
      </>
    ),
    lead: 'Every scheduled post, on every platform, laid out on one calendar — drag to reschedule in seconds.',
    stats: [
      { value: '3', label: 'Platforms shown' },
      { value: '1', label: 'Drag to reschedule' },
      { value: '0', label: 'Missed slots' },
    ],
    cardsKicker: 'CALENDAR',
    cardsTitle: 'Your entire schedule, visualized',
    cardsLead: 'Spot gaps and clashes before they become a problem.',
    cards: [
      { icon: ICONS.calendar, title: 'Color-coded by platform', desc: 'LinkedIn, Instagram and X posts are instantly distinguishable at a glance.' },
      { icon: ICONS.star, title: 'Drag-and-drop rescheduling', desc: 'Move a post to a new day or time without leaving the calendar view.' },
      { icon: ICONS.bell, title: 'Deadline reminders', desc: "Get nudged before a scheduled post's review deadline passes." },
    ],
    stepsTitle: 'Plan a full month in minutes',
    stepsLead: 'Built to make gaps and clashes obvious.',
    steps: [
      { title: 'Approved posts land automatically', desc: "Nothing needs manual entry once it's approved." },
      { title: 'Scan for gaps', desc: 'Empty days stand out immediately.' },
      { title: 'Drag to fine-tune', desc: 'Reschedule with a click, no menus required.' },
    ],
    ctaTitle: "Stop guessing what's going out this week.",
    ctaLead: 'Bring your whole schedule into one calendar.',
  },

  planner: {
    crumbLabel: 'Planner',
    eyebrow: 'PRODUCT — PLANNER',
    title: (
      <>
        Plan <em>campaigns</em>, not just posts.
      </>
    ),
    lead: 'Group related lessons into a themed campaign, map them across weeks, and track progress from idea to published.',
    stats: [
      { value: 'Kanban', label: 'Board view' },
      { value: 'Weeks', label: 'Or months out' },
      { value: '1', label: 'Shared board' },
    ],
    cardsKicker: 'PLANNER',
    cardsTitle: 'Zoom out from single posts',
    cardsLead: 'See the campaign, not just the next deadline.',
    cards: [
      { icon: ICONS.star, title: 'Kanban-style boards', desc: 'Move ideas from idea to in-progress to scheduled with a simple drag.' },
      { icon: ICONS.calendar, title: 'Campaign timelines', desc: 'Lay a themed series of posts across weeks or months at a glance.' },
      { icon: ICONS.plug, title: 'Team collaboration', desc: 'Everyone sees the same board — no separate spreadsheet needed.' },
    ],
    stepsTitle: 'From idea to campaign',
    stepsLead: "Built for planning ahead, not just today's post.",
    steps: [
      { title: 'Capture the idea', desc: 'Drop a topic into the Ideas column.' },
      { title: 'Assign and schedule', desc: 'Move it through stages as work happens.' },
      { title: 'Track to publish', desc: 'Watch the whole campaign progress on one board.' },
    ],
    ctaTitle: 'Plan your next campaign properly.',
    ctaLead: 'Try the Planner with your team, free.',
  },

  integrations: {
    crumbLabel: 'Integrations',
    eyebrow: 'PRODUCT — INTEGRATIONS',
    title: (
      <>
        Connect the tools your team already <em>uses</em>.
      </>
    ),
    lead: 'Link your social platforms, design tools and workflow apps — Financial Market fits into your stack, not the other way around.',
    stats: [
      { value: '3', label: 'Social platforms' },
      { value: '10+', label: 'Connected apps' },
      { value: '2 min', label: 'Avg. connect time' },
    ],
    cardsKicker: 'INTEGRATIONS',
    cardsTitle: 'Fits the stack you already have',
    cardsLead: 'No migration, no re-training — just connect and go.',
    cards: [
      { icon: ICONS.plug, title: 'One-click platform connect', desc: 'Authorize LinkedIn, Instagram and X in a couple of clicks each.' },
      { icon: ICONS.bell, title: 'Workflow notifications', desc: 'Pipe approval and publish alerts straight into Slack or email.' },
      { icon: ICONS.folder, title: 'Design tool sync', desc: 'Pull assets in directly from Canva or your shared drive.' },
    ],
    stepsTitle: 'Connect once, use everywhere',
    stepsLead: 'Set up your stack in minutes, not days.',
    steps: [
      { title: 'Pick a service', desc: 'Choose from social, design or workflow integrations.' },
      { title: 'Authorize access', desc: 'A secure, standard OAuth connection — no passwords shared.' },
      { title: 'Start using it', desc: 'The integration is immediately available across every module.' },
    ],
    ctaTitle: 'Bring your existing tools along.',
    ctaLead: 'Connect your first integration in under two minutes.',
  },

  notifications: {
    crumbLabel: 'Notifications',
    eyebrow: 'PRODUCT — NOTIFICATIONS',
    title: (
      <>
        The right nudge, right when it <em>matters</em>.
      </>
    ),
    lead: 'No inbox overload — just the alerts that keep drafts moving: approvals, deadlines and publish confirmations.',
    stats: [
      { value: '3', label: 'Unread today' },
      { value: '0', label: 'Missed reviews' },
      { value: 'Real-time', label: 'Delivery' },
    ],
    cardsKicker: 'NOTIFICATIONS',
    cardsTitle: 'Only the alerts that matter',
    cardsLead: 'Tuned to keep your team moving, not distracted.',
    cards: [
      { icon: ICONS.bell, title: 'Smart filtering', desc: 'Approval requests, deadlines and publish confirmations — nothing else.' },
      { icon: ICONS.shield, title: 'Reviewer escalation', desc: 'A pending draft nearing its deadline gets flagged to reviewers automatically.' },
      { icon: ICONS.plug, title: 'Cross-channel delivery', desc: 'Get notified in-app, by email, or in your connected Slack workspace.' },
    ],
    stepsTitle: 'Stay on top of your queue without checking constantly',
    stepsLead: 'Notifications come to you.',
    steps: [
      { title: 'Something needs attention', desc: 'A draft is submitted, approved, or nearing a deadline.' },
      { title: "You're notified instantly", desc: 'In-app, email or Slack — your choice.' },
      { title: 'Act in one click', desc: 'Jump straight to the item from the notification.' },
    ],
    ctaTitle: 'Never miss a pending approval again.',
    ctaLead: 'Set up your notification preferences today.',
  },
}
