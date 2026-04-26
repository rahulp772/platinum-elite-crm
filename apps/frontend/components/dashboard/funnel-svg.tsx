"use client"

import React from "react"
import { motion } from "framer-motion"

interface FunnelData {
  stage: string
  count: number
}

interface FunnelSVGProps {
  data: FunnelData[]
}

const STAGE_COLORS = [
  "#0F172A", // Discovery (Navy)
  "#1E293B", // Engagement
  "#334155", // Qualification
  "#B48A3A", // Negotiation
  "#D4AF37", // Conversion (Gold)
]

export function FunnelSVG({ data }: FunnelSVGProps) {
  const width = 600
  const height = 400
  const total = data.reduce((sum, d) => sum + d.count, 0)
  const firstStageCount = data[0]?.count || 1

  const minHeight = 60
  const padding = 12
  const availableHeight = height - (data.length * padding)
  const stagesWithHeights = data.map(d => {
    const proportion = total > 0 ? d.count / total : 1 / data.length
    return {
      ...d,
      h: Math.max(minHeight, proportion * availableHeight)
    }
  })

  const actualTotalHeight = stagesWithHeights.reduce((sum, d) => sum + d.h, 0)
  const scaleY = (height - (data.length * padding)) / actualTotalHeight

  let currentY = 0
  const funnelWidth = 280
  const segments = stagesWithHeights.map((d, i) => {
    const h = d.h * scaleY
    const topY = currentY
    const bottomY = currentY + h

    const topWidthFactor = 1 - (topY / height) * 0.45
    const bottomWidthFactor = 1 - (bottomY / height) * 0.45

    const x1 = (funnelWidth * (1 - topWidthFactor)) / 2
    const x2 = funnelWidth - x1
    const x3 = (funnelWidth * (1 - bottomWidthFactor)) / 2
    const x4 = funnelWidth - x3

    // Create a path with slightly rounded corners
    const r = 4
    const path = `
      M ${x1 + r} ${topY} 
      L ${x2 - r} ${topY} 
      Q ${x2} ${topY} ${x2 - (x2 - x4) * (r / h)} ${topY + r}
      L ${x4 + (x2 - x4) * (r / h)} ${bottomY - r}
      Q ${x4} ${bottomY} ${x4 - r} ${bottomY}
      L ${x3 + r} ${bottomY}
      Q ${x3} ${bottomY} ${x3 + (x1 - x3) * (r / h)} ${bottomY - r}
      L ${x1 - (x1 - x3) * (r / h)} ${topY + r}
      Q ${x1} ${topY} ${x1 + r} ${topY}
      Z
    `

    const conversion = firstStageCount > 0 ? ((d.count / firstStageCount) * 100).toFixed(0) : "0"

    const res = {
      ...d,
      path,
      color: STAGE_COLORS[i % STAGE_COLORS.length],
      centerTextY: topY + h / 2,
      conversion,
      topY,
      bottomY,
    }

    currentY += h + padding
    return res
  })

  return (
    <div className="relative w-full aspect-[16/10] flex items-center justify-center p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {segments.map((s, i) => (
            <React.Fragment key={`defs-${i}`}>
              <linearGradient id={`grad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={s.color} stopOpacity={1} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id={`glossy-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="white" stopOpacity={0.15} />
                <stop offset="50%" stopColor="white" stopOpacity={0} />
                <stop offset="100%" stopColor="white" stopOpacity={0.05} />
              </linearGradient>
            </React.Fragment>
          ))}
        </defs>

        {/* Background Decorative Grid */}
        <g opacity="0.03">
          {[...Array(10)].map((_, i) => (
            <line key={i} x1="0" y1={i * 40} x2={width} y2={i * 40} stroke="currentColor" strokeWidth="1" />
          ))}
        </g>

        {segments.map((s, i) => (
          <g key={s.stage} className="group">
            <motion.g
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              whileHover={{ scale: 1.02, x: 5 }}
            >
              <path
                d={s.path}
                fill={`url(#grad-${i})`}
                className="drop-shadow-md"
              />
              <path
                d={s.path}
                fill={`url(#glossy-${i})`}
              />
              <path
                d={s.path}
                fill="none"
                stroke="white"
                strokeOpacity="0.1"
                strokeWidth="1"
              />
            </motion.g>

            <text
              x={funnelWidth / 2}
              y={s.centerTextY}
              textAnchor="middle"
              className="fill-white font-medium text-[14px] pointer-events-none uppercase tracking-[0.1em]"
              dy=".3em"
            >
              {s.stage}
            </text>

            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
              d={`M ${funnelWidth - 10} ${s.centerTextY} L ${funnelWidth + 50} ${s.centerTextY}`}
              stroke={s.color}
              strokeWidth="2"
              fill="none"
              strokeDasharray="1 4"
              strokeLinecap="round"
              opacity="0.5"
            />

            <motion.polygon
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.8, scale: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              points={`${funnelWidth + 45},${s.centerTextY - 5} ${funnelWidth + 55},${s.centerTextY} ${funnelWidth + 45},${s.centerTextY + 5}`}
              fill={s.color}
            />

            <motion.g
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
            >
              <text
                x={funnelWidth + 70}
                y={s.centerTextY}
                className="fill-slate-800 dark:fill-slate-200 font-bold text-[18px] tracking-tight"
                dy=".3em"
              >
                {s.count} <tspan className="text-[12px] opacity-50 uppercase font-medium">Leads</tspan>
              </text>

              <text
                x={width - 20}
                y={s.centerTextY}
                textAnchor="end"
                className="fill-realty-gold font-black text-[22px] tabular-nums"
                dy=".3em"
              >
                ({s.conversion}%)
              </text>

              <line
                x1={funnelWidth + 185}
                y1={s.topY + 5}
                x2={funnelWidth + 185}
                y2={s.bottomY - 5}
                stroke="currentColor"
                strokeWidth="1"
                className="opacity-10"
              />
            </motion.g>
          </g>
        ))}
      </svg>
    </div>
  )
}
