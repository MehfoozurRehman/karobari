import { redirect } from "next/navigation";
import { waStartBusinessLink } from "@/lib/wa-links";

export default function SignUpPage() {
  redirect(waStartBusinessLink());
}
