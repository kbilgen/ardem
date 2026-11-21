import type { Metadata } from "next";
import { AppointmentView } from "@/views/AppointmentView";

export const metadata: Metadata = {
  title: "Book a Private Appointment",
  description: "Arrange a private viewing of ARDEM pieces.",
};

export default function AppointmentPage() {
  return <AppointmentView />;
}
