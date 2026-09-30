/** @type {import('tailwindcss').Config} */

// Colores de los textos enriquecidos (prose) atados a los tokens del tema,
// así funcionan igual en modo claro y oscuro.
const proseColors = {
  '--tw-prose-body': 'var(--foreground)',
  '--tw-prose-headings': 'var(--foreground)',
  '--tw-prose-lead': 'var(--muted-foreground)',
  '--tw-prose-links': 'var(--primary)',
  '--tw-prose-bold': 'var(--foreground)',
  '--tw-prose-counters': 'var(--muted-foreground)',
  '--tw-prose-bullets': 'var(--primary)',
  '--tw-prose-hr': 'var(--border)',
  '--tw-prose-quotes': 'var(--foreground)',
  '--tw-prose-quote-borders': 'var(--barda)',
  '--tw-prose-captions': 'var(--muted-foreground)',
  '--tw-prose-code': 'var(--foreground)',
  '--tw-prose-th-borders': 'var(--border)',
  '--tw-prose-td-borders': 'var(--border)',
  '--tw-prose-invert-body': 'var(--foreground)',
  '--tw-prose-invert-headings': 'var(--foreground)',
  '--tw-prose-invert-links': 'var(--primary)',
  '--tw-prose-invert-bold': 'var(--foreground)',
  '--tw-prose-invert-bullets': 'var(--primary)',
  '--tw-prose-invert-hr': 'var(--border)',
  '--tw-prose-invert-quote-borders': 'var(--barda)',
}

const config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: [
            {
              ...proseColors,
              maxWidth: '68ch',
              a: {
                fontWeight: '600',
                textUnderlineOffset: '0.2em',
              },
              h1: {
                fontWeight: '700',
                letterSpacing: '-0.02em',
                lineHeight: '1.1',
                marginBottom: '0.4em',
              },
              h2: { fontWeight: '700', letterSpacing: '-0.01em' },
              h3: { fontWeight: '700' },
              h4: { fontWeight: '700' },
            },
          ],
        },
        base: {
          css: [
            {
              h1: {
                fontSize: '2.25rem',
              },
              h2: {
                fontSize: '1.5rem',
              },
              h3: {
                fontSize: '1.25rem',
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '3.1rem',
              },
              h2: {
                fontSize: '1.875rem',
              },
              h3: {
                fontSize: '1.35rem',
              },
            },
          ],
        },
      },
    },
  },
}

export default config
