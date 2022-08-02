import { useEffect, useLayoutEffect, useState } from 'react'
import useIsAuthenticated from '../hooks/useIsAuthenticated'
import useTypedDispatch from '../hooks/useTypedDispatch'
import { authActions } from '../redux/slices/authSlice'
import { initSocket, socket } from '../socket'
import Alert from './Alert'
import FullScreenLoader from './FullScreenLoader'
import UpdateProfileModal from './UpdateProfileModal'

export default ({ children }: { children: any }) => {
  const [isFullScreenLoaderVisible, setIsFullScreenLoaderVisible] =
    useState(true)

  const dispatch = useTypedDispatch()

  useEffect(() => {
    ;(async () => {
      try {
        if (localStorage.getItem('accessToken')) {
          await dispatch(authActions.fetchedMe()).unwrap()

          initSocket()
        }
      } catch (e) {
      } finally {
        setIsFullScreenLoaderVisible(false)
      }
    })()
  }, [])

  if (isFullScreenLoaderVisible) {
    return <FullScreenLoader />
  }

  return (
    <>
      {children}
      <Alert />
    </>
  )
}
