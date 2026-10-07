"use client";
import { useEffect } from "react";
import { startAccountRuntime } from "@/lib/accountRuntime";
export function AccountRuntime() { useEffect(startAccountRuntime, []); return null; }
