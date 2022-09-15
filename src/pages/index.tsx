import type { NextPage } from "next"
import { useCallback, useMemo, useState } from "react"
import { BsFillFileCodeFill } from "react-icons/bs"
import Header from "../modules/Header"
import { useUser } from "../provider/LiffProvider"
import genId from "../components/utils/genId"
import { useRouter } from "next/router"
import { createBot, useBots } from "../services/api_service"
import Link from "next/link"
import Head from "next/head"
import { FiSearch } from "react-icons/fi"
import Image from "next/image"
import { searchText } from "../components/utils/search"

export type FileComponentProps = {
  botId: string
  name: string
  creatorName: string
  creatorIconUrl: string
}

const FileComponent: React.FC<FileComponentProps> = ({
  botId,
  name,
  creatorName,
  creatorIconUrl,
}) => {
  return (
    <Link href={`/bot/${botId}`}>
      <a className="flex w-full flex-col items-center">
        <div className="flex w-full items-center justify-center rounded-lg bg-gray-300 py-10">
          <BsFillFileCodeFill size={64} />
        </div>
        <div className="my-1 flex w-full space-x-4 text-start text-lg">
          {/* <Image
              src={creatorIconUrl}
              width={32}
              height={32}
              alt=""
              className="rounded-full"
            /> */}
          <span>{name}</span>
        </div>
      </a>
    </Link>
  )
}

const Home: NextPage = () => {
  const router = useRouter()
  const user = useUser()

  const [searchInput, setSearchInput] = useState("")

  const { data: bots } = useBots({ me: true })

  /**
   * 新しいBotの作成
   */
  const handleCreate = useCallback(async () => {
    if (user == null) {
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
            className="rounded bg-green-500 p-4 text-white hover:bg-green-600"
          >
            新しいBotを作る
          </button>
        </div>
        <div className="flex flex-col items-center">
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
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {filteredBot?.map((bot: any) => (
              <FileComponent
                key={bot.bot_id}
                botId={bot.bot_id}
                name={bot.name}
                creatorName={bot.created_by.name}
                creatorIconUrl={bot.created_by.picture}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
