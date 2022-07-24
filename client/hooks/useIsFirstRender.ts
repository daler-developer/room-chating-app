import { useEffect, useRef } from "react"

export default () => {
  const firstRender = useRef(true)

  useEffect(() => {

  }, [])

  return firstRender.current
}

