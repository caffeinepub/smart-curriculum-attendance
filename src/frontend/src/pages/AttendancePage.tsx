import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useAttendance, useMarkAttendance } from "../hooks/useQueries";

function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AttendancePage() {
  const today = getTodayDateString();
  const { data: records, isLoading } = useAttendance();
  const markAttendance = useMarkAttendance();

  const todayRecord = records?.find((r) => r.date === today);
  const alreadyMarked = !!todayRecord;

  const presentCount =
    records?.filter((r) => r.status === "Present").length || 0;
  const absentCount = records?.filter((r) => r.status === "Absent").length || 0;
  const total = records?.length || 0;
  const attendancePct =
    total > 0 ? Math.round((presentCount / total) * 100) : 0;

  const handleMark = async (status: "Present" | "Absent") => {
    try {
      await markAttendance.mutateAsync({ date: today, status });
      toast.success(`Marked ${status} for today`);
    } catch {
      toast.error("Failed to mark attendance");
    }
  };

  const sortedRecords = [...(records || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CalendarCheck
          className="w-5 h-5"
          style={{ color: "oklch(0.38 0.11 185)" }}
        />
        <h2 className="font-display font-bold text-xl text-foreground">
          Attendance
        </h2>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Present",
            value: presentCount,
            color: "oklch(0.65 0.19 145)",
          },
          { label: "Absent", value: absentCount, color: "oklch(0.58 0.22 27)" },
          {
            label: "Percentage",
            value: `${attendancePct}%`,
            color: "oklch(0.38 0.11 185)",
          },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-xs border-border">
            <CardContent className="p-3 text-center">
              <p
                className="font-display font-bold text-2xl"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's attendance card */}
      <Card className="shadow-card border-border overflow-hidden">
        <div className="gradient-teal px-4 py-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary-foreground" />
            <p className="font-display font-semibold text-primary-foreground text-sm">
              Today — {formatDate(today)}
            </p>
          </div>
        </div>
        <CardContent className="p-4">
          {alreadyMarked ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background:
                  todayRecord.status === "Present"
                    ? "oklch(0.96 0.04 145)"
                    : "oklch(0.97 0.04 27)",
              }}
            >
              {todayRecord.status === "Present" ? (
                <CheckCircle2
                  className="w-6 h-6"
                  style={{ color: "oklch(0.50 0.17 145)" }}
                />
              ) : (
                <XCircle
                  className="w-6 h-6"
                  style={{ color: "oklch(0.52 0.18 27)" }}
                />
              )}
              <div>
                <p className="font-semibold text-sm">
                  Marked as{" "}
                  <span
                    style={{
                      color:
                        todayRecord.status === "Present"
                          ? "oklch(0.45 0.17 145)"
                          : "oklch(0.50 0.18 27)",
                    }}
                  >
                    {todayRecord.status}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Attendance recorded for today
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">
                Mark your attendance for today
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  data-ocid="attendance.present_button"
                  onClick={() => handleMark("Present")}
                  disabled={markAttendance.isPending}
                  className="h-12 font-semibold"
                  style={{ background: "oklch(0.50 0.17 145)", color: "white" }}
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Present
                </Button>
                <Button
                  data-ocid="attendance.absent_button"
                  onClick={() => handleMark("Absent")}
                  disabled={markAttendance.isPending}
                  variant="outline"
                  className="h-12 font-semibold border-2"
                  style={{
                    borderColor: "oklch(0.52 0.18 27)",
                    color: "oklch(0.50 0.18 27)",
                  }}
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Absent
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card className="shadow-xs border-border">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">
            Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 4 }, (_, i) => `sk-${i}`).map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : sortedRecords.length === 0 ? (
            <div
              data-ocid="attendance.empty_state"
              className="text-center py-8 text-muted-foreground"
            >
              <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No attendance records yet</p>
            </div>
          ) : (
            <Table data-ocid="attendance.history_table">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRecords.map((record, i) => (
                  <TableRow
                    key={record.date}
                    data-ocid={`attendance.row.${i + 1}`}
                  >
                    <TableCell className="text-sm">
                      {formatDate(record.date)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          background:
                            record.status === "Present"
                              ? "oklch(0.96 0.04 145)"
                              : "oklch(0.97 0.04 27)",
                          borderColor:
                            record.status === "Present"
                              ? "oklch(0.70 0.15 145)"
                              : "oklch(0.70 0.15 27)",
                          color:
                            record.status === "Present"
                              ? "oklch(0.40 0.15 145)"
                              : "oklch(0.45 0.18 27)",
                        }}
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
