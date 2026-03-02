import React from "react"
import Svg, { Path } from "react-native-svg"

type CloseIconProps = {
    size?: number
}

export function CloseIcon({ 
    size = 18,
}: CloseIconProps) {
  return (
    <Svg 
        width={size} 
        height={size} 
        viewBox="0 0 20 20" 
        fill="none"
    >
        <Path
            d="M18 6L6 18M6 6l12 12"
            stroke="#111"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
  )
}
