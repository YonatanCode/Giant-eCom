'use client'

import { useEffect, useState } from 'react'
import type { EditorData } from './model'
import { loadOverrides, saveOverrides } from './overrides'

// Store page editor (docs/store-editor). "Save" writes to localStorage; the store page reads it back.

const INPUT =
  'w-full box-border rounded-lg border border-base-border bg-white px-s py-3 font-body text-body-m text-base-text outline-none focus:border-action-surface-accent focus:ring-[3px] focus:ring-action-surface-accent/20'
const LABEL =
  'font-heading text-action-s font-bold uppercase tracking-wider text-base-text-muted'
const CARD = 'flex flex-col rounded-[14px] border border-base-border bg-white'
const HINT = 'm-0 font-body text-body-s text-base-text-muted'
const H1 = 'm-0 text-display-s uppercase'
const H2 = 'm-0 font-heading text-heading-m font-bold'
const GHOST_BTN =
  'flex items-center justify-center gap-xs rounded-[14px] border-[1.5px] border-dashed border-base-border bg-base-surface-subtle p-sm font-action text-action-m uppercase text-base-text-muted hover:border-action-surface-accent hover:bg-base-surface-subtle hover:text-action-text-hover'
const ICON_BTN =
  'size-[34px] rounded-lg border border-base-border bg-white font-body text-body-l text-base-text-muted hover:border-feedback-icon-error/40 hover:bg-feedback-surface-error hover:text-feedback-text-error'

const NAV_GROUPS = [
  {
    title: 'Your store',
    items: [
      { id: 'header', label: 'Hero & contact' },
      { id: 'hours', label: 'Opening hours' },
      { id: 'about', label: 'About your store' },
      { id: 'gallery', label: 'Photo gallery' },
      { id: 'team', label: 'Meet the team' },
      { id: 'faq', label: 'FAQ' },
    ],
  },
  { title: 'Campaigns', items: [{ id: 'promo', label: 'Promo banner' }] },
]

const TITLES: Record<string, string> = {
  header: 'Hero & contact',
  hours: 'Opening hours',
  about: 'About your store',
  gallery: 'Photo gallery',
  team: 'Meet the team',
  faq: 'FAQ',
  promo: 'Promo banner',
}

const INTRO_LIMIT = 220
const ABOUT_LIMIT = 1600

function Header({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-xs">
      <h1 className={H1}>{title}</h1>
      <p className="m-0 max-w-[60ch] font-body text-body-m text-pretty text-base-text-muted">
        {desc}
      </p>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-xs">
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  )
}

