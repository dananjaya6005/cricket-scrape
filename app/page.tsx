"use client"

import { useEffect, useState } from "react"

interface Batsman {
  name: string
  runs: string
  balls: string
  fours: string
  sixes: string
  sr: string
}

interface Bowler {
  name: string
  figures: string
  overs: string
  econ: string
}

interface MatchData {
  matchTitle: string
  team1: { name: string | null; flag: string | null; score: string; overs: string }
  team2: { name: string | null; flag: string | null }
  runRates: string[]
  result: string
  batsmen: Batsman[]
  bowler: Bowler | null
}

export default function CricketScoreboard() {
  const [data, setData] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/scrape")
        const d = await res.json()
        setData(d)
        setLoading(false) // only for first fetch
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)

    // Cleanup on unmount
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="w-full h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl font-bold">Loading Live Cricket...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-full h-20 bg-gradient-to-r from-red-600 via-red-500 to-red-600 flex items-center justify-center">
        <div className="text-white text-xl font-bold">Failed to Load Data</div>
      </div>
    )
  }

  const activeBatsmen = data.batsmen.slice(0, 2)

  // Extract current run rate from runRates array
  const currentRate =
    data.runRates
      .find((rate) => rate.includes("Current Rate"))
      ?.split(":")[1]
      ?.trim() || "7.86"

  return (
    <div
      className="w-full h-20 relative overflow-hidden font-sans"
      style={{
        background: `linear-gradient(135deg, 
          rgba(30, 64, 175, 0.95) 0%, 
          rgba(109, 40, 217, 0.9) 25%, 
          rgba(30, 64, 175, 0.95) 50%, 
          rgba(109, 40, 217, 0.9) 75%, 
          rgba(30, 64, 175, 0.95) 100%)`,
      }}
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center">
          {data.team1.flag && (
            <img
              src={data.team1.flag || "/placeholder.svg"}
              alt={data.team1.name || "Team 1"}
              className="w-16 h-12 object-cover rounded-sm  border-white shadow-lg"
            />
          )}
        </div>

        <div className="flex items-center bg-black/60 rounded-lg px-6 py-2 shadow-xl border border-white/20">
          <div className="text-center">
            <div className="flex items-center gap-4">
              <span className="text-white font-bold text-lg tracking-wider">
                {data.team1.name?.substring(0, 3).toUpperCase() || "T1"}
              </span>
              <span className="text-white font-bold text-3xl">{data.team1.score}</span>
              <span className="text-gray-300 text-lg">{data.team1.overs}</span>
            </div>
          </div>
        </div>

        {/* Current Rate Display */}
        <div className="text-center bg-black/40 rounded-lg px-4 py-2 border border-white/20">
          <div className="text-xs text-gray-200 uppercase tracking-wide font-semibold">CURRENT RATE</div>
          <div className="text-2xl font-bold text-white">{currentRate}</div>
        </div>

        <div className="flex gap-10">
          {activeBatsmen.map((batsman, index) => {
            const lastName = batsman.name.split(" ").pop()?.toUpperCase() || batsman.name.toUpperCase()
            const isNotOut = batsman.runs.includes("*")
            const runs = batsman.runs.replace("*", "")

            return (
              <div key={index} className="text-center">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-lg tracking-wide"> {batsman.name}</span>
                  <span className="text-white font-bold text-xl">
                    {runs}
                    {isNotOut && <span className="text-yellow-300">*</span>}
                  </span>
                  <span className="text-gray-200 text-sm">({batsman.balls})</span>
                </div>
              </div>
            )
          })}
        </div>

        {data.bowler && (
          <div className="text-center">
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-lg tracking-wide">
                ⚾ {data.bowler.name.split(" ").pop()?.toUpperCase() || data.bowler.name.toUpperCase()}
              </span>
              <span className="text-white font-bold text-lg">{data.bowler.figures}</span>
            </div>
          </div>
        )}

        <div className="flex items-center">
          {data.team2.flag && (
            <img
              src={data.team2.flag || "/placeholder.svg"}
              alt={data.team2.name || "Team 2"}
              className="w-16 h-12 object-cover rounded-sm  border-white shadow-lg"
            />
          )}
        </div>

  
      </div>
    </div>
  )
}
