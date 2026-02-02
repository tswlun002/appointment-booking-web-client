import { colors } from "~/resources/colors/colors";

type LoaderProps = {
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
    message?: string;
};

const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
};

const Loader = ({ size = 'md', fullScreen = false, message }: LoaderProps) => {
    const containerClass = fullScreen
        ? 'fixed inset-0 z-50 flex flex-col justify-center items-center gap-4'
        : 'flex flex-col justify-center items-center gap-4 p-8';

    return (
        <div
            className={containerClass}
            style={{ backgroundColor: fullScreen ? colors.bgLight : 'transparent' }}
        >
            <div className="relative">
                <img
                    src="/capitec.svg"
                    alt="Loading"
                    className={`${sizeMap[size]} animate-pulse-zoom`}
                />
            </div>

            {message && (
                <p
                    className="text-sm font-medium animate-pulse"
                    style={{ color: colors.textMuted }}
                >
                    {message}
                </p>
            )}

            {/* CSS for zoom animation */}
            <style>{`
                @keyframes pulseZoom {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.15);
                        opacity: 0.85;
                    }
                }
                .animate-pulse-zoom {
                    animation: pulseZoom 1.8s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default Loader;
