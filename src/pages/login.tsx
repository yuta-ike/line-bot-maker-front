import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useLiffOperation, useUser } from "../provider/LiffProvider"

const Login = () => {
  const { login } = useLiffOperation()
  const router = useRouter()
  const user = useUser()

  //ログインしている場合のリダイレクト処理を書いたつもりだが，ログイン画面がローカル，ダッシュボードが本番環境のため正しく動くかどうかは現在不明
  useEffect(() => {
    user != null && router.push("/")
  })

  return (
    <>
      <Head>
        <title>LINE Bot Maker</title>
      </Head>
      <div className="h-screen bg-gray-800">
        <div className="flex h-full items-center justify-center bg-gray-100">
          <div className=" flex h-[50%] w-[800px] max-w-[90%] flex-col items-center justify-evenly rounded-lg border bg-white shadow">
            <div className="text-3xl font-bold">ふろちゃでぼっと</div>
            <button
              onClick={() => login()}
              className="w-max rounded-full border-2 border-green-500 bg-green-500 px-8 py-4 text-xl font-extrabold text-white"
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
