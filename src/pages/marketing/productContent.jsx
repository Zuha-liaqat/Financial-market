import { ICONS } from './icons'

export const PRODUCT_CONTENT = {
  dashboard: {
    crumbLabel: 'Dashboard',
    eyebrow: 'PRODUCT: DASHBOARD',
    title: (
      <>
        One command center for <em>every</em> platform.
      </>
    ),
    lead: "See what's drafted, what's waiting on your review, what's scheduled and what's already live, across LinkedIn, Instagram, Facebook and X, on one screen.",
    stats: [
      { value: '12', label: 'Drafted this week' },
      { value: '4', label: 'Awaiting review' },
      { value: '18', label: 'Published this month' },
    ],
    cardsKicker: 'OVERVIEW',
    cardsTitle: 'Everything, at a glance',
    cardsLead: 'The dashboard pulls every workflow below into one screen.',
    cards: [
      { icon: ICONS.grid, title: 'Live status counts', desc: 'Drafted this week, awaiting your review, scheduled to post and published this month, side by side.' },
      { icon: ICONS.bell, title: 'Recent activity', desc: 'A running feed of what was generated, approved and published, so you always know what changed.' },
      { icon: ICONS.calendar, title: 'Coming-up preview', desc: "A rolling look at what's scheduled next, so nothing sneaks past the calendar." },
    ],
    stepsTitle: 'From login to overview in seconds',
    stepsLead: 'No configuration required, the dashboard is ready the moment your accounts are connected.',
    steps: [
      { title: 'Connect your platforms', desc: 'Link LinkedIn, Instagram, Facebook and X through Integrations.' },
      { title: 'Work as usual', desc: 'Generate, review and schedule posts in the other modules.' },
      { title: 'Check the dashboard', desc: 'Everything you touched shows up here automatically.' },
    ],
    ctaTitle: 'Ready to see your own numbers?',
    ctaLead: 'Start on the free plan and connect your first platform in minutes.',
  },

  'themes-brands': {
    crumbLabel: 'Themes / Brands',
    eyebrow: 'PRODUCT: THEMES / BRANDS',
    title: (
      <>
        Teach the AI your <em>brand</em>, once.
      </>
    ),
    lead: 'Save your logo, company description, brand tone, target audience and visual style once, so the content AI creates sounds like you.',
    stats: [
      { value: '1', label: 'Setup, once' },
      { value: '4', label: 'Visual styles' },
      { value: 'Custom', label: 'Color and font' },
    ],
    cardsKicker: 'THEMES & BRANDS',
    cardsTitle: 'One brand profile behind every draft',
    cardsLead: 'Give the AI the context it needs to write in your voice.',
    cards: [
      { icon: ICONS.document, title: 'Brand profile', desc: 'Describe your company, your brand tone and your target audience so AI drafts start with the right context.' },
      { icon: ICONS.palette, title: 'Visual style', desc: 'Pick Minimalist, Bold or Futuristic, or go Custom with your own color and font.' },
      { icon: ICONS.folder, title: 'Logo upload', desc: 'Upload your logo once and keep it with your brand profile.' },
    ],
    stepsTitle: 'Set your brand up in three steps',
    stepsLead: 'A one-time setup that pays off on every post afterward.',
    steps: [
      { title: 'Upload your logo', desc: 'Add your logo to your brand profile.' },
      { title: 'Describe your brand', desc: 'Company description, brand tone and target audience.' },
      { title: 'Pick a visual style', desc: 'Choose a preset or set your own color and font.' },
    ],
    ctaTitle: 'Give the AI your brand voice.',
    ctaLead: 'Set up your brand profile in minutes.',
  },

  'create-post': {
    crumbLabel: 'Create Post',
    eyebrow: 'PRODUCT: CREATE POST',
    title: (
      <>
        Describe it once, post it on <em>every</em> channel.
      </>
    ),
    lead: 'Write a prompt, pick your platforms and tone, and AI drafts the post for LinkedIn, Instagram, Facebook and X, ready for review.',
    stats: [
      { value: '4', label: 'Social platforms' },
      { value: '100%', label: 'Reviewed before publishing' },
      { value: '5', label: 'Tone options' },
    ],
    cardsKicker: 'CREATE POST',
    cardsTitle: 'From prompt to ready-to-review post',
    cardsLead: 'Everything you need to get a post drafted, nothing that slows you down.',
    cards: [
      { icon: ICONS.plus, title: 'AI from a prompt', desc: 'Describe the post, add hashtags, a reference link or your own images, and let AI write the draft.' },
      { icon: ICONS.grid, title: 'Mobile and web previews', desc: 'See how the post will look on each platform, on mobile and desktop, before it goes out.' },
      { icon: ICONS.shield, title: 'Straight to review', desc: 'Every generated post lands in the Approval Queue with its date and time already set.' },
    ],
    stepsTitle: 'From idea to drafted post',
    stepsLead: 'Three steps, most of them automatic.',
    steps: [
      { title: 'Write your prompt', desc: 'Describe the post and choose the tone and hashtags.' },
      { title: 'Pick platforms and a time', desc: 'Select where it goes and when it should publish.' },
      { title: 'Generate', desc: 'AI drafts it and sends it to your Approval Queue.' },
    ],
    ctaTitle: 'Get your next post drafted in minutes.',
    ctaLead: 'Try the AI composer on the free plan.',
  },

  'create-blog': {
    crumbLabel: 'Create Blog',
    eyebrow: 'PRODUCT: CREATE BLOG',
    title: (
      <>
        Long-form articles, drafted by <em>AI</em>.
      </>
    ),
    lead: 'Turn a prompt into a full blog post for WordPress, Medium, Blogger or Wix, in the tone you choose.',
    stats: [
      { value: '4', label: 'Blog platforms' },
      { value: '100%', label: 'Reviewed before publishing' },
      { value: '1', label: 'Prompt to start' },
    ],
    cardsKicker: 'CREATE BLOG',
    cardsTitle: 'From a prompt to a finished article',
    cardsLead: 'Let AI do the first draft, then make it yours.',
    cards: [
      { icon: ICONS.document, title: 'AI-drafted articles', desc: 'Describe the topic, add a reference link or cover image, and get a complete article to review.' },
      { icon: ICONS.grid, title: 'Edit before it goes live', desc: 'Open any draft from the Approval Queue and refine the text right in the editor.' },
      { icon: ICONS.calendar, title: 'Scheduled publishing', desc: 'Set a date and time and the article shows up on your Calendar.' },
    ],
    stepsTitle: 'From prompt to published article',
    stepsLead: 'AI writes the draft, you stay in control.',
    steps: [
      { title: 'Write your prompt', desc: 'Topic, tone and an optional reference link.' },
      { title: 'Review and edit', desc: 'The draft waits in the Approval Queue for your changes.' },
      { title: 'Approve and schedule', desc: 'It publishes on the date and time you set.' },
    ],
    ctaTitle: "Turn today's idea into a full article.",
    ctaLead: 'Start free and draft your first article.',
  },

  library: {
    crumbLabel: 'Library',
    eyebrow: 'PRODUCT: LIBRARY',
    title: (
      <>
        Your photos and videos in <em>one</em> place.
      </>
    ),
    lead: 'Upload the images and clips your team uses, sort them by type, and find them quickly when you need them.',
    stats: [
      { value: '2', label: 'Media types' },
      { value: '1', label: 'Shared library' },
      { value: '1-click', label: 'Filters' },
    ],
    cardsKicker: 'LIBRARY',
    cardsTitle: 'A home for your media',
    cardsLead: 'Stop digging through folders and old chat threads.',
    cards: [
      { icon: ICONS.folder, title: 'Upload once', desc: "Add photos and videos with a name and category so they're easy to find later." },
      { icon: ICONS.grid, title: 'Filter by type', desc: 'Switch between all assets, photographs and videos with a single click.' },
      { icon: ICONS.plus, title: 'Edit or replace', desc: 'Rename an asset, change its category or swap in a new file anytime.' },
    ],
    stepsTitle: 'Keep your media organized',
    stepsLead: 'Filtering beats scrolling.',
    steps: [
      { title: 'Upload', desc: 'Add photos and videos from your device.' },
      { title: 'Name and categorize', desc: 'Give each asset a name and category.' },
      { title: 'Find it fast', desc: 'Filter by type whenever you need something.' },
    ],
    ctaTitle: 'Keep every asset where your team can find it.',
    ctaLead: 'Start building your library today.',
  },

  'approval-queue': {
    crumbLabel: 'Approval Queue',
    eyebrow: 'PRODUCT: APPROVAL QUEUE',
    title: (
      <>
        Nothing goes live without a <em>sign-off</em>.
      </>
    ),
    lead: 'Every AI-generated post and article waits in the queue until you approve it, so nothing is published without your say.',
    stats: [
      { value: 'AI', label: 'Safety score' },
      { value: '1-click', label: 'Batch approve' },
      { value: '100%', label: 'Posts reviewed' },
    ],
    cardsKicker: 'APPROVAL QUEUE',
    cardsTitle: 'A safety net for every post',
    cardsLead: 'Catch mistakes before your audience does.',
    cards: [
      { icon: ICONS.shield, title: 'AI safety score', desc: 'Each draft gets a safety score, and risky content is flagged so you look at it first.' },
      { icon: ICONS.document, title: 'Edit before approving', desc: "Open any post or blog, adjust the text, and approve it once it's right." },
      { icon: ICONS.grid, title: 'Batch approve', desc: 'Select several drafts and approve them together in one click.' },
    ],
    stepsTitle: 'From draft to approved in three steps',
    stepsLead: 'Built to be fast, not just thorough.',
    steps: [
      { title: 'Draft arrives', desc: 'Generated posts and blogs land here automatically.' },
      { title: 'Review and edit', desc: 'Check the score, preview it and fix anything you want.' },
      { title: 'Approve', desc: 'Approved content goes to the Calendar to publish on schedule.' },
    ],
    ctaTitle: 'Publish with confidence, every time.',
    ctaLead: 'Add a review step to your workflow today.',
  },

  calendar: {
    crumbLabel: 'Calendar',
    eyebrow: 'PRODUCT: CALENDAR',
    title: (
      <>
        See your whole content month at a <em>glance</em>.
      </>
    ),
    lead: 'Every scheduled post and article, on every platform, laid out on one calendar. Drag to reschedule in seconds.',
    stats: [
      { value: '4', label: 'Platforms shown' },
      { value: '1', label: 'Drag to reschedule' },
      { value: '3', label: 'Views: day, week, month' },
    ],
    cardsKicker: 'CALENDAR',
    cardsTitle: 'Your entire schedule, visualized',
    cardsLead: 'Spot gaps and clashes before they become a problem.',
    cards: [
      { icon: ICONS.calendar, title: 'Color-coded by platform', desc: 'LinkedIn, Instagram, Facebook and X posts are instantly distinguishable at a glance.' },
      { icon: ICONS.star, title: 'Drag-and-drop rescheduling', desc: 'Move a post to a new day without leaving the calendar view.' },
      { icon: ICONS.grid, title: 'Day, week and month views', desc: 'Zoom out to plan the month or zoom in on the week or a single day.' },
    ],
    stepsTitle: 'Plan a full month in minutes',
    stepsLead: 'Built to make gaps and clashes obvious.',
    steps: [
      { title: 'Scheduled posts appear automatically', desc: 'Nothing needs manual entry.' },
      { title: 'Scan for gaps', desc: 'Empty days stand out immediately.' },
      { title: 'Drag to fine-tune', desc: 'Reschedule with a drag, no menus required.' },
    ],
    ctaTitle: "Stop guessing what's going out this week.",
    ctaLead: 'Bring your whole schedule into one calendar.',
  },

  planner: {
    crumbLabel: 'Planner',
    eyebrow: 'PRODUCT: PLANNER',
    title: (
      <>
        Plan a whole <em>week</em> or month in one go.
      </>
    ),
    lead: 'Give the AI your topic, platforms and posting frequency, and it builds a weekly or monthly content schedule for you to review.',
    stats: [
      { value: 'Weekly', label: 'Or monthly plans' },
      { value: '30', label: 'Posts per month, max' },
      { value: '4', label: 'Social platforms' },
    ],
    cardsKicker: 'PLANNER',
    cardsTitle: 'Zoom out from single posts',
    cardsLead: 'Let AI lay out the schedule, then review what it planned.',
    cards: [
      { icon: ICONS.star, title: 'AI-built schedules', desc: 'Choose how many posts you want and at what time, and AI spreads them across the period.' },
      { icon: ICONS.palette, title: 'Uses your brand', desc: 'Plans draw on your company description, brand tone and target audience.' },
      { icon: ICONS.calendar, title: 'Track progress', desc: 'See how many planned posts are awaiting approval, scheduled or published.' },
    ],
    stepsTitle: 'From topic to full schedule',
    stepsLead: "Built for planning ahead, not just today's post.",
    steps: [
      { title: 'Choose weekly or monthly', desc: 'Set the period, platforms and number of posts.' },
      { title: 'Describe the topic', desc: 'Tell the AI what the plan should cover.' },
      { title: 'Review the plan', desc: 'Planned posts go through the Approval Queue like any other draft.' },
    ],
    ctaTitle: 'Plan your next month properly.',
    ctaLead: 'The Planner is included in the Pro plan and above.',
  },

  integrations: {
    crumbLabel: 'Integrations',
    eyebrow: 'PRODUCT: INTEGRATIONS',
    title: (
      <>
        Connect your social <em>accounts</em>.
      </>
    ),
    lead: 'Link LinkedIn, Instagram, Facebook and X so approved posts publish straight to your pages.',
    stats: [
      { value: '4', label: 'Social platforms' },
      { value: '3', label: 'Notification channels' },
      { value: '1', label: 'Page to manage them' },
    ],
    cardsKicker: 'INTEGRATIONS',
    cardsTitle: 'Your accounts, connected once',
    cardsLead: 'Set it up once and publishing just works.',
    cards: [
      { icon: ICONS.plug, title: 'Social platform connect', desc: 'Connect LinkedIn, Instagram, Facebook and X from the Integrations page.' },
      { icon: ICONS.bell, title: 'Team notifications', desc: 'Send alerts to WhatsApp, Slack or Microsoft Teams.' },
      { icon: ICONS.grid, title: 'Connection status', desc: 'See at a glance which platforms are connected and which still need setup.' },
    ],
    stepsTitle: 'Connect once, publish everywhere',
    stepsLead: 'Set up your accounts in minutes.',
    steps: [
      { title: 'Pick a platform', desc: 'Choose LinkedIn, Instagram, Facebook or X.' },
      { title: 'Authorize access', desc: 'Add your app credentials or sign in to connect.' },
      { title: 'Start publishing', desc: 'Approved posts go out to the connected account.' },
    ],
    ctaTitle: 'Connect your first platform.',
    ctaLead: 'It only takes a few minutes.',
  },

  notifications: {
    crumbLabel: 'Notifications',
    eyebrow: 'PRODUCT: NOTIFICATIONS',
    title: (
      <>
        The right nudge, right when it <em>matters</em>.
      </>
    ),
    lead: 'Know when a post is generated, approved or published, in the app or in WhatsApp, Slack or Microsoft Teams.',
    stats: [
      { value: '3', label: 'External channels' },
      { value: 'In-app', label: 'Notification feed' },
      { value: 'Test', label: 'Before you rely on it' },
    ],
    cardsKicker: 'NOTIFICATIONS',
    cardsTitle: 'Only the alerts that matter',
    cardsLead: 'Tuned to keep your team moving, not distracted.',
    cards: [
      { icon: ICONS.bell, title: 'In-app notifications', desc: 'Generated, approved and published posts show up in your notification feed.' },
      { icon: ICONS.plug, title: 'Team channels', desc: 'Connect WhatsApp, Slack or Microsoft Teams so alerts reach your team where they already talk.' },
      { icon: ICONS.shield, title: 'Send a test', desc: 'Check that a channel works with a test message before you rely on it.' },
    ],
    stepsTitle: 'Stay on top of your queue without checking constantly',
    stepsLead: 'Notifications come to you.',
    steps: [
      { title: 'Something happens', desc: 'A post is generated, approved or published.' },
      { title: "You're notified", desc: 'In the app, WhatsApp, Slack or Teams.' },
      { title: 'Take the next step', desc: 'Open the app and act on it.' },
    ],
    ctaTitle: 'Never miss a pending approval again.',
    ctaLead: 'Set up your notification channels today.',
  },
}
