import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CurriculumTopic {
    topic: string;
    subject: string;
}
export interface AttendanceRecord {
    status: string;
    date: string;
}
export interface TestQuestion {
    question: string;
    subject: string;
    correctAnswer: bigint;
    options: Array<string>;
}
export interface UserProfile {
    name: string;
}
export interface TestScore {
    totalMarks: bigint;
    subject: string;
    score: bigint;
    grade: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTestScore(subject: string, score: bigint, totalMarks: bigint, grade: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAttendance(): Promise<Array<AttendanceRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurriculum(subject: string): Promise<Array<CurriculumTopic>>;
    getTestQuestions(subject: string): Promise<Array<TestQuestion>>;
    getTestScores(): Promise<Array<TestScore>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markAttendance(date: string, status: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
