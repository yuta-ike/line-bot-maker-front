import type { NextPage } from "next"
import { BsFillFileCodeFill } from "react-icons/bs"
import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"

const FileComponent: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <a href="https://ja.wikipedia.org/wiki/%E6%AF%9B%E5%88%A9%E5%B0%8F%E4%BA%94%E9%83%8E">
        <BsFillFileCodeFill size={128} />
      </a>
      <div className="pb-1" />
      <a
        href="https://ja.wikipedia.org/wiki/%E6%9C%8D%E9%83%A8%E5%B9%B3%E6%AC%A1"
        className="rounded-lg bg-amber-200 font-serif text-xl"
      >
        せやかて工藤
      </a>
      <div className="pb-2" />
    </div>
  )
}

const Home: NextPage = () => {
  return (
    <div className="bg-fixed p-4">
      <h1 className="text-center text-4xl font-semibold text-green-700">
        ここは名古屋の別天地・竜泉寺の湯
      </h1>
      <div className="text-center text-2xl font-extrabold text-red-700">
        恋人はサンタクロース
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <FileComponent />
        <FileComponent />
        <FileComponent />
        <FileComponent />
        <FileComponent />
        <FileComponent />
        <FileComponent />
      </div>
    </div>
  )
}

export default Home
