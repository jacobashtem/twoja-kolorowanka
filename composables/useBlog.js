import { useBlogApi } from './useBlogApi'
import { useBlogMock } from './useBlogMock'

/**
 * Glowny composable bloga — automatycznie przelacza miedzy
 * prawdziwym API a mockami na podstawie MOCK_BLOG env
 */
export function useBlog() {
  const config = useRuntimeConfig()
  const isMock = config.public.mockBlog

  if (isMock) {
    return useBlogMock()
  }
  return useBlogApi()
}
