import React from "react"
import Svg, { Circle, Path } from "react-native-svg"

type PlusIconProps = {
    size?: number
    bgColor?: string
}

export function PlusIcon({ 
    size = 35,
    bgColor = "#3C3B6E",
}: PlusIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 35 35"
      fill="none"
    >
      <Circle cx="17.5" cy="17.5" r="17.5" fill={bgColor} />

      <Path
        d="M23.464 18.114H19.02V22.668H16.688V18.114H12.244V16.002H16.688V11.448H19.02V16.002H23.464V18.114Z"
        fill="white"
      />
    </Svg>

  )
}
