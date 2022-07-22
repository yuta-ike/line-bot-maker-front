import axios from "axios"
import type { NextPage } from "next"
import { useCallback, useState } from "react"
import { BsFillFileCodeFill } from "react-icons/bs"
import Header from "../modules/Header"
import { useUser, useLiffOperation } from "../provider/LiffProvider"
import { nanoid } from "nanoid"
import genId from "../components/utils/genId"
import { useRouter } from "next/router"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string

const FileComponent: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <a href="https://ja.wikipedia.org/wiki/%E6%AF%9B%E5%88%A9%E5%B0%8F%E4%BA%94%E9%83%8E">
        <BsFillFileCodeFill size={128} />
      </a>
      <div className="pb-1" />
      <a
        href="https://ja.wikipedia.org/wiki/%E6%9C%8D%E9%83%A8%E5%B9%B3%E6%AC%A1"
        className="rounded-lg bg-amber-200 text-xl"
      >
        せやかて工藤
      </a>
      <div className="pb-2" />
    </div>
  )
}

const Home: NextPage = () => {
  const router = useRouter()
  const user = useUser()

  const [searchInput, setSearchInput] = useState("")

  /**
   * 新しいBotの作成
   */
  const handleCreate = useCallback(async () => {
    if (user == null) {
      return
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/getIdToken/bot`, {
        bot_id: genId(),
        name: "新しいプログラム",
        flowChart: "[]",
        developerId: user.id,
      })
      router.push(`/bot/${res.data.bot_id}`)
    } catch {
      window.alert("エラーが発生しました")
    }
  }, [router, user])

  // NOTE: API呼び出し: GET /bot

  return (
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
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col items-center">
          <div className="flex flex-row">
            <input
              className="container h-8 w-64 border border-gray-300 bg-gray-100 font-mplus"
              type="text"
              name="search"
              placeholder="キーワードを入力"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className="w-4" />
            <button className="container w-12 border border-black">検索</button>
          </div>
        </div>
      </form>
      <div className="mt-4 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-5">
          <div />
          <FileComponent />
          <FileComponent />
          <FileComponent />
          <div />
          <div />
          <FileComponent />
          <FileComponent />
          <FileComponent />
          <div />
          <div />
          <FileComponent />
          <div />
        </div>
      </div>
    </div>
  )
}

export default Home
