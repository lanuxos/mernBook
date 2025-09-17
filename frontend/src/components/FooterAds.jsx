import { useState, useEffect } from 'react';

const mockAds = [
    { id: 1, text: '⚡ Get 20% off on your first booking!', link: '/' },
    { id: 2, text: '🔌 Upgrade your home wiring today!', link: '/' },
    { id: 3, text: '💡 Free consultation for electricians!', link: '/' },
    { id: 4, text: '🏠 Book certified electricians near you!', link: '/' },
    { id: 5, text: '🔧 Special weekend discount available!', link: '/' },
];

export default function FooterAds() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % mockAds.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <footer className="bg-gray-900 text-yellow-400 py-2">
            <div className="flex justify-center items-center h-12 overflow-hidden relative">
                <div
                    className="transition-transform duration-500 flex w-full"
                    style={{ transform: `translateX(-${current * 100}%)` }}
                >
                    {mockAds.map((ad) => (
                        <a
                            key={ad.id}
                            href={ad.link}
                            className="flex-shrink-0 w-full text-center hover:underline hover:text-yellow-300 transition-colors duration-300"
                        >
                            {ad.text}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}
