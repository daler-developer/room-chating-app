import { useEffect, useLayoutEffect, useState } from "react"
import useIsAuthenticated from "../hooks/useIsAuthenticated"
import useTypedDispatch from "../hooks/useTypedDispatch"
import { authActions } from "../redux/slices/authSlice"
import { initSocket, socket } from "../socket"
import FullScreenLoader from "./FullScreenLoader"

export default ({ children }: { children: any }) => {
  const [isFullScreenLoaderVisible, setIsFullScreenLoaderVisible] = useState(true)

  const dispatch = useTypedDispatch()
  
  useEffect(() => {
    (async () => {
      try {
        await dispatch(authActions.fetchedMe()).unwrap()
        
        initSocket()
      } catch (e) {
        
      } finally {
        setIsFullScreenLoaderVisible(false)
      }
    })()
  }, [])

  if (isFullScreenLoaderVisible) {
    return <FullScreenLoader />
  }

  return children
}
