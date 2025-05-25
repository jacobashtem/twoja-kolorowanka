export default defineNuxtRouteMiddleware((to) => {
  const parts = to.path.split('/').filter(Boolean)
  if (parts[0] === 'koloruj' && parts.length < 4) {
    const newPath = '/' + parts.slice(1).join('/')
    return navigateTo({
      path: newPath,
      query: to.query,
      hash:  to.hash
    })
  }
})
