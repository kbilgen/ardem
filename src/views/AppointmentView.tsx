import { AppointmentForm } from "@/components/AppointmentForm";
import { site } from "@/content/site";

export function AppointmentView() {
  return (
    <section data-atmo="ivory" data-tone="light" aria-labelledby="appointment-title" className="bg-ivory px-6 pb-[16vh] pt-[20vh] md:px-10">
      <div className="mx-auto grid max-w-[1320px] gap-14 min-[900px]:grid-cols-12 min-[900px]:gap-x-10">
        <div className="min-[900px]:col-span-5">
          <h1 id="appointment-title" className="t-display">
            Book a Private Appointment
          </h1>
          <p className="t-sub mt-6">See any piece in person, in private.</p>
          <p className="t-body mt-8">
            Tell us which pieces you&rsquo;d like to see and when suits you. We&rsquo;ll reply to confirm a time.
          </p>
          <p className="t-small mt-8">
            Prefer to write? <a href={`mailto:${site.contact.email}`} className="link-line">{site.contact.email}</a>
          </p>
        </div>
        <div className="min-[900px]:col-span-6 min-[900px]:col-start-7">
          <AppointmentForm />
        </div>
      </div>
    </section>
  );
}
