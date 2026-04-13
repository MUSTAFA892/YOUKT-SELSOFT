import { fetchProblems } from "@/lib/api";
import ProblemsClient from "./ProblemsClient";
import Navbar from "@/components/landing/Navbar";

export const metadata = {
  title: "Problem Archive | YOUKT",
  description: "Explore hundreds of curated engineering challenges and level up your coding skills.",
};

export default async function ProblemsPage() {
  const problems = await fetchProblems();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-24">
        <ProblemsClient initialProblems={problems} />
      </div>
    </main>
  );
}
