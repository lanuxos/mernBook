import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-yellow">
            <div className="text-center">
                <h1 className="text-6xl font-bold">404</h1>
                <p className="mt-4">Page not found</p>
                <Link to="/" className="mt-6 inline-block bg-yellow text-black px-4 py-2 rounded">Home</Link>
            </div>
        </div>
    );
}
