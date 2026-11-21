"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { pieces } from "@/content/catalogue";
import { site } from "@/content/site";

type Fields = { name: string; email: string; phone: string; date: string; message: string; pieces: string[] };
type Errors = Partial<Record<"name" | "email", string>>;
type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "ready"; body: string } | { kind: "error"; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Private appointment request. With `site.appointmentEndpoint` set it posts
 * JSON there; without one it prepares the request as an email, and never
 * claims anything was sent that wasn't.
 */
export function AppointmentForm() {
  const id = useId();
  const [f, setF] = useState<Fields>({ name: "", email: "", phone: "", date: "", message: "", pieces: [] });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [copied, setCopied] = useState(false);

  // Arriving from a piece (/appointment/#eternal-solitaire) pre-selects it.
  useEffect(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    if (pieces.some((p) => p.slug === slug)) setF((x) => ({ ...x, pieces: [slug] }));
  }, []);

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => setF((x) => ({ ...x, [k]: v }));

  const validate = (): Errors => {
    const e: Errors = {};
    if (!f.name.trim()) e.name = "Enter your name.";
    if (!EMAIL.test(f.email.trim())) e.email = "Enter an email address, like name@example.com.";
    return e;
  };

  const body = () => {
    const names = pieces.filter((p) => f.pieces.includes(p.slug)).map((p) => p.name);
    return [
      `Name: ${f.name}`,
      `Email: ${f.email}`,
      f.phone && `Phone: ${f.phone}`,
      f.date && `Preferred date: ${f.date}`,
      names.length ? `Pieces: ${names.join(", ")}` : "",
      f.message && `\n${f.message}`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`${id}-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    if (!site.appointmentEndpoint) {
      setStatus({ kind: "ready", body: body() });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch(site.appointmentEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(f),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus({ kind: "sent" });
    } catch {
      setStatus({ kind: "error", message: `The request didn't go through. Try again, or write to ${site.contact.email}.` });
    }
  };

  if (status.kind === "sent") {
    return (
      <div role="status" className="border-t border-[var(--rule)] pt-8">
        <p className="t-title">Request sent.</p>
        <p className="t-body mt-4">We&rsquo;ll reply to {f.email} to confirm a time.</p>
      </div>
    );
  }

  if (status.kind === "ready") {
    const mailto = `mailto:${site.contact.email}?subject=${encodeURIComponent("Private appointment request")}&body=${encodeURIComponent(status.body)}`;
    return (
      <div role="status" className="border-t border-[var(--rule)] pt-8">
        <p className="t-title">Your request is ready to send.</p>
        <p className="t-body mt-4">
          Send it by email to <strong className="font-medium text-[var(--fg)]">{site.contact.email}</strong> and we&rsquo;ll reply to confirm a time.
        </p>
        <pre className="t-small mt-6 whitespace-pre-wrap border border-[var(--rule)] p-5 font-sans">{status.body}</pre>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <a href={mailto} className="btn">
            Open in your email app
          </a>
          <button
            type="button"
            className="link-line"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(status.body);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? "Copied" : "Copy request"}
          </button>
          <button type="button" className="link-line" onClick={() => setStatus({ kind: "idle" })}>
            Edit request
          </button>
        </div>
      </div>
    );
  }

  const field = (k: "name" | "email" | "phone" | "date", label: string, type: string, opts: { required?: boolean; autoComplete?: string } = {}) => (
    <div className="field">
      <label htmlFor={`${id}-${k}`}>
        {label}
        {opts.required ? "" : " (optional)"}
      </label>
      <input
        id={`${id}-${k}`}
        type={type}
        className="input"
        value={f[k]}
        autoComplete={opts.autoComplete}
        required={opts.required}
        aria-invalid={errors[k as keyof Errors] ? true : undefined}
        aria-describedby={errors[k as keyof Errors] ? `${id}-${k}-err` : undefined}
        onChange={(e) => set(k, e.target.value)}
      />
      {errors[k as keyof Errors] && (
        <p id={`${id}-${k}-err`} className="field-error">
          {errors[k as keyof Errors]}
        </p>
      )}
    </div>
  );

  return (
    <form noValidate onSubmit={submit} className="grid gap-8">
      <div className="grid gap-8 sm:grid-cols-2">
        {field("name", "Name", "text", { required: true, autoComplete: "name" })}
        {field("email", "Email", "email", { required: true, autoComplete: "email" })}
        {field("phone", "Phone", "tel", { autoComplete: "tel" })}
        {field("date", "Preferred date", "date")}
      </div>

      <fieldset>
        <legend className="mb-3 text-[0.8125rem] text-[var(--fg-soft)]">Pieces you&rsquo;d like to see (optional)</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {pieces.map((p) => {
            const on = f.pieces.includes(p.slug);
            return (
              <label key={p.slug} className="flex min-h-11 cursor-pointer items-center gap-3 border-b border-[var(--rule)] py-2">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => set("pieces", on ? f.pieces.filter((s) => s !== p.slug) : [...f.pieces, p.slug])}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                <span>{p.name}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor={`${id}-message`}>Anything we should know (optional)</label>
        <textarea id={`${id}-message`} className="input" value={f.message} onChange={(e) => set("message", e.target.value)} />
      </div>

      {status.kind === "error" && (
        <p role="alert" className="field-error">
          {status.message}
        </p>
      )}

      <div>
        <button type="submit" className="btn" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Sending request…" : "Request appointment"}
        </button>
      </div>
    </form>
  );
}
