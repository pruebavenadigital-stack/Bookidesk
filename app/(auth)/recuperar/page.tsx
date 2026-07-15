import type { Metadata } from "next";
import { ResetRequestForm } from "@/components/auth/reset-request-form";

export const metadata: Metadata = { title: "Recuperar contraseña — BookiDesk" };

export default function RecuperarPage() {
  return <ResetRequestForm />;
}
