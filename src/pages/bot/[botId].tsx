import { NextPage } from "next"
import { useEffect, useState } from "react"
import BottomBar from "../../components/BottomBar"
import ComponentsSideList from "../../components/componetsSideList"
import TopBar from "../../components/TopBar"

const BotEdit: NextPage = () => {
  // const [pjName, setPJName] = useState("")
  // useEffect(() => {
  //   const writePJName = () => {
  //     setPJName()
  //   }

  // },[]);

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <main className="flex-grow">
          <TopBar />
          <div id="concept">
            <ComponentsSideList />
          </div>
        </main>
        <footer>
          <BottomBar />
        </footer>
      </div>
    </>
  )
}

export default BotEdit
