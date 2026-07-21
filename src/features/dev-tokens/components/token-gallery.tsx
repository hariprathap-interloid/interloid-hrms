import type { ReactNode } from 'react'
import { colorGroups, radiusTokens, shadowTokens, typeTokens, unmappedTokens } from '../tokens'
import { BoxSwatch } from './box-swatch'
import { ColorSwatch } from './color-swatch'
import { TypeSpecimen } from './type-specimen'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-h2 text-foreground">{title}</h2>
      {children}
    </section>
  )
}

export function TokenGallery() {
  return (
    <div className="flex flex-col gap-12">
      {/* ---- Colors ---- */}
      {colorGroups.map((group) => (
        <Section key={group.title} title={group.title}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {group.tokens.map((token) => (
              <ColorSwatch key={token.varName + token.label} {...token} />
            ))}
          </div>
        </Section>
      ))}

      {/* ---- Type ---- */}
      <Section title="Type scale">
        <div className="bg-card border-border flex flex-col gap-4 rounded-lg border p-6">
          {typeTokens.map((token) => (
            <TypeSpecimen key={token.className} {...token} />
          ))}
        </div>
      </Section>

      {/* ---- Radius ---- */}
      <Section title="Radius">
        <div className="flex flex-wrap gap-6">
          {radiusTokens.map((token) => (
            <BoxSwatch key={token.varName} variant="radius" {...token} />
          ))}
        </div>
      </Section>

      {/* ---- Shadow ---- */}
      <Section title="Elevation">
        <div className="flex flex-wrap gap-8 py-2">
          {shadowTokens.map((token) => (
            <BoxSwatch key={token.varName} variant="shadow" {...token} />
          ))}
        </div>
      </Section>

      {/* ---- Unmapped / partial ---- */}
      <Section title="Unmapped or partial tokens">
        <div className="border-warning bg-warning-subtle text-warning-subtle-foreground flex flex-col gap-4 rounded-lg border-l-4 p-5">
          <p className="text-small">
            These tokens from the design project have no clean Tailwind utility mapping in{' '}
            <code className="text-mono">src/styles/index.css</code>.
          </p>
          <ul className="flex flex-col gap-3">
            {unmappedTokens.map((item) => (
              <li key={item.token} className="flex flex-col gap-1.5">
                <code className="text-mono text-foreground font-medium">{item.token}</code>
                <span className="text-small text-muted-foreground">{item.reason}</span>
                {item.previewVar ? (
                  <div
                    className="border-border mt-1 h-8 w-40 rounded-md border"
                    style={{ background: `var(${item.previewVar})` }}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </div>
  )
}
