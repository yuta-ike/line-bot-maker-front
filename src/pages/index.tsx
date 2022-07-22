import type { NextPage } from "next"
import { BsFillFileCodeFill } from "react-icons/bs"
import Header from "../modules/Header"
import { useUser, useLiffOperation } from "../provider/LiffProvider"

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

type TodoItem = {
  id: number
  content: string
}

const Home: NextPage = () => {
  return (
    <div className="mt-20 bg-fixed p-4 font-mplus">
      <Header />
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col items-center">
          <div className="flex flex-row">
            <input
              className="container h-8 w-64 border border-gray-300 bg-gray-100 font-mplus"
              type="text"
              name="search"
              placeholder="キーワードを入力"
            />
            <div className="w-4" />
            <input
              className="container w-12 border border-black"
              type="submit"
              name="submit"
              value="検索"
            />
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
