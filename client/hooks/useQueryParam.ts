import { useRouter } from "next/router"

export default (param: string): [string, (v: string) => void] => {
  const router = useRouter()

  const value = router.query[param] as string

  function change(to: string) {
    router.query[param] = to

    router.push(router)
  }

  return [value, change]
}
