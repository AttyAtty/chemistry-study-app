"use client";
import { useEffect } from "react";
import { startLearningStorage } from "@/lib/learningStorageRuntime";
import { CHEMICA_VERSION } from "@/lib/appVersion";
export function LearningStorageRuntime(){useEffect(()=>startLearningStorage(CHEMICA_VERSION),[]);return null;}
