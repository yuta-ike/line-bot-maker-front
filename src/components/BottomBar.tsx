import { useEffect, useState } from "react"
import Image from "next/image"
import Modal from "react-modal"
import { useSnackBar } from "./NotificationSnackBar"
import generateQR from "./utils/genQR"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL as string

export type BottomBarProps = {
  botId: string
  onSave: () => Promise<void> | void
  onShare: () => Promise<void> | void
  onDelete: () => Promise<void> | void
  onReset: () => void
}

const BottomBar: React.FC<BottomBarProps> = ({
  botId,
  onSave,
  onShare,
  onDelete,
  onReset,
}) => {
  const showSnackBar = useSnackBar()
  const [modalIsOpen, setIsOpen] = useState(false)

  // モーダルを開く処理
  const openModal = async () => {
    await onSave()
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
  const shareLink = async () => {
    try {
      await onShare()
    } catch {
      showSnackBar("error", "エラーが発生しました")
    } finally {
      setIsOpen(false)
    }
  }

  const handleSave = async () => {
    await onSave()
    showSnackBar("ok", "保存しました!!")
  }

  const handleDelete = async () => {
    await onDelete()
  }

  const handleReset = () => {
    const res = window.confirm("リセットしますか？")
    if (!res) {
      return
    }
    onReset()
    showSnackBar("ok", "リセットしました")
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

  const shareUrl = `${APP_URL}/activate?botId=${botId}`

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setIsOpen(false)
    showSnackBar("ok", "URLをクリップボードにコピーしました")
  }

  const [qrImage, setQrImage] = useState("")

  useEffect(() => {
    generateQR(shareUrl).then(setQrImage)
  }, [shareUrl])

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 flex justify-between">
        <div>
          <button
            className="m-4 h-12 w-20 rounded bg-gray-300 p-4 text-center leading-none shadow-md"
            onClick={handleDelete}
          >
            削除
          </button>
          <button
            className="m-4 h-12 rounded bg-gray-300 p-4 text-center leading-none shadow-md"
            onClick={handleReset}
          >
            リセット
          </button>
        </div>
        <div className="flex">
          <button
            className="m-4 h-12 rounded bg-gray-300 p-4 text-center leading-none shadow-md"
            onClick={handleSave}
          >
            保存
          </button>
          <button
            className="m-4 h-12 rounded bg-red-300 p-4 text-center leading-none shadow-md"
            onClick={openModal}
          >
            保存して公開
          </button>
          <Modal
            style={customStyles}
            // isOpenがtrueならモダールが起動する
            isOpen={modalIsOpen}
            // モーダルが開いた後の処理を定義
            onAfterOpen={afterOpenModal}
            // モーダルを閉じる処理を定義
            onRequestClose={closeModal}
          >
            <h1>Botを保存しました！！</h1>
            {/* <button
              className="mr-4 h-12 w-20 rounded bg-gray-300 p-4 text-center leading-none shadow-md"
              onClick={closeModal}
            >
              とじる
            </button> */}
            <div className="flex w-full justify-center py-4">
              <Image
                src={qrImage}
                alt=""
                width="120px"
                height="120px"
                className="mx-auto"
              />
            </div>
            <div>
              <button
                className="ml-4 mt-4 h-12 rounded bg-gray-300 p-4 text-center leading-none shadow-md"
                onClick={handleCopyUrl}
              >
                共有URLをコピー
              </button>
              <button
                className="ml-4 mt-4 h-12 w-40 rounded bg-red-300 p-4 text-center leading-none shadow-md"
                onClick={shareLink}
              >
                友達にシェアする
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </>
  )
}

export default BottomBar
