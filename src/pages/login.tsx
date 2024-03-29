import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useLiffOperation, useUser } from "../provider/LiffProvider"
import { useUnauthRoute } from "../utils/useRoute"

const Login = () => {
  useUnauthRoute()

  const { login } = useLiffOperation()
  const router = useRouter()
  const { user } = useUser()

  useEffect(() => {
    if (user != null) {
      router.push("/")
    }
  }, [router, user])

  return (
    <>
      <Head>
        <title>ふろちゃでぼっと</title>
      </Head>
      <div className="h-screen bg-gray-800">
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className=" flex h-[50%] w-[800px] max-w-[90%] flex-col items-center justify-evenly rounded-lg border bg-white shadow">
            <div className="text-3xl font-bold">ふろちゃでぼっと</div>
            <button
              onClick={() => login()}
              className="px-8 py-4 text-xl font-extrabold text-white bg-green-500 border-2 border-green-500 rounded-full w-max"
            >
              LINEでログイン
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
