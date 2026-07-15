"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const initialState: AuthState = {};

export function ResetRequestForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {state.message ? (
          <p className="text-sm text-muted-foreground">{state.message}</p>
        ) : (
          <form action={formAction} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="tu@correo.com"
              />
            </div>
            {state.error ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {state.error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Enviando…" : "Enviar enlace"}
            </Button>
          </form>
        )}
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
