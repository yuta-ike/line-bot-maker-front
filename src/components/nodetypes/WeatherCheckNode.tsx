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
    <div className="flex items-center space-x-2 text-sm">
      <p>天気予報</p>
      <select
        placeholder="選択してください"
        value={selectedPrefecture}
        className="px-2 py-1 text-black rounded focus:outline-none"
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
