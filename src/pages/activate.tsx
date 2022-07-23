import axios from "axios"
import { NextPage } from "next"
import { useRouter } from "next/router"
import { useEffect } from "react"
import Header from "../modules/Header"
import { useLiffOperation, useUser } from "../provider/LiffProvider"

const LINE_BOT_BASIC_ID = process.env.NEXT_PUBLIC_LINE_BOT_BASIC_ID as string

const Activate: NextPage = () => {
  const router = useRouter()
  const user = useUser()
  const botId = router.query.botId
  const { login } = useLiffOperation()

  useEffect(() => {
    login(window.location.href)
  }, [login, router.asPath])

  useEffect(() => {
    if (user == null || botId == null) {
      return
    }
    // NOTE: API呼び出し: POST /bot/:bot_id/activate
    console.log(botId, user?.id)
  }, [botId, user, user?.id])

  return (
    <section>
      <Header />
      <div className="flex h-screen w-screen flex-col items-center justify-center px-4 pb-[120px]">
        <div className="text-gray-700">
          Botが利用可能になりました <span className="text-xl">🎉</span>
        </div>
        <a
          href={`https://line.me/R/ti/p/${LINE_BOT_BASIC_ID}`}
          className="mx-12 mt-6 w-full rounded bg-[#06c755] py-3 text-center text-lg text-white shadow"
        >
          さっそく利用する
        </a>
      </div>
    </section>
  )
}

export default Activate
