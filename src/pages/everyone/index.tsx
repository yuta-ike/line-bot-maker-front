import type { NextPage } from "next"
import { useCallback, useMemo, useState } from "react"
import { BsFillFileCodeFill } from "react-icons/bs"
import { HiArrowRight } from "react-icons/hi"
import { TiHeartOutline } from "react-icons/ti"
import Header from "../../modules/Header"
import { useUser } from "../../provider/LiffProvider"
import genId from "../../components/utils/genId"
import { useRouter } from "next/router"
import { activateBot, createBot, useBots } from "../../services/api_service"
import Link from "next/link"
import Head from "next/head"
import { FiSearch } from "react-icons/fi"
import { searchText } from "../../components/utils/search"

const LINE_BOT_BASIC_ID = process.env.NEXT_PUBLIC_LINE_BOT_BASIC_ID as string

export type FileComponentProps = {
  botId: string
  name: string
  creatorName: string
  creatorIconUrl: string
  good: number
  onClickCover: () => void
}

const FileComponent: React.FC<FileComponentProps> = ({
  botId,
  name,
  creatorName,
  creatorIconUrl,
  onClickCover,
}) => {
  return (
    <div className="flex w-full flex-col items-center">
      <button
        className="relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-gray-300 py-4 focus:outline-none"
        onClick={onClickCover}
      >
        <img
          src={creatorIconUrl}
          alt=""
          className="absolute inset-0 object-cover"
        />

        <div className="absolute inset-0 bg-black/30 backdrop-blur transition-all hover:backdrop-blur-0" />
        <HiArrowRight size={64} className="relative text-white" />
      </button>
      <div className="pb-2" />
      <div className="flex w-full justify-start space-x-4">
        <img src={creatorIconUrl} alt="" className="h-8 w-8 rounded-full" />
        <div className="w-full text-start text-lg font-bold">{name}</div>
      </div>
      <div className="pb-1" />
    </div>
  )
}

const Home: NextPage = () => {
  const router = useRouter()
  const user = useUser()

  const [searchInput, setSearchInput] = useState("")

  const { data: bots } = useBots()

  /**
   * 新しいBotの作成
   */
  const handleCreate = useCallback(async () => {
    if (user?.idToken == null) {
      return
    }
    try {
      const botId = genId()
      await createBot(user.idToken, botId, "新しいプログラム", "[]")

      router.push(`/bot/${botId}`)
    } catch {
      window.alert("エラーが発生しました")
    }
  }, [router, user])

  const filteredBot = useMemo(() => {
    if (bots == null) {
      return []
    }
    if (searchInput.length === 0) {
      return bots
    }
    return searchText(bots, ["name"], searchInput)
  }, [bots, searchInput])

  const handleUseBot = async (botId: string) => {
    if (user != null) {
      await activateBot(user.id, botId)
      router.push(`https://line.me/R/ti/p/${LINE_BOT_BASIC_ID}`)
    }
  }

  const handleClickTemplate = async (bot: any) => {
    if (user == null) {
      return
    }
    const botId = genId()
    await createBot(user.idToken, botId, bot.name, bot.flowchart)
    router.push(`/bot/${botId}`)
  }

  return (
    <>
      <Head>
        <title>LINE Bot Maker</title>
      </Head>
      <div className="mt-20 bg-fixed p-4 font-mplus">
        <Header />
        <div className="flex w-full justify-end">
          <button
            onClick={handleCreate}
            className="w-full rounded bg-green-500 p-4 text-white hover:bg-green-600 sm:w-max"
          >
            新しいBotを作る
          </button>
        </div>
        <div className="mt-4 flex flex-col items-center">
          <div className="relative flex flex-row">
            <FiSearch
              size={24}
              className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
            />
            <input
              className="container h-8 w-72 rounded-full border border-none border-gray-300 bg-gray-100 py-6 pl-12 pr-8 font-mplus hover:bg-gray-200 focus:bg-gray-200 focus:outline-none"
              type="text"
              name="search"
              placeholder="キーワードを入力"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 p-4">
          <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
            {filteredBot?.map((bot: any) => (
              <div className="flex w-full flex-col" key={bot.bot_id}>
                <FileComponent
                  key={bot.bot_id}
                  botId={bot.bot_id}
                  name={bot.name}
                  creatorName={bot.created_by.name}
                  creatorIconUrl={bot.created_by.picture}
                  good={2}
                  onClickCover={() => handleClickTemplate(bot)}
                />
                <div className="flex-raw flex flex-wrap items-center">
                  <button
                    className="mt-3 mr-3 flex items-center rounded-full bg-gray-200 px-3 py-1 transition hover:bg-gray-300"
                    onClick={() => window.alert("ただいま実装中です")}
                  >
                    <TiHeartOutline size={24} />
                    <span className="ml-1 font-bold">0</span>
                  </button>
                  <button
                    className="mt-3 mr-3 rounded-full bg-gray-200 px-6 py-1 font-semibold text-black transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-300 disabled:hover:bg-gray-200"
                    disabled={user?.id === bot.created_by.user_id}
                    onClick={() => handleClickTemplate(bot)}
                  >
                    テンプレート
                  </button>
                  <button
                    className="mt-3 mr-3 rounded-full bg-red-200 px-6 py-1 font-semibold text-black transition hover:bg-red-300"
                    onClick={() => handleUseBot(bot.id)}
                  >
                    使ってみる
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
