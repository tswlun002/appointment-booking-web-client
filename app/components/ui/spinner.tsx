export function Spinner() {
    return (
        <div className="flex items-center justify-center">
            <div
                className="inline-block h-5 w-5 mx-1 animate-spin rounded-full border-4 border-solid border-gray-50 border-t-transparent"
                role="status"
            >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
}
