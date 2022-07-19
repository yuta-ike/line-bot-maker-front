const BottomBar = () => {
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
          <div
            className="m-4 h-12 w-20 rounded bg-red-300 p-4 text-center shadow-md"
            onClick={() => {}}
          >
            公開
          </div>
        </div>
      </div>
    </>
  )
}

export default BottomBar
