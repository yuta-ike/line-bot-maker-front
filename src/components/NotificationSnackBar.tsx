import classNames from "classnames"
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { FiX } from "react-icons/fi"

const NotificationSnackBarContext = React.createContext<{
  showSnackBar: (type: "error" | "ok", message: string) => void
}>({
  showSnackBar: () => {
    throw new Error(
      "Unable to call useSnackBar outside of NotificationSnackBarProvider.",
    )
  },
})

export type NotificationSnackBarProviderProps = {
  children: React.ReactNode
}

export const NotificationSnackBarProvider: React.FC<
  NotificationSnackBarProviderProps
> = ({ children }) => {
  const [snackBarMessage, setSnackBarMessage] = useState<{
    message: string
    type: "error" | "ok"
  } | null>(null)

  const handleClose = useCallback(() => setSnackBarMessage(null), [])

  const value = useMemo(
    () => ({
      showSnackBar: (type: "error" | "ok", message: string) =>
        setSnackBarMessage({ type, message }),
    }),
    [],
  )

  useEffect(() => {
    if (snackBarMessage != null) {
      const timer = setTimeout(() => {
        setSnackBarMessage(null)
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [snackBarMessage])

  return (
    <NotificationSnackBarContext.Provider value={value}>
      {children}
      <NotificationSnackBar
        onClose={handleClose}
        type={snackBarMessage?.type ?? null}
      >
        {snackBarMessage?.message ?? null}
      </NotificationSnackBar>
    </NotificationSnackBarContext.Provider>
  )
}

export const useSnackBar = () => {
  const context = useContext(NotificationSnackBarContext)
  if (context == null) {
    throw new Error(
      "Unable to call useSnackBar outside of NotificationSnackBarProvider.",
    )
  }
  return context.showSnackBar
}

export type NotificationSnackBarProps = {
  type: "error" | "ok" | null
  children: string | null
  onClose: () => void
}

const NotificationSnackBar: React.FC<NotificationSnackBarProps> = ({
  type,
  children,
  onClose,
}) => {
  return (
    <div
      className={classNames(
        "fixed left-1/2 z-50 flex w-[400px] max-w-full -translate-x-1/2 items-center justify-between rounded border-2 p-4 text-gray-800 shadow transition-[top,transition] duration-300",
        type === "error"
          ? "border-red-300 bg-red-100"
          : "border-emerald-500/60 bg-emerald-100",
        children == null ? "top-0 -translate-y-full" : "top-[80px]",
      )}
    >
      <span>{children}</span>
      <button onClick={onClose}>
        <FiX />
      </button>
    </div>
  )
}

export default NotificationSnackBar
