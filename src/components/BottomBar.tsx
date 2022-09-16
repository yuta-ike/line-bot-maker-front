import { useEffect, useState } from "react"
import Image from "next/image"
import Modal from "react-modal"
import { useSnackBar } from "./NotificationSnackBar"
import generateQR from "./utils/genQR"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL as string

export type BottomBarProps = {
  botId: string
  onSave: () => Promise<boolean> | boolean
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
    const res = await onSave()
    if (res) {
      showSnackBar("ok", "保存しました!!")
    }
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
            className="w-20 h-12 p-4 m-4 leading-none text-center bg-gray-300 rounded shadow-md"
            onClick={handleDelete}
          >
            削除
          </button>
          <button
            className="h-12 p-4 m-4 leading-none text-center bg-gray-300 rounded shadow-md"
            onClick={handleReset}
          >
            リセット
          </button>
        </div>
        <div className="flex">
          <button
            className="h-12 p-4 m-4 leading-none text-center bg-gray-300 rounded shadow-md"
            onClick={handleSave}
          >
            保存
          </button>
          <button
            className="h-12 p-4 m-4 leading-none text-center bg-red-300 rounded shadow-md"
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
            overlayClassName="z-50 fixed inset-0 bg-black/40"
          >
            <div className="mx-auto w-[540px] max-w-[80%]">
              <h1 className="mb-4 text-xl">Botを保存しました！</h1>
              <p>
                QRコードをスマートフォンで読み取るか、「共有URLのシェア」、「LINEのシェア」のいずれかで利用してみましょう
              </p>
              <div className="flex justify-center w-full py-4">
                <Image
                  src={qrImage}
                  alt=""
                  width="120px"
                  height="120px"
                  className="mx-auto"
                />
              </div>
              <div className="flex w-full">
                <button
                  className="flex-1 h-12 p-4 mt-4 ml-4 leading-none text-center bg-gray-300 rounded shadow-md"
                  onClick={handleCopyUrl}
                >
                  共有URLをコピー
                </button>
                <button
                  className="flex-1 w-40 h-12 p-4 mt-4 ml-4 leading-none text-center bg-red-300 rounded shadow-md"
                  onClick={shareLink}
                >
                  LINEにシェアする
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </>
  )
}

export default BottomBar
