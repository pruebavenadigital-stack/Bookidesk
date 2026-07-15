import { redirect } from "next/navigation";

export default function Home() {
  // El proxy ya protege las rutas; si no hay sesión, /biblioteca redirige a /login.
  redirect("/biblioteca");
}
