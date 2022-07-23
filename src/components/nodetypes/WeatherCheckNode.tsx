import { useState } from "react"

const WeatherCheckNode = () => {
  const [selectedPrefecture, setSelectdePrefecture] = useState("Hokkaido")

  const options = [
    { value: "Kyoto", label: "京都" },
    { value: "Tokyo", label: "東京" },
    { value: "Osaka", label: "大阪" },
    { value: "Aichi", label: "愛知" },
    { value: "Hokkaido", label: "北海道" },
  ]

  return (
    <div className="flex space-x-2">
      <div className="">天気予報</div>
      <select
        placeholder="選択してください"
        value={selectedPrefecture}
        className="rounded px-2 py-1 text-xs text-black"
        onChange={(e) => setSelectdePrefecture(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default WeatherCheckNode
