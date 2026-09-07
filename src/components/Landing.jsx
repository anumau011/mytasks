import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cloud,
  Gauge,
  LayoutGrid,
  ListTodo,
  Lock,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react'
import Seo from './Seo'

// The marketing front door. Everything a signed-out visitor — and every
// crawler — sees at "/". Signed-in users never reach it; App sends them
// straight to the Dashboard.
//
// The copy here is the site's only indexable content, so the headings are real
// h1/h2/h3s in order and the FAQ uses <details> rather than JS-toggled state:
// the answers sit in the DOM whether or not anything expands them.

const FEATURES = [
  {
    icon: Zap,
    title: 'Capture at the speed of thought',
    body: 'Type the task, press Enter, keep going. No required due date, no project picker, no three-step form standing between a thought and your list.',
  },
  {
    icon: Gauge,
    title: 'Opens before you lose the thread',
    body: 'One screen, no dashboard to load first. The app is small on purpose, so the tab is ready by the time you have finished reaching for it.',
  },
  {
    icon: Sparkles,
    title: 'Nothing to learn',
    body: 'There is no onboarding tour, no workspace to configure, no template gallery. Make an account and write your first task ten seconds later.',
  },
  {
    icon: Cloud,
    title: 'Synced to your account',
    body: 'Tasks live in the database, not in one browser. Close the laptop, open your phone, and the same list is waiting for you.',
  },
  {
    icon: Smartphone,
    title: 'Works on the small screen',
    body: 'The same interface scales down instead of hiding half of itself behind a menu. Your list is your list on any device.',
  },
  {
    icon: Lock,
    title: 'Yours alone',
    body: 'Every project, section and task is scoped to your signed-in account. Sessions use an httpOnly cookie, and passwords are hashed, never stored.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Make an account',
    body: 'Name, email, password. That is the entire setup, and it is the last form you will fill in.',
  },
  {
    n: '02',
    title: 'Start a project',
    body: 'Pick a flat checklist for a simple list, or a sectioned project when the work has real moving parts.',
  },
  {
    n: '03',
    title: 'Work the list',
    body: 'Add, tick, edit in place, delete. Everything saves as you go, so there is nothing to remember to sync.',
  },
]

const BLOATED = [
  'Ten minutes of setup before the first task exists',
  'Custom fields, statuses and automations to maintain',
  'A dashboard that reports on work instead of doing it',
  'Notifications that pull you out of the thing you were doing',
  'A tool you avoid opening, so the list quietly goes stale',
]

const SIMPLE = [
  'First task written within a minute of signing up',
  'One field: what needs doing',
  'A list that shows the work, not charts about the work',
  'Nothing pings you — you come to it',
  'Cheap enough to open that you actually keep it current',
]

const FAQS = [
  {
    q: 'What is a simple to-do app?',
    a: 'A simple to-do app is a task manager stripped to the essentials: capture a task, see your list, tick it off. It leaves out the timelines, dependencies, custom fields and dashboards that turn general project software into a second job.',
  },
  {
    q: 'Is MyTasks free?',
    a: 'Yes. Create an account and use it. There is no paid tier gating the features and no card required.',
  },
  {
    q: 'Does MyTasks sync across devices?',
    a: 'Yes. Every task is saved to your account rather than to the browser, so the list you leave on your laptop is the list you open on your phone.',
  },
  {
    q: 'Can I use MyTasks for bigger projects, not just a daily list?',
    a: 'Yes. Every project can be a flat checklist or a project split into sections with a to-do / in-progress / done board. You pick per project, so a grocery list stays a list and a launch plan gets a board.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. MyTasks runs in the browser on desktop and mobile. There is nothing to download and nothing to configure before your first task.',
  },
]

// --- shared bits -------------------------------------------------------

function Cta({ onSignup, onLogin }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onSignup}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-blush px-6 text-sm font-semibold text-ink transition-colors hover:bg-mauve"
      >
        Start free
        <ArrowRight className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onLogin}
        className="inline-flex h-11 items-center rounded-xl border border-white/25 px-6 text-sm font-medium text-cream transition-colors hover:bg-white/10"
      >
        Log in
      </button>
    </div>
  )
}

