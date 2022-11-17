import "../styles/globals.css"
import type { AppProps } from "next/app"
import LiffProvider, { useUser } from "../provider/LiffProvider"
import { NotificationSnackBarProvider } from "../components/NotificationSnackBar"

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <NotificationSnackBarProvider>
      <LiffProvider>
        <AuthLoading>
          <Component {...pageProps} />
        </AuthLoading>
      </LiffProvider>
    </NotificationSnackBarProvider>
  )
}

export default App

const AuthLoading: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading } = useUser()
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center text-xl font-bold text-gray-600">
        読み込み中...
      </div>
    )
  }

  return <>{children}</>
}
