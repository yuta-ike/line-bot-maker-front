import "../styles/globals.css"
import type { AppProps } from "next/app"
import LiffProvider from "../provider/LiffProvider"

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <LiffProvider>
      <Component {...pageProps} />
    </LiffProvider>
  )
}

export default App
