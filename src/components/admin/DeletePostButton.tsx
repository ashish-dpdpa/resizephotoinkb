"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/app/admin/actions";

export default function DeletePostButton({
  id,
  title,
  redirectTo,
  className = "font-semibold text-stamp hover:underline",
}: {
  id: string;
  title: string;
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={() => {
        if (!confirm(`Delete "${title || "this post"}"? This can't be undone.`)) return;
        start(async () => {
          const res = await deletePost(id);
          if (!res.ok) {
            alert(res.error);
            return;
          }
          if (redirectTo) router.replace(redirectTo);
          router.refresh();
        });
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
