import { useState } from "react"
import Modal from "react-modal"
import ReleasePopUp from "./presentation/ReleasePopUp"

const BottomBar = () => {
  const [modalIsOpen, setIsOpen] = useState(false)
  // モーダルを開く処理
  const openModal = () => {
    setIsOpen(true)
  }

  const afterOpenModal = () => {
    // モーダルが開いた後の処理
  }

  // モーダルを閉じる処理
  const closeModal = () => {
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

  return (
    <>
      <div className="flex justify-between">
        <div
          className="m-4 h-12 w-20 rounded bg-gray-300 p-4 text-center shadow-md"
          onClick={() => {}}
        >
          消去
        </div>
        <div className="flex">
          <div
            className="w-30 m-4 h-12 rounded bg-gray-300 p-4 text-center shadow-md"
            onClick={() => {}}
          >
            一時保存
          </div>
          {/* <div
            className="m-4 h-12 w-20 rounded bg-red-300 p-4 text-center shadow-md"
            onClick={() => {
              modalIsOpen ? closeModal : openModal
            }}
          >
            公開
          </div> */}
          <button
            className="m-4 h-12 w-20 rounded bg-red-300 p-4 text-center shadow-md"
            onClick={openModal}
          >
            公開
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
            <h1>こんにちは！！</h1>
            <button
              className="m-4 h-12 w-20 rounded bg-gray-300 p-4 text-center shadow-md"
              onClick={closeModal}
            >
              close
            </button>
          </Modal>
        </div>
      </div>
    </>
  )
}

export default BottomBar
