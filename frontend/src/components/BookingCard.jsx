import { StarIcon } from '@heroicons/react/24/solid';

const StarRating = ({ rating = 0 }) => {
    const totalStars = 5;
    return (
        <div className="flex items-center mt-2">
            {[...Array(totalStars)].map((_, index) => (
                <StarIcon
                    key={index}
                    className={`w-5 h-5 ${index < Math.round(rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                />
            ))}
        </div>
    );
};

export default function BookingCard({ item, onAction, buttonProps, actionComponent }) {
    const isVerified = item.isVerified;

    return (
        <div className="flex items-center border border-yellow-500 bg-black dark:bg-gray-800 rounded-lg p-3 shadow hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
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

            <div className="flex flex-col items-center">
                <div>
                    {actionComponent ? (
                        actionComponent
                    ) : (
                        <button
                            onClick={(e) => {
                                e.preventDefault(); // Stop the parent Link from navigating
                                if (onAction) onAction();
                            }}
                            disabled={buttonProps.disabled}
                            className={`px-3 py-1 rounded z-10 relative transition-colors ${buttonProps.className || ''
                                }`}
                        >
                            {buttonProps.text}
                        </button>
                    )}
                </div>
                <StarRating rating={item.rating} />
            </div>
        </div>
    );
}
