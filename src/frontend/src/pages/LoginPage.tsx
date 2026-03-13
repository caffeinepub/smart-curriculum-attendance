import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, GraduationCap, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveUserProfile, useUserProfile } from "../hooks/useQueries";

export default function LoginPage() {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const saveProfile = useSaveUserProfile();
  const [name, setName] = useState("");
  const [showNameForm, setShowNameForm] = useState(false);

  useEffect(() => {
    if (identity && !profileLoading) {
      if (profile === null || (profile && !profile.name)) {
        setShowNameForm(true);
      }
    }
  }, [identity, profile, profileLoading]);

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success(`Welcome, ${name.trim()}!`);
      setShowNameForm(false);
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: "oklch(0.38 0.11 185)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: "oklch(0.72 0.16 72)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: "oklch(0.38 0.11 185)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-teal shadow-lg mb-4"
          >
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">
            EduTrack
          </h1>
          <p className="text-muted-foreground mt-2 font-body text-sm">
            Class 10 · Smart Learning Dashboard
          </p>
        </div>

        {showNameForm ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="font-display text-xl">
                  Welcome aboard!
                </CardTitle>
                <CardDescription>
                  Tell us your name to personalize your experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Your Name</Label>
                  <Input
                    id="studentName"
                    data-ocid="auth.name_input"
                    placeholder="e.g. Arjun Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    className="text-base"
                    autoFocus
                  />
                </div>
                <Button
                  data-ocid="auth.register_button"
                  onClick={handleSaveName}
                  disabled={saveProfile.isPending}
                  className="w-full gradient-teal text-primary-foreground font-semibold"
                >
                  {saveProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="shadow-card border-border">
              <CardHeader className="text-center">
                <CardTitle className="font-display text-2xl">
                  Student Login
                </CardTitle>
                <CardDescription>
                  Sign in securely to access your curriculum, attendance, and
                  performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Feature preview */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: "📚", label: "Curriculum" },
                    { icon: "📅", label: "Attendance" },
                    { icon: "📊", label: "Performance" },
                    { icon: "✏️", label: "Tests" },
                  ].map((f) => (
                    <div
                      key={f.label}
                      className="flex items-center gap-2 p-3 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
                    >
                      <span>{f.icon}</span>
                      <span>{f.label}</span>
                    </div>
                  ))}
                </div>

                <Button
                  data-ocid="auth.login_button"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full gradient-teal text-primary-foreground font-semibold h-12 text-base"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-5 w-5" />
                      Sign In with Internet Identity
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Secure, decentralized authentication — no passwords needed
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 text-center text-xs text-muted-foreground"
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </motion.p>
    </div>
  );
}
