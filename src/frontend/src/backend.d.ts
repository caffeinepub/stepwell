import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StepEntry {
    date: string;
    steps: bigint;
}
export interface WellbeingEntry {
    date: string;
    energyScore: bigint;
    moodScore: bigint;
}
export interface UserProfile {
    name: string;
}
export interface HydrationEntry {
    glasses: bigint;
    date: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHydrationGoal(): Promise<bigint>;
    getLast7DaysHydration(): Promise<Array<HydrationEntry>>;
    getLast7DaysSteps(): Promise<Array<StepEntry>>;
    getLast7DaysWellbeing(): Promise<Array<WellbeingEntry>>;
    getStepGoal(): Promise<bigint>;
    getTodayHydration(today: string): Promise<bigint>;
    getTodaySteps(today: string): Promise<bigint>;
    getTodayWellbeing(today: string): Promise<WellbeingEntry | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logHydration(date: string, glasses: bigint): Promise<void>;
    logSteps(date: string, steps: bigint): Promise<void>;
    logWellbeing(date: string, moodScore: bigint, energyScore: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setHydrationGoal(goal: bigint): Promise<void>;
    setStepGoal(goal: bigint): Promise<void>;
}
