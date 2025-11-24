import React from "react"
import Svg, { Path } from "react-native-svg"

type TrashIconProps = {
    size?: number
}

export function TrashIcon({ 
    size = 20,
}: TrashIconProps) {
  return (
    <Svg 
        width={size} 
        height={size} 
        viewBox="0 0 20 20" 
        fill="none"
    >
        <Path 
            d="M3 5.33333H16.3333M8 8.66667V13.6667M11.3333 8.66667V13.6667M3.83333 5.33333L4.66667 15.3333C4.66667 15.7754 4.84226 16.1993 5.15482 16.5118C5.46738 16.8244 5.89131 17 6.33333 17H13C13.442 17 13.866 16.8244 14.1785 16.5118C14.4911 16.1993 14.6667 15.7754 14.6667 15.3333L15.5 5.33333M7.16667 5.33333V2.83333C7.16667 2.61232 7.25446 2.40036 7.41074 2.24408C7.56702 2.0878 7.77899 2 8 2H11.3333C11.5543 2 11.7663 2.0878 11.9226 2.24408C12.0789 2.40036 12.1667 2.61232 12.1667 2.83333V5.33333" 
            stroke="#F05E5E" 
            strokeWidth={2}
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </Svg>
  )
}
