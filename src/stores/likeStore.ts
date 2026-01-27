import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface LikeStore {
  likedSceneIds: Set<string>
  isLoadingLikes: boolean

  setLikedSceneIds: (ids: Set<string>) => void
  addLikedScene: (sceneId: string) => void
  removeLikedScene: (sceneId: string) => void
  toggleLikedScene: (sceneId: string) => void
  setLoadingLikes: (loading: boolean) => void
  resetLikeState: () => void
}

export const useLikeStore = create<LikeStore>()(
  devtools(
    (set) => ({
      likedSceneIds: new Set<string>(),
      isLoadingLikes: false,

      setLikedSceneIds: (ids) =>
        set({ likedSceneIds: ids }, false, 'likeStore/setLikedSceneIds'),

      addLikedScene: (sceneId) =>
        set(
          (state) => ({
            likedSceneIds: new Set([...state.likedSceneIds, sceneId]),
          }),
          false,
          'likeStore/addLikedScene'
        ),

      removeLikedScene: (sceneId) =>
        set(
          (state) => {
            const newSet = new Set(state.likedSceneIds)
            newSet.delete(sceneId)
            return { likedSceneIds: newSet }
          },
          false,
          'likeStore/removeLikedScene'
        ),

      toggleLikedScene: (sceneId) =>
        set(
          (state) => {
            const newSet = new Set(state.likedSceneIds)
            if (newSet.has(sceneId)) {
              newSet.delete(sceneId)
            } else {
              newSet.add(sceneId)
            }
            return { likedSceneIds: newSet }
          },
          false,
          'likeStore/toggleLikedScene'
        ),

      setLoadingLikes: (loading) =>
        set({ isLoadingLikes: loading }, false, 'likeStore/setLoadingLikes'),

      resetLikeState: () =>
        set(
          {
            likedSceneIds: new Set<string>(),
            isLoadingLikes: false,
          },
          false,
          'likeStore/resetLikeState'
        ),
    }),
    {
      name: 'like-store',
    }
  )
)

// Selectors
export const useLikedSceneIds = () =>
  useLikeStore((state) => state.likedSceneIds)
export const useIsLoadingLikes = () =>
  useLikeStore((state) => state.isLoadingLikes)
