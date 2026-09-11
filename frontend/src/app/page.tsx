"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(localStorage.getItem("token") ? "/dashboard" : "/login");
  }, [router]);
  return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading...</div>;
}
