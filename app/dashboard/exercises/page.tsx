import { ExercisesPage } from '@/components/exercises/ExercisesPage'

interface PageProps {
  searchParams: Promise<{ start?: string }>
}

export default async function ExercisesRoute({ searchParams }: PageProps) {
  const params = await searchParams
  const startExerciseId = params.start

  return <ExercisesPage startExerciseId={startExerciseId} />
}
