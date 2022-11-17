import { useRouter } from "next/router"
import { useEffect } from "react"
import { useUser } from "../provider/LiffProvider"

export const useAuthRoute = () => {
  const router = useRouter()
  const { user } = useUser()

  useEffect(() => {
    if (user == null) {
      router.push("/login")
    }
  }, [router, user])
}

export const useUnauthRoute = () => {
  const router = useRouter()
  const { user } = useUser()

  useEffect(() => {
    if (user != null && router.asPath === "/login") {
      router.push("/")
    }
  }, [router, user])
}
