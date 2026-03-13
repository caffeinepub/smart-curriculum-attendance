import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GraduationCap, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import BottomNav from "../components/BottomNav";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserProfile } from "../hooks/useQueries";
import AttendancePage from "./AttendancePage";
import CurriculumPage from "./CurriculumPage";
import PerformancePage from "./PerformancePage";
import TestPage from "./TestPage";

type Page = "curriculum" | "attendance" | "performance" | "test";

interface MainAppProps {
  page: Page;
  setPage: (p: Page) => void;
}

export default function MainApp({ page, setPage }: MainAppProps) {
  const { clear, identity } = useInternetIdentity();
  const { data: profile } = useUserProfile();

  const name =
    profile?.name ||
    identity?.getPrincipal().toString().slice(0, 8) ||
    "Student";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const pageComponents: Record<Page, React.ReactNode> = {
    curriculum: <CurriculumPage />,
    attendance: <AttendancePage />,
    performance: <PerformancePage />,
    test: <TestPage />,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="gradient-teal text-primary-foreground px-4 pt-safe-top pb-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-none">
                EduTrack
              </h1>
              <p className="text-primary-foreground/70 text-xs mt-0.5">
                Class 10
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto p-1 hover:bg-white/10 rounded-full"
                data-ocid="nav.dropdown_menu"
              >
                <Avatar className="w-9 h-9 border-2 border-white/30">
                  <AvatarFallback className="gradient-amber text-accent-foreground text-sm font-bold font-display">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 border-b border-border">
                <p className="font-semibold text-sm truncate">{name}</p>
                <p className="text-xs text-muted-foreground">
                  Class 10 Student
                </p>
              </div>
              <DropdownMenuItem
                onClick={clear}
                className="text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            {pageComponents[page]}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}
