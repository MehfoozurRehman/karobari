import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] p-4">
      <Suspense fallback={null}>
        <SignUp />
      </Suspense>
    </div>
  );
}
