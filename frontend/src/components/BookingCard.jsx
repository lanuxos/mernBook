export default function BookingCard({ item, onBook }) {
    const isVerified = item.isVerified;

    return (
        <div className="flex items-center border border-yellow-500 bg-black dark:bg-gray-800 rounded-lg p-3 shadow">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-500 rounded mr-3 flex items-center justify-center hover:scale-110 transform transition duration-300">📷</div>

            <div className="flex-1">
                <div className="font-semibold text-yellow dark:text-white">
                    {item.firstName} {item.lastName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                    Tel: {item.tel}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                    Specialty: {item.specialty || 'General'}
                </div>
                <div
                    className={`text-sm font-medium ${isVerified ? "text-green-500" : "text-red-500"
                        }`}
                >
                    {isVerified ? "✔ Verified" : "✖ Not Verified"}
                </div>
            </div>

            <div>
                <button
                    onClick={() => onBook(item)}
                    disabled={!isVerified}
                    className={`px-3 py-1 rounded ${isVerified
                            ? "bg-yellow-500 text-black hover:bg-yellow-400"
                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                >
                    Book
                </button>
            </div>
        </div>
    );
}
