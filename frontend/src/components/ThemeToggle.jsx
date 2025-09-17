import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [dark, setDark] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved) {
            setDark(saved === 'dark');
        } else {
            setDark(true); // default dark
        }
    }, []);

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [dark]);

    return (
        <button
            onClick={() => setDark(!dark)}
            className="ml-2 px-1 py-1 rounded bg-gray-500 text-yellow dark:bg-gray-500 dark:text-yellow"
        >
            {dark ? '☀️' : '🌙'}
        </button>
    );
}
