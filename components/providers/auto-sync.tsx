"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AutoSync() {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const ensureUser = useMutation(api.users.ensureUser);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) return;
    ensureUser({
      email,
      name: user.fullName ?? undefined,
      phone: user.primaryPhoneNumber?.phoneNumber ?? undefined,
    });
  }, [isAuthenticated, user, ensureUser]);

  return null;
}
