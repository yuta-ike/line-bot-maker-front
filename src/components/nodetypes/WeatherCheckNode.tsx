import { useEffect, useState } from "react"
import { GraphNodeClass } from "../editor/node"
import Select from "react-select"

// type Props = {
//   node: GraphNodeClass
// }

const WeatherCheckNode = () => {
  const [selectedPrefecture, setSelectdePrefecture] = useState({
    value: "Hokkaido",
    label: "北海道",
  })
  // const options = [
  //   { value: "chocolate", label: "Chocolate" },
  //   { value: "strawberry", label: "Strawberry" },
  //   { value: "vanilla", label: "Vanilla" },
  // ]
  const options = [
    { value: "Kyoto", label: "京都" },
    { value: "Tokyo", label: "東京" },
    { value: "Osaka", label: "大阪" },
    { value: "Aichi", label: "愛知" },
    { value: "Hokkaido", label: "北海道" },
  ]

  return (
    <div>
      <div className="text-xs">天気予報</div>
      <Select
        options={options}
        placeholder="選択してください"
        defaultValue={{ value: "Hokkaido", label: "北海道" }}
        // inputId="value"
        // value={selectedPrefecture}
        onChange={(value) => {
          setSelectdePrefecture(value!)
        }}
      />
      {/* <div className="text-black"></div> */}
    </div>
  )
}

export default WeatherCheckNode
