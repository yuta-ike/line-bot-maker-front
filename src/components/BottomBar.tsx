import { useState } from "react"
import Modal from "react-modal"
import { useLiff } from "../provider/LiffProvider"

export type BottomBarProps = {
  onSave: () => Promise<void> | void
}

const BottomBar: React.FC<BottomBarProps> = () => {
  const [modalIsOpen, setIsOpen] = useState(false)
  //const  = useContext(LiffContext)
  const liff = useLiff()
  //const liff2 = useLiff
  // モーダルを開く処理
  const openModal = async () => {
    await handleSave()
    setIsOpen(true)
  }

  const afterOpenModal = () => {
    // モーダルが開いた後の処理
  }

  // モーダルを閉じる処理
  const closeModal = () => {
    setIsOpen(false)
  }

  // 友達にシェアする処理
  const shareLink = () => {
    liff!
      .shareTargetPicker([
        {
          type: "text",
          text: "this is a test",
        },
      ])
      .then()
      .catch(function (res) {
        console.log(res)
      })
    setIsOpen(false)
  }
  // モーダルを画面中央に表示する用のスタイル
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  }

  const handleSave = async () => {}

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 flex justify-between">
        <button
          className="m-4 h-12 w-20 rounded bg-gray-300 p-4 text-center leading-none shadow-md"
          onClick={() => window.alert("未実装です")}
        >
          消去
        </button>
        <div className="flex">
          <button
            className="m-4 h-12 rounded bg-gray-300 p-4 text-center leading-none shadow-md"
            onClick={handleSave}
          >
            保存
          </button>
          {/* <div
            className="m-4 h-12 w-20 rounded bg-red-300 p-4 text-center shadow-md"
            onClick={() => {
              modalIsOpen ? closeModal : openModal
            }}
          >
            公開
          </div> */}
          <button
            className="m-4 h-12 rounded bg-red-300 p-4 text-center leading-none shadow-md"
            onClick={openModal}
          >
            保存して公開
          </button>
          <Modal
            //className={"flex bg-green-300"}
            style={customStyles}
            // isOpenがtrueならモダールが起動する
            isOpen={modalIsOpen}
            // モーダルが開いた後の処理を定義
            onAfterOpen={afterOpenModal}
            // モーダルを閉じる処理を定義
            onRequestClose={closeModal}
          >
            <h1>Botを保存しました！！</h1>
            <button
              className="m-4 h-12 w-20 rounded bg-gray-300 p-4 text-center leading-none shadow-md"
              onClick={closeModal}
            >
              close
            </button>
            <button
              className="m-4 h-12 w-40 rounded bg-red-300 p-4 text-center leading-none shadow-md"
              onClick={shareLink}
            >
              友達にシェアする
            </button>
          </Modal>
        </div>
      </div>
    </>
  )
}

export default BottomBar
