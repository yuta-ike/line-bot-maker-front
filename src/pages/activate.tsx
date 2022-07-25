import axios from "axios"
import { NextPage } from "next"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Header from "../modules/Header"
import { useLiffOperation, useUser } from "../provider/LiffProvider"
import { activateBot } from "../services/api_service"

const LINE_BOT_BASIC_ID = process.env.NEXT_PUBLIC_LINE_BOT_BASIC_ID as string

const Activate: NextPage = () => {
  const router = useRouter()
  const user = useUser()
  const [isActivated, setIsActivated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAlreadyActivated, setIsAlreadyActivated] = useState(false)
  const botId = router.query.botId
  const { login } = useLiffOperation()

  useEffect(() => {
    login(window.location.href)
  }, [login, router.asPath])

  useEffect(() => {
    if (
      isLoading ||
      isActivated ||
      user == null ||
      botId == null ||
      typeof botId !== "string"
    ) {
      return
    }
    setIsLoading(true)
    activateBot(user.id, botId)
      .then(() => {
        setIsActivated(true)
      })
      .catch((e: any) => {
        if (e.response.status === 409) {
          setIsAlreadyActivated(true)
          setIsActivated(true)
        } else {
          window.alert("エラーが発生しました")
          throw e
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [botId, isActivated, isLoading, user])

  return (
    <section>
      <Header />
      <div className="mx-auto flex h-screen w-screen max-w-lg flex-col items-center justify-center px-4 pb-[120px]">
        {isActivated ? (
          <>
            <div className="text-gray-700">
              {isAlreadyActivated ? (
                "Botは既に利用可能になっています"
              ) : (
                <>
                  Botが利用可能になりました <span className="text-xl">🎉</span>
                </>
              )}
            </div>
            <a
              href={`https://line.me/R/ti/p/${LINE_BOT_BASIC_ID}`}
              className="mx-12 mt-6 w-full rounded bg-[#06c755] py-3 text-center text-lg text-white shadow"
            >
              さっそく利用する
            </a>
          </>
        ) : (
          <div>読み込み中...</div>
        )}
      </div>
    </section>
  )
}

export default Activate