export default function StoreEditor({ data }: { data: EditorData }) {
  const [d, setD] = useState(data)
  const [active, setActive] = useState('header')
  const [dirty, setDirty] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)

  // Reopen where you left off. After hydration only — no localStorage during SSR/export.
  useEffect(() => {
    const saved = loadOverrides(data.slug)
    if (saved) setD(saved)
  }, [data.slug])

  const set = <K extends keyof EditorData>(key: K, value: EditorData[K]) => {
    setDirty(true)
    setD((prev) => ({ ...prev, [key]: value }))
  }
  // Row-level edit inside one of the list fields (hours, stats, gallery, team, faq).
  const setIn = <K extends 'hours' | 'stats' | 'gallery' | 'team' | 'faq' | 'services'>(
    key: K,
    index: number,
    field: string,
    value: unknown,
  ) => {
    setDirty(true)
    setD((prev) => ({
      ...prev,
      [key]: (prev[key] as Record<string, unknown>[]).map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      ),
    }))
  }
  const removeIn = (key: 'gallery' | 'team' | 'faq', index: number) => {
    setDirty(true)
    setD((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }))
  }
  const field = (key: keyof EditorData) => (e: { target: { value: string } }) =>
    set(key, e.target.value as EditorData[typeof key])

  const locked = d.locked.find((s) => s.id === active)
  const pageTitle = locked ? locked.title : (TITLES[active] ?? 'Store page')
  const storeHref = `/store/${d.slug}`

  return (
    <div className="grid min-h-screen w-full grid-cols-[272px_1fr] bg-base-surface-subtle font-body text-base-text">
      <aside className="sticky top-0 flex h-screen flex-col self-start bg-base-surface-on-light">
        <div className="flex flex-col gap-4 border-b border-white/10 px-6 pt-m pb-m">
          <img
            src="/images/giant-logo.svg"
            alt="Giant"
            className="h-[19px] w-auto self-start brightness-0 invert"
          />
          <div className="flex flex-col gap-xxxs">
            <span className="font-heading text-action-s font-bold uppercase tracking-widest text-base-text-on-dark/50">
              Store page editor
            </span>
            <span className="font-heading text-heading-s font-bold text-white">
              {d.storeName}
            </span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-m overflow-auto px-s py-5">
          {[
            ...NAV_GROUPS,
            {
              title: 'Set by Giant',
              items: d.locked.map((s) => ({ id: s.id, label: s.label, giant: true })),
            },
          ].map((group) => (
            <div key={group.title} className="flex flex-col gap-xxxs">
              <span className="px-xs pb-xs font-heading text-action-s font-bold uppercase tracking-widest text-base-text-on-dark">
                {group.title}
              </span>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-s py-xs text-left font-body text-body-m font-medium ${
                    item.id === active
                      ? 'bg-action-surface-accent text-white'
                      : 'text-base-text-on-dark/70 hover:bg-white/10'
                  }`}
                >
                  <span>{item.label}</span>
                  {'giant' in item && item.giant ? (
                    <span className="rounded border border-white/25 px-xs py-xxs font-heading text-action-s font-bold tracking-widest text-base-text-on-dark/70">
                      GIANT
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-s border-t border-white/10 px-5 py-4">
          <img src={d.owner.avatar} alt="" className="size-[34px] rounded-full object-cover" />
          <div className="flex min-w-0 flex-col gap-px">
            <span className="font-body text-body-s font-medium text-white">
              {d.owner.name}
            </span>
            <span className="font-body text-body-s text-base-text-on-dark/50">
              {d.owner.role}
            </span>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-[5] flex items-center justify-between gap-6 border-b border-base-border bg-white px-11 py-5">
          <div className="flex flex-col gap-1">
            <span className="font-heading text-heading-m font-bold">
              {pageTitle}
            </span>
            <span className="font-mono text-body-s text-base-text-muted">
              giant-bicycles.com{storeHref}
            </span>
          </div>
          <div className="flex items-center gap-xs">
            <a
              href={storeHref}
              className="rounded-lg border border-base-border bg-white px-4 py-3 font-action text-action-m uppercase text-base-text hover:bg-base-surface-subtle"
            >
              View my page
            </a>
            <button
              type="button"
              onClick={() => {
                saveOverrides(d)
                setDirty(false)
              }}
              className={`rounded-lg px-5 py-s font-action text-action-m uppercase ${
                dirty ? 'bg-action-surface-accent text-white' : 'bg-action-surface-disabled text-action-text-disabled-high-contrast'
              }`}
            >
              {dirty ? 'Save changes' : 'Saved'}
            </button>
          </div>
        </header>

        <div className="flex flex-1 justify-center px-11 pt-9 pb-20">
          <div className="flex w-full max-w-[780px] flex-col gap-5">
            {active === 'header' ? (
              <div className="flex flex-col gap-5">
                <Header
                  title="Hero & contact"
                  desc="The top of your store page: the photo people see first, your name, and how they reach you."
                />

                <section className={`${CARD} gap-m px-7 py-m`}>
                  <Field label="Hero photo">
                    <div className="relative overflow-hidden rounded-[10px] border border-base-border">
                      <img src={d.hero} alt="" className="block h-[196px] w-full object-cover" />
                      <div className="absolute right-3 bottom-3 flex gap-2">
                        <button
                          type="button"
                          className="rounded-[7px] bg-white px-s py-xs font-action text-action-m uppercase text-base-text shadow-[0_1px_4px_rgba(0,0,0,.2)]"
                        >
                          Replace photo
                        </button>
                        <button
                          type="button"
                          className="rounded-[7px] bg-base-surface-on-light/70 px-s py-xs font-action text-action-m uppercase text-white"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className={HINT}>
                      Landscape photo of your storefront or showroom. At least 1920 × 600 pixels,
                      JPG or PNG.
                    </p>
                  </Field>

                  <Field label="Store name">
                    <input
                      type="text"
                      value={d.storeName}
                      onChange={field('storeName')}
                      className={INPUT}
                    />
                  </Field>

                  <Field label="Welcome line">
                    <textarea
                      rows={3}
                      value={d.intro}
                      onChange={field('intro')}
                      className={`${INPUT}`}
                    />
                    <div className="flex justify-between gap-4">
                      <p className={HINT}>
                        One or two sentences, right under the header. Say what makes your shop yours.
                      </p>
                      <span className="whitespace-nowrap font-mono text-body-s text-grey-30">
                        {d.intro.length} / {INTRO_LIMIT}
                      </span>
                    </div>
                  </Field>
                </section>

                <section className={`${CARD} gap-m px-7 py-m`}>
                  <h2 className={H2}>How people reach you</h2>
                  <div className="grid grid-cols-[1.4fr_1fr] gap-sm">
                    <Field label="Street and number">
                      <input type="text" value={d.street} onChange={field('street')} className={INPUT} />
                    </Field>
                    <Field label="Town">
                      <input type="text" value={d.city} onChange={field('city')} className={INPUT} />
                    </Field>
                    <Field label="Phone">
                      <input type="tel" value={d.phone} onChange={field('phone')} className={INPUT} />
                    </Field>
                    <Field label="Email">
                      <input type="email" value={d.email} onChange={field('email')} className={INPUT} />
                    </Field>
                  </div>
                  <div className="flex items-start gap-3 rounded-[9px] bg-base-surface-subtle px-4 py-s">
                    <span className="mt-xs size-[7px] flex-none rounded-full bg-action-surface-accent" />
                    <p className="m-0 font-body text-body-s text-base-text-muted">
                      Your address also sets the map pin and the &ldquo;Get directions&rdquo; button
                      further down the page.
                    </p>
                  </div>
                </section>

                <section className={`${CARD} gap-4 px-7 py-m`}>
                  <div className="flex flex-col gap-xxs">
                    <h2 className={H2}>What you offer</h2>
                    <p className="m-0 font-body text-body-m text-base-text-muted">
                      Tap to switch a service on or off. These appear as the list beside your address.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-xs">
                    {d.services.map((chip, i) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => setIn('services', i, 'on', !chip.on)}
                        className={`rounded-full border px-sm py-s font-action text-action-s uppercase ${
                          chip.on
                            ? 'border-base-border-dark bg-base-surface-on-light text-white'
                            : 'border-base-border bg-white text-base-text-muted'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}

            {active === 'hours' ? (
              <div className="flex flex-col gap-5">
                <Header
                  title="Opening hours"
                  desc={'These hours drive the "Open now" line at the top of your page, so keep them current.'}
                />
                <section className={`${CARD} px-7 pt-3 pb-m`}>
                  {d.hours.map((row, i) => (
                    <div
                      key={row.day}
                      className="grid grid-cols-[118px_1fr_18px_1fr_130px] items-center gap-3 border-b border-base-border-divider py-sm"
                    >
                      <span className="font-body text-body-m font-semibold">
                        {row.day}
                      </span>
                      <input
                        type="text"
                        value={row.open}
                        disabled={row.closed}
                        placeholder="Closed"
                        onChange={(e) => setIn('hours', i, 'open', e.target.value)}
                        className={`${INPUT} py-s ${row.closed ? 'bg-base-surface-subtle text-grey-30' : ''}`}
                      />
                      <span className="text-center font-body text-body-m text-grey-30">–</span>
                      <input
                        type="text"
                        value={row.close}
                        disabled={row.closed}
                        placeholder="Closed"
                        onChange={(e) => setIn('hours', i, 'close', e.target.value)}
                        className={`${INPUT} py-s ${row.closed ? 'bg-base-surface-subtle text-grey-30' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setIn('hours', i, 'closed', !row.closed)}
                        className={`flex items-center justify-self-end gap-xs font-action text-action-m uppercase ${
                          row.closed ? 'text-base-text' : 'text-base-text-muted'
                        }`}
                      >
                        <span
                          className={`box-border inline-flex h-[22px] w-[38px] items-center rounded-full p-xxxs transition-colors ${
                            row.closed ? 'justify-end bg-action-surface-accent' : 'justify-start bg-base-border'
                          }`}
                        >
                          <span className="block size-[18px] rounded-full bg-white" />
                        </span>
                        <span>Closed</span>
                      </button>
                    </div>
                  ))}
                  <div className="pt-m">
                    <Field label="Holiday or exception note">
                      <input
                        type="text"
                        value={d.hoursNote}
                        onChange={field('hoursNote')}
                        placeholder="e.g. Closed 24 December from 16:00"
                        className={INPUT}
                      />
                      <p className={HINT}>
                        Shown as a short line above your hours. Leave empty if there is nothing to
                        say.
                      </p>
                    </Field>
                  </div>
                </section>
              </div>
            ) : null}

            {active === 'promo' ? (
              <div className="flex flex-col gap-5">
                <Header
                  title="Promo banner"
                  desc="One wide banner in the middle of your page. Use it for a campaign, an event, or a bike you want to move."
                />
                <section className={`${CARD} gap-m px-7 py-m`}>
                  <Field label="Banner image">
                    {d.promoImage ? (
                      <div className="relative overflow-hidden rounded-[10px] border border-base-border">
                        <img src={d.promoImage} alt="" className="block h-[180px] w-full object-cover" />
                        <div className="absolute right-3 bottom-3">
                          <button
                            type="button"
                            className="rounded-[7px] bg-white px-s py-xs font-action text-action-m uppercase text-base-text shadow-[0_1px_4px_rgba(0,0,0,.2)]"
                          >
                            Replace image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={`${GHOST_BTN} h-[180px] flex-col rounded-[10px]`}
                      >
                        <span className="font-body text-body-l">+</span>
                        <span>Add a banner image</span>
                      </button>
                    )}
                    <p className={HINT}>
                      Pick from the Giant campaign library, or upload your own at 2400 × 900 pixels.
                    </p>
                  </Field>
                  <Field label="Headline">
                    <input
                      type="text"
                      value={d.promoTitle}
                      onChange={field('promoTitle')}
                      className={`${INPUT} font-heading text-heading-m font-semibold`}
                    />
                  </Field>
                  <Field label="Supporting line">
                    <input type="text" value={d.promoSub} onChange={field('promoSub')} className={INPUT} />
                  </Field>
                  <div className="grid grid-cols-2 gap-sm">
                    <Field label="Button label">
                      <input type="text" value={d.promoBtn} onChange={field('promoBtn')} className={INPUT} />
                    </Field>
                    <Field label="Button link">
                      <input
                        type="text"
                        value={d.promoUrl}
                        onChange={field('promoUrl')}
                        placeholder="https://"
                        className={`${INPUT} font-mono text-body-m`}
                      />
                    </Field>
                  </div>
                </section>
              </div>
            ) : null}

            {active === 'about' ? (
              <div className="flex flex-col gap-5">
                <Header
                  title="About your store"
                  desc="The long read. Write it the way you would tell it to someone standing in the shop."
                />
                <section className={`${CARD} gap-m px-7 py-m`}>
                  <Field label="Section heading">
                    <input
                      type="text"
                      value={d.aboutHeading}
                      onChange={field('aboutHeading')}
                      className={INPUT}
                    />
                  </Field>
                  <Field label="Your story">
                    <textarea
                      rows={10}
                      value={d.aboutBody}
                      onChange={field('aboutBody')}
                      className={`${INPUT} px-sm py-s`}
                    />
                    <div className="flex justify-between gap-4">
                      <p className={HINT}>Leave a blank line between paragraphs.</p>
                      <span className="whitespace-nowrap font-mono text-body-s text-grey-30">
                        {d.aboutBody.length} / {ABOUT_LIMIT}
                      </span>
                    </div>
                  </Field>
                </section>

                <section className={`${CARD} gap-sm px-7 py-m`}>
                  <div className="flex flex-col gap-xxs">
                    <h2 className={H2}>Three numbers about the shop</h2>
                    <p className="m-0 font-body text-body-m text-base-text-muted">
                      Shown as a row of figures beside your story.
                    </p>
                  </div>
                  <div className="flex flex-col gap-s">
                    {d.stats.map((stat, i) => (
                      <div key={i} className="grid grid-cols-[1fr_190px] items-center gap-3">
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => setIn('stats', i, 'label', e.target.value)}
                          className={INPUT}
                        />
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => setIn('stats', i, 'value', e.target.value)}
                          className={`${INPUT} font-semibold`}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}

            {active === 'gallery' ? (
              <div className="flex flex-col gap-5">
                <Header
                  title="Photo gallery"
                  desc="Up to eight photos of the shop, in the order shown here. Drag a photo to move it."
                />
                <section className={`${CARD} gap-5 px-7 py-m`}>
                  <div className="grid grid-cols-3 gap-4">
                    {d.gallery.map((tile, i) => (
                      <div key={i} className="flex flex-col gap-xs">
                        <div className="relative overflow-hidden rounded-[10px] border border-base-border bg-base-surface-subtle">
                          <img src={tile.src} alt="" className="block h-[126px] w-full object-cover" />
                          <span className="absolute top-2 left-2 rounded-[5px] bg-base-surface-on-light/70 px-xs py-xxs font-mono text-body-s font-semibold text-white">
                            {i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeIn('gallery', i)}
                            aria-label="Remove photo"
                            className="absolute top-2 right-2 size-[26px] rounded-md bg-base-surface-on-light/70 font-action text-action-m uppercase text-white"
                          >
                            ×
                          </button>
                        </div>
                        <input
                          type="text"
                          value={tile.caption}
                          onChange={(e) => setIn('gallery', i, 'caption', e.target.value)}
                          placeholder="Add a caption"
                          className={`${INPUT} rounded-[7px] px-s py-xs text-body-s`}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setDirty(true)
                        setD((p) => ({
                          ...p,
                          gallery: [...p.gallery, { src: p.gallery[0]?.src ?? p.hero, caption: '' }],
                        }))
                      }}
                      className={`${GHOST_BTN} h-[126px] flex-col gap-xs rounded-[10px] p-0 text-body-s`}
                    >
                      <span className="font-body text-body-l">+</span>
                      <span>Add photo</span>
                    </button>
                  </div>
                  <p className={HINT}>
                    Landscape photos work best. Avoid photos with people whose permission you do not
                    have.
                  </p>
                </section>
              </div>
            ) : null}

            {active === 'team' ? (
              <div className="flex flex-col gap-5">
                <Header
                  title="Meet the team"
                  desc="The people customers will meet. A short, human line about each one goes further than a job title."
                />
                {d.team.map((member, i) => (
                  <section
                    key={i}
                    className={`${CARD} grid grid-cols-[82px_1fr] items-start gap-5 px-6 py-m`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={member.avatar}
                        alt=""
                        className="size-[72px] rounded-full bg-base-surface-subtle object-cover"
                      />
                      <button type="button" className="font-action text-action-m uppercase text-action-text-link">
                        Change
                      </button>
                    </div>
                    <div className="flex min-w-0 flex-col gap-s">
                      <div className="grid grid-cols-[1fr_1fr_34px] items-center gap-3">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => setIn('team', i, 'name', e.target.value)}
                          placeholder="Full name"
                          className={`${INPUT} py-s font-semibold`}
                        />
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => setIn('team', i, 'role', e.target.value)}
                          placeholder="Role in the shop"
                          className={`${INPUT} py-s`}
                        />
                        <button
                          type="button"
                          onClick={() => removeIn('team', i)}
                          title="Remove"
                          className={ICON_BTN}
                        >
                          ×
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={member.bio}
                        onChange={(e) => setIn('team', i, 'bio', e.target.value)}
                        placeholder="One or two sentences"
                        className={`${INPUT} text-body-m`}
                      />
                    </div>
                  </section>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setDirty(true)
                    setD((p) => ({
                      ...p,
                      team: [
                        ...p.team,
                        { avatar: '/images/employees/placeholder-1.svg', name: '', role: '', bio: '' },
                      ],
                    }))
                  }}
                  className={GHOST_BTN}
                >
                  <span className="font-body text-body-l">+</span>
                  <span>Add a team member</span>
                </button>
              </div>
            ) : null}

            {active === 'faq' ? (
              <div className="flex flex-col gap-5">
                <Header
                  title="Frequently asked questions"
                  desc="The questions you answer on the phone every week. Answering them here saves you the call."
                />
                <section className={`${CARD} py-2`}>
                  {d.faq.map((item, i) => {
                    const open = openFaq === i
                    return (
                      <div
                        key={i}
                        className={`flex flex-col border-b border-base-border-divider ${open ? 'bg-base-surface-subtle' : ''}`}
                      >
                        <div className="grid grid-cols-[1fr_34px_34px] items-center gap-xs px-6">
                          <input
                            type="text"
                            value={item.q}
                            onChange={(e) => setIn('faq', i, 'q', e.target.value)}
                            placeholder="Question"
                            className="w-full border-none bg-transparent py-s font-body text-body-m font-semibold text-base-text outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeIn('faq', i)}
                            title="Remove"
                            className={ICON_BTN}
                          >
                            ×
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenFaq(open ? -1 : i)}
                            aria-label={open ? 'Collapse answer' : 'Expand answer'}
                            className="size-[34px] rounded-lg border border-base-border bg-white font-body text-body-l font-medium text-base-text"
                          >
                            {open ? '–' : '+'}
                          </button>
                        </div>
                        {open ? (
                          <div className="px-6 pt-1 pb-sm">
                            <textarea
                              rows={3}
                              value={item.a}
                              onChange={(e) => setIn('faq', i, 'a', e.target.value)}
                              placeholder="Your answer"
                              className={`${INPUT} bg-base-surface-subtle text-body-m`}
                            />
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                  <div className="px-6 pt-4 pb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDirty(true)
                        setD((p) => ({ ...p, faq: [...p.faq, { q: '', a: '' }] }))
                        setOpenFaq(d.faq.length)
                      }}
                      className="flex items-center gap-xs rounded-lg border border-base-border bg-white px-4 py-3 font-action text-action-m uppercase text-base-text hover:border-action-surface-accent hover:text-action-text-hover"
                    >
                      <span className="font-body text-body-l">+</span>
                      <span>Add a question</span>
                    </button>
                  </div>
                </section>
              </div>
            ) : null}

            {locked ? (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-xs">
                  <div className="flex items-center gap-3">
                    <h1 className={H1}>{locked.title}</h1>
                    <span className="rounded-[5px] border border-base-border bg-white px-2 py-xxs font-heading text-action-s font-bold tracking-widest text-base-text-muted">
                      MANAGED BY GIANT
                    </span>
                  </div>
                  <p className="m-0 max-w-[60ch] font-body text-body-m text-pretty text-base-text-muted">
                    {locked.desc}
                  </p>
                </div>

                <section className={`${CARD} px-7 py-2`}>
                  {locked.rows.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[210px_1fr] items-start gap-sm border-b border-base-border-divider py-sm"
                    >
                      <span className="font-body text-body-s font-semibold text-base-text-muted">
                        {row.label}
                      </span>
                      <span className="font-body text-body-m text-pretty text-base-text-muted">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </section>

                <div className={`${CARD} flex-row items-center justify-between gap-5 px-6 py-5`}>
                  <p className="m-0 max-w-[52ch] font-body text-body-m text-pretty text-base-text-muted">
                    Something wrong here? Send it to your Giant account manager and they will update
                    it for every store at once.
                  </p>
                  <button
                    type="button"
                    className="rounded-lg border border-base-border-dark bg-white px-sm py-s font-action text-action-m uppercase whitespace-nowrap text-base-text hover:bg-base-surface-on-light hover:text-white"
                  >
                    Request a change
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
