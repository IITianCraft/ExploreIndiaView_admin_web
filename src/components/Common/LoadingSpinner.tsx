export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center p-8">
            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );
}
