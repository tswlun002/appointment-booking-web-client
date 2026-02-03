import { colors } from "~/resources/colors/colors";

export function Spinner() {
    return (
        <div className="flex items-center justify-center">
            <div
                className="inline-block h-5 w-5 mx-1 animate-spin rounded-full border-4 border-solid border-t-transparent"
                style={{ borderColor: colors.primary, borderTopColor: 'transparent' }}
                role="status"
            >
                <span className="sr-only" style={{ color: colors.white }}>Loading...</span>
            </div>
        </div>
    );
}
