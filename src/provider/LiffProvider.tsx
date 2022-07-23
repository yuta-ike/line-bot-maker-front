import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { Liff } from "@line/liff"
import { useRouter } from "next/router"

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID!

export type User = {
  id: string
  name: string
  iconUrl: string | null
}

export type LiffContextType = { liff: Liff | null; user: User | null }
const liffContextInit: LiffContextType = { liff: null, user: null }
const LiffContext = React.createContext<LiffContextType>(liffContextInit)

export type LiffOperationContextType = {
  login: (redirectUrl?: string) => void | Promise<void>
  logout: () => void | Promise<void>
}
const liffOperationContextInit: LiffOperationContextType = {
  login: () => {},
  logout: () => {},
}
const LiffOperationContext = React.createContext<LiffOperationContextType>(
  liffOperationContextInit,
)

type LiffProviderProps = {
  children: React.ReactNode
}

const LiffProvider: React.FC<LiffProviderProps> = ({ children }) => {
  const [value, setValue] = useState<LiffContextType>(liffContextInit)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const { default: liff } = await import("@line/liff")
      await liff.init({ liffId: LIFF_ID, withLoginOnExternalBrowser: false })
      setValue({ liff, user: null })
      const profile = await liff.getProfile()
      setValue((prev) => ({
        ...prev,
        user: {
          id: profile.userId,
          name: profile.displayName,
          iconUrl: profile.pictureUrl ?? null,
        },
      }))
    })().catch((e) => console.error(e))
  }, [router])

  const login = useCallback(
    async (redirectUri?: string) => {
      const liff = value.liff
      if (liff == null) {
        // throw new Error("Liff is not initialized")
        return
      }
      if (!liff.isLoggedIn()) {
        liff.login({
          redirectUri,
        })
      }
      const profile = await liff.getProfile()
      setValue((prev) => ({
        ...prev,
        user: {
          id: profile.userId,
          name: profile.displayName,
          iconUrl: profile.pictureUrl ?? null,
        },
      }))
    },
    [value.liff],
  )

  const logout = useCallback(async () => {
    const liff = value.liff
    if (liff == null) {
      throw new Error("Liff is not initialized")
    }

    if (liff.isLoggedIn()) {
      liff.logout()
      router.reload()
    }
  }, [router, value.liff])

  const operationValue = useMemo(() => ({ login, logout }), [login, logout])

  return (
    <LiffContext.Provider value={value}>
      <LiffOperationContext.Provider value={operationValue}>
        {children}
      </LiffOperationContext.Provider>
    </LiffContext.Provider>
  )
}

export default LiffProvider

export const useLiffContext = () => {
  const context = useContext(LiffContext)
  if (context == null) {
    throw new Error("Call useLiffContext inside LiffProvider.")
  }
  return context
}
export const useLiff = () => useLiffContext().liff
export const useUser = () => useLiffContext().user

export const useLiffOperation = () => {
  const context = useContext(LiffOperationContext)
  if (context == null) {
    throw new Error("Call useLiffOperationContext inside LiffProvider.")
  }
  return context
}
