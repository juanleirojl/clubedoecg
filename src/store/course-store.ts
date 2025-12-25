import { create } from 'zustand'
import { CourseWithProgress, ModuleWithContent, LessonWithProgress } from '@/types'

interface CourseState {
  // Cursos do usuário
  courses: CourseWithProgress[]
  currentCourse: CourseWithProgress | null
  currentModule: ModuleWithContent | null
  currentLesson: LessonWithProgress | null
  
  // Actions
  setCourses: (courses: CourseWithProgress[]) => void
  setCurrentCourse: (course: CourseWithProgress | null) => void
  setCurrentModule: (module: ModuleWithContent | null) => void
  setCurrentLesson: (lesson: LessonWithProgress | null) => void
  
  // Update progress
  updateLessonProgress: (lessonId: string, progress: Partial<LessonWithProgress['progress']>) => void
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  currentCourse: null,
  currentModule: null,
  currentLesson: null,
  
  setCourses: (courses) => set({ courses }),
  setCurrentCourse: (currentCourse) => set({ currentCourse }),
  setCurrentModule: (currentModule) => set({ currentModule }),
  setCurrentLesson: (currentLesson) => set({ currentLesson }),
  
  updateLessonProgress: (lessonId, progress) => set((state) => {
    // Atualiza o progresso no currentModule se existir
    if (state.currentModule) {
      const updatedContents = state.currentModule.contents.map((content) => {
        if (content.type === 'lesson' && content.id === lessonId) {
          return {
            ...content,
            progress: { ...content.progress, ...progress } as LessonWithProgress['progress'],
          }
        }
        return content
      })
      return {
        currentModule: { ...state.currentModule, contents: updatedContents },
      }
    }
    return state
  }),
}))



