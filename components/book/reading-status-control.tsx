"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setReadingStatus } from "@/lib/actions/books";
import { READING_STATUS_LABEL, type ReadingStatus } from "@/lib/supabase/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ReadingStatusControl({
  bookId,
  status,
}: {
  bookId: string;
  status: ReadingStatus;
}) {
  const [value, setValue] = useState<ReadingStatus>(status);
  const [pending, startTransition] = useTransition();

  function change(next: ReadingStatus) {
    const prev = value;
    setValue(next);
    startTransition(async () => {
      const res = await setReadingStatus(bookId, next);
      if (res.error) {
        setValue(prev);
        toast.error(res.error);
      } else {
        toast.success("Estado actualizado.");
      }
    });
  }

  return (
    <Select value={value} onValueChange={(v) => change(v as ReadingStatus)} disabled={pending}>
      <SelectTrigger className="w-full sm:w-56" aria-label="Estado de lectura">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(READING_STATUS_LABEL) as ReadingStatus[]).map((s) => (
          <SelectItem key={s} value={s}>
            {READING_STATUS_LABEL[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
