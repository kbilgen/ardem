import Link from "next/link";
import { site } from "@/content/site";
import { collections } from "@/content/catalogue";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer data-tone="dark" className="relative border-t border-[var(--rule)] bg-obsidian px-6 pb-10 pt-20 md:px-10">
      <div className="mx-auto grid max-w-[1320px] gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href="/" className="wordmark text-[2.2rem]" aria-label="ARDEM, home">
            ARDEM
          </Link>
          <p className="t-sub mt-5 max-w-[22ch]">{site.closing}</p>
        </div>

        <nav aria-label="Collections" className="md:col-span-2">
          <h2 className="t-small mb-4 text-[var(--fg-faint)]">Collections</h2>
          <ul className="grid gap-1">
            {collections.map((c) => (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}/`} className="link-line">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <h2 className="t-small mb-4 text-[var(--fg-faint)]">Private appointments</h2>
          <p className="t-small max-w-[30ch]">See any piece in person, or ask a question about one.</p>
          <ul className="mt-3 grid gap-1">
            <li>
              <Link href="/appointment/" className="link-line">
                Book a Private Appointment
              </Link>
            </li>
            <li>
              <a href={`mailto:${site.contact.email}`} className="link-line">
                {site.contact.email}
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className="t-small mb-4 text-[var(--fg-faint)]">Follow</h2>
          <ul className="grid gap-1">
            {site.social.map((s) => (
              <li key={s.label}>
                <a href={s.href} className="link-line" target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-20 flex max-w-[1320px] flex-wrap justify-between gap-4 border-t border-[var(--rule)] pt-6 text-xs text-[var(--fg-faint)]">
        <p>© {year} ARDEM. All rights reserved.</p>
      </div>
    </footer>
  );
}
