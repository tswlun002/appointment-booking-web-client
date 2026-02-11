import { colors } from "~/resources/colors/colors";

interface SpinnerProps {
    color?: string;
    className?: string;
}

export function Spinner({ color = colors.primary, className = "h-5 w-5" }: SpinnerProps) {
    return (
        <div className="flex items-center justify-center">
            <div
                className={`inline-block mx-1 animate-spin rounded-full border-2 border-solid border-t-transparent ${className}`}
                style={{ borderColor: color, borderTopColor: 'transparent' }}
                role="status"
            >
                <span className="sr-only" style={{ color: colors.white }}>Loading...</span>
            </div>
        </div>
    );
}
