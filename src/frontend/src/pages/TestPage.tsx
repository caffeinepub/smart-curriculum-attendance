import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PenLine,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTestQuestions } from "../hooks/useQueries";

const SUBJECTS = ["Hindi", "English", "Maths", "Science"];

type QuizState = "selecting" | "in-progress" | "finished";

export default function TestPage() {
  const [subject, setSubject] = useState("");
  const [quizState, setQuizState] = useState<QuizState>("selecting");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);

  const { data: questions, isLoading } = useTestQuestions(subject);

  const startQuiz = () => {
    if (!subject || !questions || questions.length === 0) return;
    setQuizState("in-progress");
    setCurrentIndex(0);
    setAnswers({});
    setSelectedOption(null);
  };

  const handleSelect = (optionIndex: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIndex);
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (!questions) return;
    if (currentIndex === questions.length - 1) {
      setQuizState("finished");
    } else {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
      setSelectedOption(answers[currentIndex + 1] ?? null);
    }
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setDirection(-1);
    setCurrentIndex((i) => i - 1);
    setSelectedOption(answers[currentIndex - 1] ?? null);
  };

  const handleRestart = () => {
    setQuizState("selecting");
    setCurrentIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setSubject("");
  };

  const correctCount = questions
    ? Object.entries(answers).filter(
        ([idx, ans]) =>
          ans === Number(questions[Number.parseInt(idx)]?.correctAnswer),
      ).length
    : 0;

  const OPTION_LABELS = ["A", "B", "C", "D"];

  const currentQuestion = questions?.[currentIndex];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <PenLine
          className="w-5 h-5"
          style={{ color: "oklch(0.38 0.11 185)" }}
        />
        <h2 className="font-display font-bold text-xl text-foreground">
          Practice Test
        </h2>
      </div>

      {/* Subject selector (always visible in selecting state) */}
      {quizState === "selecting" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Choose a Subject
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger data-ocid="test.subject_select">
                  <SelectValue placeholder="Select subject to practice" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {subject && isLoading && (
                <div data-ocid="test.loading_state" className="space-y-2">
                  {["s1", "s2", "s3"].map((k) => (
                    <Skeleton key={k} className="h-10 w-full" />
                  ))}
                </div>
              )}

              {subject && !isLoading && questions && questions.length === 0 && (
                <div
                  data-ocid="test.empty_state"
                  className="text-center py-4 text-muted-foreground"
                >
                  <p className="text-sm">
                    No questions available for {subject} yet.
                  </p>
                </div>
              )}

              {subject && !isLoading && questions && questions.length > 0 && (
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-sm font-medium text-secondary-foreground">
                    {questions.length} questions ready
                  </p>
                </div>
              )}

              <Button
                onClick={startQuiz}
                disabled={
                  !subject || isLoading || !questions || questions.length === 0
                }
                className="w-full gradient-teal text-primary-foreground font-semibold h-12"
                data-ocid="test.primary_button"
              >
                Start Test
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quiz in progress */}
      {quizState === "in-progress" && currentQuestion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Question {currentIndex + 1} of {questions!.length}
              </span>
              <span>
                {Math.round(((currentIndex + 1) / questions!.length) * 100)}%
              </span>
            </div>
            <Progress
              value={((currentIndex + 1) / questions!.length) * 100}
              className="h-2"
            />
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -30 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="shadow-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-display font-bold text-sm"
                      style={{
                        background: "oklch(0.93 0.02 185)",
                        color: "oklch(0.38 0.11 185)",
                      }}
                    >
                      {currentIndex + 1}
                    </div>
                    <CardTitle className="font-body text-base font-semibold leading-snug">
                      {currentQuestion.question}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentQuestion.options.map((option, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const isCorrect =
                      optIdx === Number(currentQuestion.correctAnswer);
                    const showResult = selectedOption !== null;

                    let bgStyle = "";
                    let borderStyle = "oklch(0.89 0.02 200)";
                    let textStyle = "oklch(0.18 0.02 240)";

                    if (showResult) {
                      if (isCorrect) {
                        bgStyle = "oklch(0.96 0.04 145)";
                        borderStyle = "oklch(0.55 0.17 145)";
                        textStyle = "oklch(0.32 0.14 145)";
                      } else if (isSelected && !isCorrect) {
                        bgStyle = "oklch(0.97 0.04 27)";
                        borderStyle = "oklch(0.58 0.22 27)";
                        textStyle = "oklch(0.40 0.18 27)";
                      }
                    } else if (isSelected) {
                      bgStyle = "oklch(0.93 0.04 185)";
                      borderStyle = "oklch(0.38 0.11 185)";
                    }

                    return (
                      <button
                        key={option}
                        type="button"
                        data-ocid={`test.option_button.${optIdx + 1}`}
                        onClick={() => handleSelect(optIdx)}
                        disabled={selectedOption !== null}
                        className="w-full text-left p-3 rounded-xl border-2 transition-all duration-150 flex items-center gap-3 disabled:cursor-default"
                        style={{
                          background: bgStyle || "white",
                          borderColor: borderStyle,
                          color: textStyle,
                        }}
                      >
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-display flex-shrink-0"
                          style={{
                            background: bgStyle
                              ? borderStyle
                              : "oklch(0.94 0.01 200)",
                            color: bgStyle ? "white" : "oklch(0.50 0.04 220)",
                          }}
                        >
                          {OPTION_LABELS[optIdx]}
                        </span>
                        <span className="text-sm font-medium">{option}</span>
                        {showResult && isCorrect && (
                          <CheckCircle2
                            className="ml-auto w-4 h-4 flex-shrink-0"
                            style={{ color: "oklch(0.50 0.17 145)" }}
                          />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircle
                            className="ml-auto w-4 h-4 flex-shrink-0"
                            style={{ color: "oklch(0.52 0.22 27)" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            <Button
              data-ocid="test.prev_button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              variant="outline"
              className="flex-1"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button
              data-ocid="test.next_button"
              onClick={handleNext}
              disabled={selectedOption === null}
              className="flex-1 gradient-teal text-primary-foreground font-semibold"
            >
              {currentIndex === questions!.length - 1 ? "Finish" : "Next"}{" "}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Result */}
      {quizState === "finished" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card
            data-ocid="test.result_card"
            className="shadow-card border-border overflow-hidden"
          >
            <div className="gradient-teal px-6 py-8 text-center">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <span className="font-display font-bold text-3xl text-primary-foreground">
                  {correctCount}/{questions!.length}
                </span>
              </div>
              <h3 className="font-display font-bold text-2xl text-primary-foreground">
                Test Complete!
              </h3>
              <p className="text-primary-foreground/70 text-sm mt-1">
                {Math.round((correctCount / questions!.length) * 100)}% Score
              </p>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div
                  className="p-3 rounded-xl"
                  style={{ background: "oklch(0.96 0.04 145)" }}
                >
                  <p
                    className="font-display font-bold text-xl"
                    style={{ color: "oklch(0.42 0.17 145)" }}
                  >
                    {correctCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div
                  className="p-3 rounded-xl"
                  style={{ background: "oklch(0.97 0.04 27)" }}
                >
                  <p
                    className="font-display font-bold text-xl"
                    style={{ color: "oklch(0.48 0.18 27)" }}
                  >
                    {questions!.length - correctCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Wrong</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary">
                  <p className="font-display font-bold text-xl text-secondary-foreground">
                    {questions!.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>

              <div className="space-y-2">
                <Badge
                  className="w-full justify-center py-1.5 text-sm"
                  style={{
                    background:
                      correctCount / questions!.length >= 0.7
                        ? "oklch(0.50 0.17 145)"
                        : correctCount / questions!.length >= 0.5
                          ? "oklch(0.72 0.16 72)"
                          : "oklch(0.52 0.22 27)",
                    color: "white",
                  }}
                >
                  {correctCount / questions!.length >= 0.7
                    ? "🎉 Excellent Performance!"
                    : correctCount / questions!.length >= 0.5
                      ? "👍 Good Effort — Keep Practicing!"
                      : "📚 Review Your Notes and Try Again"}
                </Badge>
              </div>

              <Button
                onClick={handleRestart}
                variant="outline"
                className="w-full"
                data-ocid="test.secondary_button"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Take Another Test
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pb-2">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
