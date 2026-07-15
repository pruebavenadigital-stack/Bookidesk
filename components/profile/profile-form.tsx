"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateProfile, type AuthState } from "@/lib/actions/auth";
import { AVATAR_COLORS } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const initialState: AuthState = {};

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function ProfileForm({
  initialName,
  initialColor,
  email,
}: {
  initialName: string;
  initialColor: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState,
  );
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    if (state.message) toast.success(state.message);
  }, [state.message]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback
            style={{ backgroundColor: color, color: "#fff" }}
            className="text-lg font-semibold"
          >
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="text-sm text-muted-foreground">{email}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_name">Nombre para mostrar</Label>
        <Input
          id="display_name"
          name="display_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={60}
        />
      </div>

      <div className="space-y-2">
        <Label>Color de avatar</Label>
        <input type="hidden" name="avatar_color" value={color} />
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={cn(
                "h-8 w-8 rounded-full ring-offset-2 ring-offset-background transition",
                color === c ? "ring-2 ring-ring" : "hover:scale-110",
              )}
            />
          ))}
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
