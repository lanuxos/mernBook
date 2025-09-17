import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { getUser, clearUser, clearToken } from '../utils/auth';
import { HomeIcon, UserIcon, KeyIcon, ArrowRightEndOnRectangleIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'; // optional: heroicons

export default function Navbar() {
    const user = getUser();
    const navigate = useNavigate();

    const logout = () => {
        clearToken();
        clearUser();
        navigate('/');
    };

    return (
        <header className="flex items-center justify-between px-4 py-3 bg-black dark:bg-gray-800">
            <div className="flex items-center gap-3">
                <div className="font-bold">⚡Electrically</div>
            </div>

            <div className="flex items-center gap-2">
                {/* Home */}
                <Link
                    to="/"
                    className="flex items-center gap-1 px-2 py-1 rounded bg-gray-500 text-yellow dark:bg-gray-700 dark:text-yellow"
                >
                    <HomeIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Home</span>
                </Link>

                {user ? (
                    <>
                        

                        {/* Dashboard */}
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-1 px-2 py-1 rounded bg-gray-500 text-yellow dark:bg-gray-700 dark:text-yellow"
                        >
                            <AdjustmentsHorizontalIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>

                        {/* Sign Out */}
                        <button
                            onClick={logout}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-gray-500 text-yellow"
                        >
                            <ArrowRightEndOnRectangleIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                        {/* User name */}
                        <span className="text-white font-semibold italic">
                            <span className="hidden sm:inline">
                                &lt; {user.firstName} {user.lastName} /&gt;
                            </span>
                            <span className="sm:hidden">
                                &lt; {user.firstName?.[0]} /&gt;
                            </span>
                        </span>
                    </>
                ) : (
                    <>
                        {/* Sign In */}
                        <Link
                            to="/login"
                            className="flex items-center gap-1 px-2 py-1 rounded bg-gray-500 text-yellow"
                        >
                            <KeyIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Sign In</span>
                        </Link>

                        {/* Register */}
                        <Link
                            to="/register"
                            className="flex items-center gap-1 px-2 py-1 rounded bg-gray-500 text-yellow"
                        >
                            <UserIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Register</span>
                        </Link>
                    </>
                )}

                {/* <ThemeToggle /> */}
            </div>
        </header>
    );
}
