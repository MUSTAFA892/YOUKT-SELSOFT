import { fetchProblem } from "@/lib/api";
import Workspace from "./Workspace";
import { notFound } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

// Mark this route as dynamic since each candidate gets unique session data
export const dynamic = 'force-dynamic';

export default async function ProblemPage({ params }: { params: { id: string } }) {
  try {
    // Next.js 15 requires params to be awaited before using its properties if it's treated as a promise
    const resolvedParams = await params;
    // Note: We cannot use useAuth here (it's a hook, this is server component)
    // So candidateId will be passed from client component
    const problem = await fetchProblem(resolvedParams.id);
    
    return <Workspace problem={problem} />;
  } catch (error) {
    console.error(error);
    notFound();
  }
}
