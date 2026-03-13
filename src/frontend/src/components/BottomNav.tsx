import { BarChart3, BookOpen, CalendarCheck, PenLine } from "lucide-react";
import { motion } from "motion/react";

type Page = "curriculum" | "attendance" | "performance" | "test";

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: "curriculum", label: "Curriculum", icon: BookOpen },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "performance", label: "Performance", icon: BarChart3 },
  { id: "test", label: "Test", icon: PenLine },
];

interface BottomNavProps {
  page: Page;
  setPage: (p: Page) => void;
}

export default function BottomNav({ page, setPage }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border shadow-lg pb-safe-bottom z-50">
      <div className="flex items-center justify-around max-w-2xl mx-auto px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = page === item.id;
          const dataOcid = `nav.${item.id}_tab`;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={dataOcid}
              onClick={() => setPage(item.id)}
              className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors min-w-0 flex-1"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "oklch(0.38 0.11 185 / 0.12)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <Icon
                className="w-5 h-5 relative z-10 transition-colors"
                style={{
                  color: isActive
                    ? "oklch(0.38 0.11 185)"
                    : "oklch(0.52 0.04 220)",
                }}
              />
              <span
                className="text-xs font-medium relative z-10 transition-colors truncate"
                style={{
                  color: isActive
                    ? "oklch(0.38 0.11 185)"
                    : "oklch(0.52 0.04 220)",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
