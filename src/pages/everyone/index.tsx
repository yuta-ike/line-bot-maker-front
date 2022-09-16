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
    <div className="flex flex-col items-center w-full">
      <button
        className="relative flex items-center justify-center w-full py-4 overflow-hidden bg-gray-300 rounded-lg focus:outline-none"
        onClick={onClickCover}
      >
        <img
          src={creatorIconUrl}
          alt=""
          className="absolute inset-0 object-cover"
        />

        <div className="absolute inset-0 transition-all bg-black/30 backdrop-blur hover:backdrop-blur-0" />
        <HiArrowRight size={64} className="relative text-white" />
      </button>
      <div className="pb-2" />
      <div className="flex justify-start w-full space-x-4">
        <img src={creatorIconUrl} alt="" className="w-8 h-8 rounded-full" />
        <div className="w-full text-lg font-bold text-start">{name}</div>
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
        <title>ふろちゃでぼっと</title>
      </Head>
      <div className="p-4 mt-20 bg-fixed font-mplus">
        <Header />
        <div className="flex justify-end w-full">
          <button
            onClick={handleCreate}
            className="w-full p-4 text-white bg-green-500 rounded hover:bg-green-600 sm:w-max"
          >
            新しいBotを作る
          </button>
        </div>
        <div className="flex flex-col items-center mt-4">
          <div className="relative flex flex-row">
            <FiSearch
              size={24}
              className="absolute text-gray-400 -translate-y-1/2 top-1/2 left-4"
            />
            <input
              className="container h-8 py-6 pl-12 pr-8 bg-gray-100 border border-gray-300 border-none rounded-full w-72 font-mplus hover:bg-gray-200 focus:bg-gray-200 focus:outline-none"
              type="text"
              name="search"
              placeholder="キーワードを入力"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>
        <div className="p-4 mt-4">
          <div className="grid max-w-4xl gap-12 mx-auto md:grid-cols-2">
            {filteredBot?.map((bot: any) => (
              <div className="flex flex-col w-full" key={bot.bot_id}>
                <FileComponent
                  key={bot.bot_id}
                  botId={bot.bot_id}
                  name={bot.name}
                  creatorName={bot.created_by.name}
                  creatorIconUrl={bot.created_by.picture}
                  good={2}
                  onClickCover={() => handleClickTemplate(bot)}
                />
                <div className="flex flex-wrap items-center flex-raw">
                  <button
                    className="flex items-center px-3 py-1 mt-3 mr-3 transition bg-gray-200 rounded-full hover:bg-gray-300"
                    onClick={() => window.alert("ただいま実装中です")}
                  >
                    <TiHeartOutline size={24} />
                    <span className="ml-1 font-bold">0</span>
                  </button>
                  <button
                    className="px-6 py-1 mt-3 mr-3 font-semibold text-black transition bg-gray-200 rounded-full hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-300 disabled:hover:bg-gray-200"
                    disabled={user?.id === bot.created_by.user_id}
                    onClick={() => handleClickTemplate(bot)}
                  >
                    テンプレート
                  </button>
                  <button
                    className="px-6 py-1 mt-3 mr-3 font-semibold text-black transition bg-red-200 rounded-full hover:bg-red-300"
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
