import { CONTACT_SUPPORT_TEAM_MESSAGE, PAGE_NOT_FOUND_MESSAGE } from "~/resources/label/auth-labels";
import { colors, typography } from "~/resources/colors/colors";

const PageNotFound = () => {
    return (
        <div
            className="flex flex-col justify-center items-center min-h-screen gap-8 px-4"
            style={{ backgroundColor: colors.bgLight }}
        >
            {/* Capitec Logo with zoom in/out animation */}
            <div className="relative">
                <img
                    src="/capitec.svg"
                    alt="Capitec"
                    className="w-24 h-24 md:w-32 md:h-32 animate-pulse-zoom"
                />
            </div>

            {/* 404 Text */}
            <h1
                className="font-bold tracking-tight"
                style={{
                    color: colors.primaryDark,
                    fontSize: typography.h1.fontSize,
                    fontWeight: typography.h1.fontWeight,
                    lineHeight: typography.h1.lineHeight
                }}
            >
                404
            </h1>

            {/* Messages */}
            <div className="text-center max-w-md space-y-4">
                <p
                    style={{
                        color: colors.textPrimary,
                        fontSize: typography.h4.fontSize,
                        fontWeight: typography.h4.fontWeight,
                        lineHeight: typography.h4.lineHeight
                    }}
                >
                    {PAGE_NOT_FOUND_MESSAGE}
                </p>
                <p
                    style={{
                        color: colors.textMuted,
                        fontSize: typography.body.fontSize,
                        fontWeight: typography.body.fontWeight,
                        lineHeight: typography.body.lineHeight
                    }}
                >
                    {CONTACT_SUPPORT_TEAM_MESSAGE}
                </p>
            </div>

            {/* Back to Home Button */}
            <a
                href="/"
                className="mt-4 px-6 py-3 rounded-full font-semibold transition-opacity hover:opacity-90"
                style={{
                    backgroundColor: colors.primary,
                    color: colors.white,
                    fontSize: typography.button.fontSize,
                    fontWeight: typography.button.fontWeight
                }}
            >
                Back to Home
            </a>

            {/* CSS for zoom animation */}
            <style>{`
                @keyframes pulseZoom {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.15);
                        opacity: 0.8;
                    }
                }
                .animate-pulse-zoom {
                    animation: pulseZoom 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default PageNotFound;