function Section({ id, eyebrow, title, lead, children }) {
  return (
    <section id={id} className="border-t border-white/10 px-5 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl">
        {eyebrow && (
          <p className="text-[11px] font-semibold tracking-widest text-mauve uppercase">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold sm:text-3xl">{title}</h2>
        {lead && <p className="mt-3 max-w-2xl text-cream/60">{lead}</p>}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  )
}

// --- page --------------------------------------------------------------

export default function Landing({ onLogin, onSignup }) {
  return (
    <div className="min-h-screen">
      <Seo
        title="MyTasks — A Simple To-Do App Built for Focus"
        description="MyTasks is a simple to-do app and minimalist task manager for people tired of bloated project tools. Capture a task in one keystroke, track your day, and sync across devices. Free to use."
        path="/"
      />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-blush focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-base/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5">
          <a href="/" className="flex items-center gap-2" aria-label="MyTasks home">
            <CheckCircle2 className="h-5 w-5 text-mauve" />
            <span className="text-sm font-semibold tracking-wide">MyTasks</span>
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
            <a href="#features" className="text-sm text-cream/65 hover:text-cream">
              Features
            </a>
            <a href="#two-ways" className="text-sm text-cream/65 hover:text-cream">
              How it works
            </a>
            <a href="#faq" className="text-sm text-cream/65 hover:text-cream">
              FAQ
            </a>
            <a href="/blog/" className="text-sm text-cream/65 hover:text-cream">
              Blog
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogin}
              className="h-9 rounded-lg px-3 text-sm font-medium text-cream/75 transition-colors hover:bg-white/10 hover:text-cream"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={onSignup}
              className="h-9 rounded-lg bg-blush px-4 text-sm font-semibold text-ink transition-colors hover:bg-mauve"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="px-5 pt-20 pb-20 sm:pt-28">
          <div className="mx-auto max-w-5xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs text-cream/70">
              <Sparkles className="h-3.5 w-3.5 text-mauve" />
              Free · no card · nothing to install
            </p>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.1]">
              The simple to-do app that gives you your focus back
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-cream/65">
              MyTasks is a minimalist task manager for people who are done fighting
              their project software. Capture a task in a keystroke, see your whole day
              on one screen, and get back to the work itself.
            </p>

            <div className="mt-8">
              <Cta onSignup={onSignup} onLogin={onLogin} />
            </div>

            <dl className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
              {[
                ['One keystroke', 'from thought to captured task'],
                ['Zero setup', 'before your first task exists'],
                ['Every device', 'one list, wherever you open it'],
              ].map(([term, def]) => (
                <div key={term} className="bg-surface px-6 py-6">
                  <dt className="text-lg font-semibold text-cream">{term}</dt>
                  <dd className="mt-1 text-sm text-cream/55">{def}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Problem */}
        <Section
          eyebrow="The problem"
          title="Your task manager became another job"
          lead="Most productivity tools grew into project management platforms. Somewhere in
            that growth, writing down what you have to do stopped being the easy part."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                h: 'Setup tax',
                p: 'Before a single task exists you are choosing a workspace, a template, a view and a status scheme.',
              },
              {
                h: 'Friction on capture',
                p: 'When adding a task takes six clicks, you stop adding them. The list drifts out of date, and you stop trusting it.',
              },
              {
                h: 'Clutter as anxiety',
                p: 'Eleven views of the same work do not make the work clearer. They make it louder.',
              },
            ].map(({ h, p }) => (
              <div
                key={h}
                className="rounded-2xl border border-white/10 bg-surface p-6"
              >
                <h3 className="font-semibold">{h}</h3>
                <p className="mt-2 text-sm text-cream/60">{p}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Features */}
        <Section
          id="features"
          eyebrow="Features"
          title="Everything you need. Nothing you don't."
          lead="A distraction-free daily task tracker, built around the four things that
            actually decide whether you keep using one."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/10 bg-surface p-6 transition-colors hover:border-mauve/40"
              >
                <Icon className="h-5 w-5 text-mauve" aria-hidden="true" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/60">{body}</p>
              </article>
            ))}
          </div>
        </Section>

        {/* Two ways to work */}
        <Section
          id="two-ways"
          eyebrow="Two ways to work"
          title="A list when a list is enough. A board when it isn't."
          lead="Simple should not mean limited. Every project is one of two shapes, and you
            pick the shape when you create it."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-surface p-7">
              <ListTodo className="h-5 w-5 text-mauve" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold">Simple checklist</h3>
              <p className="mt-2 text-sm text-cream/60">
                A flat list you tick off. Groceries, errands, the six things standing
                between you and the end of the day.
              </p>
              <ul className="mt-5 space-y-2.5" aria-label="Example checklist">
                {[
                  ['Draft the launch email', true],
                  ['Review pull request #214', true],
                  ['Book the dentist', false],
                  ['Renew the domain', false],
                ].map(([text, done]) => (
                  <li key={text} className="flex items-center gap-3 text-sm">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        done ? 'border-mauve bg-mauve' : 'border-white/30'
                      }`}
                      aria-hidden="true"
                    />
                    <span className={done ? 'text-cream/40 line-through' : 'text-cream/80'}>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-white/10 bg-surface p-7">
              <LayoutGrid className="h-5 w-5 text-mauve" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold">Sectioned project board</h3>
              <p className="mt-2 text-sm text-cream/60">
                Split the work into sections, each with a to-do / in-progress / done
                board. Enough structure to see where things stand, and no more.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2" aria-label="Example board">
                {[
                  ['To do', 2],
                  ['In progress', 1],
                  ['Done', 3],
                ].map(([label, count]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 bg-raised p-3"
                  >
                    <p className="text-[10px] font-semibold tracking-widest text-cream/50 uppercase">
                      {label}
                    </p>
                    <div className="mt-2.5 space-y-1.5">
                      {Array.from({ length: count }, (_, i) => (
                        <div
                          key={i}
                          className="h-4 rounded bg-white/10"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </Section>

        {/* How it works */}
        <Section
          eyebrow="Getting started"
          title="Three steps, and the third one is just using it"
        >
          <ol className="grid gap-4 sm:grid-cols-3">
            {STEPS.map(({ n, title, body }) => (
              <li key={n} className="rounded-2xl border border-white/10 bg-surface p-6">
                <span className="text-sm font-semibold text-mauve tabular-nums">{n}</span>
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-cream/60">{body}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Comparison */}
        <Section
          eyebrow="The difference"
          title="Bloated project software vs. a simple to-do app"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-surface p-7">
              <h3 className="text-sm font-semibold tracking-widest text-cream/50 uppercase">
                The heavy tool
              </h3>
              <ul className="mt-5 space-y-3">
                {BLOATED.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-cream/60">
                    <span className="mt-2 h-1 w-3 shrink-0 rounded-full bg-cream/25" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-mauve/45 bg-surface p-7">
              <h3 className="text-sm font-semibold tracking-widest text-mauve uppercase">
                MyTasks
              </h3>
              <ul className="mt-5 space-y-3">
                {SIMPLE.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-cream/80">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-mauve"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section
          id="faq"
          eyebrow="FAQ"
          title="Questions people ask before signing up"
        >
          <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-surface">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:hidden">
                  <h3 className="text-base font-medium">{q}</h3>
                  <span
                    className="shrink-0 text-mauve transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-cream/60">{a}</p>
              </details>
            ))}
          </div>
        </Section>

        {/* Blog */}
        <Section
          eyebrow="From the blog"
          title="More on working without the clutter"
        >
          <a
            href="/blog/why-you-need-a-simple-to-do-app/"
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-surface p-7 transition-colors hover:border-mauve/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <BookOpen className="h-5 w-5 text-mauve" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold">
                Why You Need a Simple To-Do App to Reclaim Your Focus (And How to Choose
                One)
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-cream/60">
                Productivity fatigue, the cost of heavy software, and the four features
                that actually matter when you pick a distraction-free task tracker.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-mauve" aria-hidden="true" />
          </a>
        </Section>

        {/* Final CTA */}
        <section className="border-t border-white/10 px-5 py-24">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Try the minimalist approach today
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-cream/60">
              Give it one week and one list. If a simpler tool was never the problem,
              you have lost ten minutes. If it was, you have your focus back.
            </p>
            <div className="mt-8 flex justify-center">
              <Cta onSignup={onSignup} onLogin={onLogin} />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-mauve" aria-hidden="true" />
            <span className="text-sm font-semibold">MyTasks</span>
            <span className="text-sm text-cream/45">— a simple to-do app for focus</span>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="#features" className="text-sm text-cream/55 hover:text-cream">
              Features
            </a>
            <a href="#faq" className="text-sm text-cream/55 hover:text-cream">
              FAQ
            </a>
            <a href="/blog/" className="text-sm text-cream/55 hover:text-cream">
              Blog
            </a>
            <button
              type="button"
              onClick={onLogin}
              className="text-sm text-cream/55 hover:text-cream"
            >
              Log in
            </button>
          </nav>
        </div>
      </footer>
    </div>
  )
}
