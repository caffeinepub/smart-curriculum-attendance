import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AttendanceRecord,
  CurriculumTopic,
  TestQuestion,
  TestScore,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useAttendance() {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendance"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAttendance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, status }: { date: string; status: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.markAttendance(date, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useTestScores() {
  const { actor, isFetching } = useActor();
  return useQuery<TestScore[]>({
    queryKey: ["testScores"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTestScores();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTestScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subject,
      score,
      totalMarks,
      grade,
    }: {
      subject: string;
      score: bigint;
      totalMarks: bigint;
      grade: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addTestScore(subject, score, totalMarks, grade);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testScores"] });
    },
  });
}

export function useCurriculum(subject: string) {
  const { actor, isFetching } = useActor();
  return useQuery<CurriculumTopic[]>({
    queryKey: ["curriculum", subject],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCurriculum(subject);
    },
    enabled: !!actor && !isFetching && !!subject,
  });
}

export function useTestQuestions(subject: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TestQuestion[]>({
    queryKey: ["testQuestions", subject],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTestQuestions(subject);
    },
    enabled: !!actor && !isFetching && !!subject,
  });
}
