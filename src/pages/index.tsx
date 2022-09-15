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
      <a className="flex flex-col items-center w-full">
        <div className="flex items-center justify-center w-full py-10 bg-gray-300 rounded-lg">
          <BsFillFileCodeFill size={64} />
        </div>
        <div className="flex w-full my-1 space-x-4 text-lg text-start">
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
      <div className="p-4 mt-20 bg-fixed font-mplus">
        <Header />
        <div className="flex justify-end w-full">
          <button
            onClick={handleCreate}
            className="p-4 text-white bg-green-500 rounded hover:bg-green-600"
          >
            新しいBotを作る
          </button>
        </div>
        <div className="flex flex-col items-center">
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
          <div className="grid max-w-4xl grid-cols-1 gap-4 mx-auto sm:grid-cols-3 md:grid-cols-4">
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
