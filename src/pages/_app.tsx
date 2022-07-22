import "../styles/globals.css"
import type { AppProps } from "next/app"
import LiffProvider from "../provider/LiffProvider"
import { NotificationSnackBarProvider } from "../components/NotificationSnackBar"

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <NotificationSnackBarProvider>
      <LiffProvider>
        <Component {...pageProps} />
      </LiffProvider>
    </NotificationSnackBarProvider>
  )
}

export default App
