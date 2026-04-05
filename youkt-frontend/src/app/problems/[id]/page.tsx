import { fetchProblem } from "@/lib/api";
import Workspace from "./Workspace";
import { notFound } from "next/navigation";

export default async function ProblemPage({ params }: { params: { id: string } }) {
  try {
    // Next.js 15 requires params to be awaited before using its properties if it's treated as a promise,
    // but in Page props, `params` is often a promise in Next 15.
    // To strictly support both Next 14 and 15 without errors, we handle it asynchronously.
    const resolvedParams = await params;
    const problem = await fetchProblem(resolvedParams.id);
    
    return <Workspace problem={problem} />;
  } catch (error) {
    console.error(error);
    notFound();
  }
}
