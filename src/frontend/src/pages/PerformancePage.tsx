import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, Loader2, Plus, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddTestScore, useTestScores } from "../hooks/useQueries";

const SUBJECTS = ["Hindi", "English", "Maths", "Science"];

const GRADE_COLORS: Record<string, string> = {
  "A+": "oklch(0.45 0.18 145)",
  A: "oklch(0.50 0.17 145)",
  "A-": "oklch(0.55 0.16 145)",
  B: "oklch(0.38 0.11 185)",
  "B+": "oklch(0.42 0.12 185)",
  C: "oklch(0.58 0.14 72)",
  D: "oklch(0.58 0.22 27)",
  F: "oklch(0.52 0.22 27)",
};

export default function PerformancePage() {
  const { data: scores, isLoading } = useTestScores();
  const addScore = useAddTestScore();

  const [subject, setSubject] = useState("");
  const [score, setScore] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [grade, setGrade] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !score || !totalMarks || !grade) {
      toast.error("Please fill all fields");
      return;
    }
    const scoreNum = Number.parseInt(score);
    const totalNum = Number.parseInt(totalMarks);
    if (
      Number.isNaN(scoreNum) ||
      Number.isNaN(totalNum) ||
      scoreNum < 0 ||
      totalNum <= 0 ||
      scoreNum > totalNum
    ) {
      toast.error("Invalid score or total marks");
      return;
    }
    try {
      await addScore.mutateAsync({
        subject,
        score: BigInt(scoreNum),
        totalMarks: BigInt(totalNum),
        grade,
      });
      toast.success("Test score added successfully!");
      setSubject("");
      setScore("");
      setTotalMarks("");
      setGrade("");
    } catch {
      toast.error("Failed to add test score");
    }
  };

  const avgScore =
    scores && scores.length > 0
      ? Math.round(
          scores.reduce(
            (acc, s) => acc + (Number(s.score) / Number(s.totalMarks)) * 100,
            0,
          ) / scores.length,
        )
      : null;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3
          className="w-5 h-5"
          style={{ color: "oklch(0.38 0.11 185)" }}
        />
        <h2 className="font-display font-bold text-xl text-foreground">
          Performance
        </h2>
      </div>

      {/* Summary card */}
      {scores && scores.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-card overflow-hidden border-border">
            <div className="gradient-teal px-4 py-3 flex items-center gap-3">
              <Trophy className="w-5 h-5 text-primary-foreground" />
              <div>
                <p className="text-primary-foreground font-display font-bold text-lg">
                  {avgScore}% Average
                </p>
                <p className="text-primary-foreground/70 text-xs">
                  Based on {scores.length} test{scores.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Add score form */}
      <Card className="shadow-xs border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Test Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger data-ocid="performance.subject_select">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Score</Label>
                <Input
                  data-ocid="performance.score_input"
                  type="number"
                  placeholder="e.g. 85"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  min="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Total Marks</Label>
                <Input
                  data-ocid="performance.total_input"
                  type="number"
                  placeholder="e.g. 100"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  min="1"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Grade</Label>
                <Input
                  data-ocid="performance.grade_input"
                  placeholder="e.g. A+, B, C"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>
            </div>
            <Button
              data-ocid="performance.submit_button"
              type="submit"
              disabled={addScore.isPending}
              className="w-full gradient-teal text-primary-foreground font-semibold"
            >
              {addScore.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Score"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Scores table */}
      <Card className="shadow-xs border-border">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">Test History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 3 }, (_, i) => `sk-${i}`).map((k) => (
                <Skeleton key={k} className="h-12 w-full" />
              ))}
            </div>
          ) : !scores || scores.length === 0 ? (
            <div
              data-ocid="performance.empty_state"
              className="text-center py-8 text-muted-foreground"
            >
              <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                No test scores yet. Add your first score!
              </p>
            </div>
          ) : (
            <Table data-ocid="performance.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-right">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.map((s, i) => (
                  <TableRow
                    key={`${s.subject}-${i}`}
                    data-ocid={`performance.row.${i + 1}`}
                  >
                    <TableCell className="font-medium text-sm">
                      {s.subject}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {String(s.score)}/{String(s.totalMarks)}
                      <span className="text-muted-foreground ml-1 text-xs">
                        (
                        {Math.round(
                          (Number(s.score) / Number(s.totalMarks)) * 100,
                        )}
                        %)
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className="text-xs font-bold"
                        style={{
                          color:
                            GRADE_COLORS[s.grade] || "oklch(0.38 0.11 185)",
                          borderColor:
                            GRADE_COLORS[s.grade] || "oklch(0.38 0.11 185)",
                        }}
                      >
                        {s.grade}
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
