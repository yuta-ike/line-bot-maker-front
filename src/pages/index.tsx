import { NextPage } from "next"
import Link from "next/link"
import React from "react"

const index: NextPage = () => {
  return (
    <div>
      <h1>Topページ</h1>
      <Link href="/dashboard">
        <a className="text-blue-500 underline">ログインする</a>
      </Link>
    </div>
  )
}

export default index
