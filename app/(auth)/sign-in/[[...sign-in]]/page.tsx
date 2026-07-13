import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] p-4">
      <Suspense fallback={null}>
        <SignIn fallbackRedirectUrl="/dashboard" signUpUrl={`${process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}`} />
      </Suspense>
    </div>
  );
}
