"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export function LoginSuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shown = useRef(false);

  useEffect(() => {
    if (
      searchParams.get("login") === "success" &&
      !shown.current
    ) {
      shown.current = true;

      toast.success("Welcome back!");

      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  return null;
}