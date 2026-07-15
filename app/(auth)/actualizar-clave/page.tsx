import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export const metadata: Metadata = {
  title: "Actualizar contraseña — BookiDesk",
};

export default function ActualizarClavePage() {
  return <UpdatePasswordForm />;
}
