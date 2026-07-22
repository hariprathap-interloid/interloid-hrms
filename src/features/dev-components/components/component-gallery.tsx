import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-h2 text-foreground">{title}</h2>
      {children}
    </section>
  )
}

export function ComponentGallery() {
  return (
    <div className="flex flex-col gap-12">
      {/* ---- Button ---- */}
      <Section title="Button">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Section>

      {/* ---- Badge ---- */}
      <Section title="Badge">
        <div className="flex flex-wrap items-center gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </Section>

      {/* ---- Card ---- */}
      <Section title="Card">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Supporting description text.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Body content sits on the card surface and inherits card-foreground.
            </p>
          </CardContent>
          <CardFooter>
            <Button>Action</Button>
          </CardFooter>
        </Card>
      </Section>

      {/* ---- Input + Label ---- */}
      <Section title="Input + Label">
        <div className="flex max-w-sm flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="name@interloid.com" />
        </div>
      </Section>

      {/* ---- Checkbox ---- */}
      <Section title="Checkbox">
        <div className="flex items-center gap-2">
          <Checkbox id="terms" defaultChecked />
          <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>
      </Section>

      {/* ---- Select ---- */}
      <Section title="Select">
        <Select>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select a department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="people">People Ops</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
          </SelectContent>
        </Select>
      </Section>

      {/* ---- Non-shadcn focusables (verifies the global outline-ring fallback) ---- */}
      <Section title="Non-shadcn focusables">
        <p className="text-small text-muted-foreground">
          These rely on the UA focus outline coloured by the global{' '}
          <code className="text-mono">* {'{ outline-ring }'}</code> rule — no component ring of
          their own. Tab to them to confirm the fallback is visible.
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <a href="#dev-components" className="text-primary underline underline-offset-4">
            Plain anchor link
          </a>
          <div
            tabIndex={0}
            role="button"
            className="bg-card text-card-foreground ring-foreground/10 rounded-lg px-4 py-2 text-sm ring-1"
          >
            Custom focusable div (tabIndex 0)
          </div>
        </div>
      </Section>
    </div>
  )
}
