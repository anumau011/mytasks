import { useEffect } from 'react'

// Per-view <head> management — the job react-helmet does, using React 19's
// built-in metadata hoisting instead. Any <title>/<meta>/<link> rendered from a
// component is lifted into <head> by React itself, so there is no provider to
// wrap the tree in and no dependency that has to keep pace with React releases.
//
// index.html still carries the same tags statically, because crawlers that
// don't run JavaScript only ever see that file. Those copies are marked
// data-seo-default and dropped the first time this component mounts, so the
// rendered document ends up with exactly one of each.

export const SITE_URL = 'https://myowntask.onrender.com'
export const SITE_NAME = 'MyTasks'

const DEFAULT_TITLE = 'MyTasks — A Simple To-Do App Built for Focus'
const DEFAULT_DESCRIPTION =
  'MyTasks is a simple to-do app and minimalist task manager for people tired of bloated project tools. Capture a task in one keystroke, track your day, and sync across devices. Free to use.'

let defaultsRemoved = false

function removeStaticDefaults() {
  if (defaultsRemoved) return
  defaultsRemoved = true
  document.head
    .querySelectorAll('[data-seo-default]')
    .forEach((node) => node.remove())
}

export default function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  // Screens behind the login — the app, the reset form — have nothing for an
  // index to say about them, and their URLs carry single-use tokens.
  noindex = false,
  image = `${SITE_URL}/og.svg`,
}) {
  useEffect(removeStaticDefaults, [])

  const url = `${SITE_URL}${path}`

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta
        name="robots"
        content={
          noindex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        }
      />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  )
}
