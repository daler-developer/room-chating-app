import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useIsAuthenticated from '../hooks/useIsAuthenticated'
import useTypedSelector from '../hooks/useTypedSelector'
import { authSelectors } from '../redux/slices/authSlice'
import FullScreenLoader from './FullScreenLoader'

export default ({ children }: any) => {
  const isAuthenticated = useIsAuthenticated()

  const isFetchingMe = useTypedSelector(authSelectors.selectIsFetchingMe)

  const router = useRouter()

  useEffect(() => {
    if (!isFetchingMe && !isAuthenticated) {
      router.push(`/login?next=${router.asPath}`)
    }
  }, [isFetchingMe, isAuthenticated])

  if (!isAuthenticated) {
    return null
  }

  return children
}
