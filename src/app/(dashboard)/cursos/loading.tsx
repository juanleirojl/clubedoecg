import { CourseListSkeleton } from "@/components/ui/loading"

export default function CursosLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="h-8 bg-muted rounded w-48 mb-6 animate-pulse" />
      <CourseListSkeleton count={6} />
    </div>
  )
}

