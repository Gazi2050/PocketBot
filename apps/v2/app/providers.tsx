"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { api } from "@pocketbot/backend/convex/_generated/api";
import { AutumnProvider } from "autumn-js/react";
import { ConvexReactClient, useConvex, useConvexAuth, useQueries } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useEffect, useMemo, useRef, useState } from "react";
import { mutate } from "swr";

import { FunnelTracker } from "@/components/analytics/funnel-tracker";
import { PostHogIdentity } from "@/components/posthog-identity";
import { FEATURES_QUERY, type DeploymentFeatures } from "@/lib/deployment-features";
import { useIsDark } from "@/lib/theme";

function AutumnBridge({ children }: { children: React.ReactNode }) {
  const convex = useConvex();
  const { isAuthenticated } = useConvexAuth();
  const authRef = useRef(isAuthenticated);
  const gateRef = useRef(false);

  /* Autumn's SWR fetches fire the moment the provider mounts — before the
     Convex↔Clerk handshake finishes — so every reload used to hit the
     server unauthenticated and splash identify()'s "No customer
     identifier" error into the console. This facade rejects locally until
     auth is actually attached (Autumn folds the rejection into its quiet
     {data, error} result); the revalidation below refetches the moment
     auth lands. */
  /* The same facade also stays shut on deployments with billing off: their
     actions would only die inside the Autumn component ("Autumn secret key
     or publishable key is required") and splash server errors into every
     signed-in console. features.get answers in one hop, so the gate opens a
     beat after mount on real billing deployments; a backend older than
     features.get is treated as billing-on, matching ASSUME_ALL_ON below. */
  const gatedConvex = useMemo(
    () => ({
      action: (ref: unknown, args: unknown) => {
        if (!authRef.current || !gateRef.current) {
          return Promise.reject(new Error("Signed-out or billing off — skipping Autumn call"));
        }
        return convex.action(
          ref as Parameters<ConvexReactClient["action"]>[0],
          args as never,
        );
      },
    }),
    [convex],
  );

  /* The gate's view of auth is refreshed on commit, never during render —
     a render React throws away must not be able to open it. Any Autumn
     call that raced ahead of this write is repaired by the revalidation
     right below, which is the same repair the pre-handshake window
     already relies on. */
  const { features } = useQueries(FEATURES_QUERY);
  const billingOn =
    features instanceof Error
      ? true
      : (features as DeploymentFeatures | undefined)?.billing === true;
  const gateOpen = isAuthenticated && billingOn;

  useEffect(() => {
    authRef.current = isAuthenticated;
    gateRef.current = gateOpen;
    if (!gateOpen) return;
    /* The gate just opened — refetch Autumn's data now instead of waiting
       out SWR's error-retry backoff. (Autumn is the only SWR user in this
       app, so revalidating every key is revalidating its keys.) */
    void mutate(() => true);
  }, [gateOpen, isAuthenticated]);

  return (
    <AutumnProvider convex={gatedConvex} convexApi={api.autumn}>
      {/* Inside the provider: the funnel's last step watches Autumn's
          customer for the plan that says someone started paying. */}
      <FunnelTracker />
      {children}
    </AutumnProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const isDark = useIsDark();
  const [convex] = useState(() => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) throw new Error("Missing NEXT_PUBLIC_CONVEX_URL");
    return new ConvexReactClient(convexUrl);
  });

  return (
    <ClerkProvider
      appearance={{
        theme: isDark ? dark : undefined,
        variables: { borderRadius: "0.75rem" },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <PostHogIdentity />
        <AutumnBridge>{children}</AutumnBridge>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
