import type {FC} from "react";

interface NBIconProps {
    size?: number;
    color?: string;
    className?: string;
}

const NBIcon: FC<NBIconProps> = ({
                                           size = 120,
                                           color = 'red',
                                           className = ''
                                       }) => {
    return (
        <svg
            width={size}
            height={(size * 80) / 120}
            viewBox="0 0 120 80"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            style={{objectFit:"cover"}}
        >
            {/* NB Text */}
            <text
                x="60"
                y="35"
                fontFamily="Arial, sans-serif"
                fontSize="32"
                fontWeight="bold"
                textAnchor="middle"
                fill={color}
            >
                NB
            </text>

            {/* First underline */}
            <line
                x1="20"
                y1="50"
                x2="100"
                y2="50"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
            />

            {/* Second underline */}
            <line
                x1="25"
                y1="60"
                x2="95"
                y2="60"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
};

// Example usage with different props
export  default  NBIcon;