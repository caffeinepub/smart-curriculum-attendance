import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import LoginPage from "./pages/LoginPage";
import MainApp from "./pages/MainApp";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [page, setPage] = useState<
    "curriculum" | "attendance" | "performance" | "test"
  >("curriculum");

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full gradient-teal animate-pulse" />
          <p className="text-muted-foreground font-body text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <MainApp page={page} setPage={setPage} />
      <Toaster />
    </>
  );
}
