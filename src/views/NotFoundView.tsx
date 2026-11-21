import Link from "next/link";

export function NotFoundView() {
  return (
    <section data-atmo="obsidian" data-tone="dark" aria-labelledby="nf-title" className="flex min-h-[80svh] items-center px-6 pt-[16vh] md:px-10">
      <div className="mx-auto w-full max-w-[1320px]">
        <h1 id="nf-title" className="t-display max-w-[14ch]">
          This page isn&rsquo;t here.
        </h1>
        <p className="t-body mt-6">The link may be out of date. The collections are a good place to start again.</p>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          <Link href="/collections/" className="btn">
            Explore the Collections
          </Link>
          <Link href="/" className="link-line">
            Return to the beginning
          </Link>
        </div>
      </div>
    </section>
  );
}
