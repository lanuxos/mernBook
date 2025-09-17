import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BookingCard from '../components/BookingCard';
import { electricianAPI } from '../services/api';
import { getToken } from '../utils/auth';
import Swal from 'sweetalert2';
import FooterAds from '../components/FooterAds';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Home() {
    const [q, setQ] = useState('');
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [focused, setFocused] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef();

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const res = await electricianAPI.list();
            const electricians = res.data.electricians || [];
            setItems(electricians);
            setFilteredItems(electricians);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Cannot fetch electricians', 'error');
        }
    };

    // frontend-only search with debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            const filtered = items.filter((e) => {
                const searchable = `${e.firstName} ${e.lastName} ${e.tel} ${e.specialty || ''}`.toLowerCase();
                return searchable.includes(q.toLowerCase());
            });
            setFilteredItems(filtered);
        }, 300);

        return () => clearTimeout(timeout);
    }, [q, items]);

    const handleBookClick = (electrician) => {
        if (!getToken()) {
            Swal.fire({
                title: 'Please login',
                text: 'You must login to create a booking',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Go to login',
            }).then((res) => {
                if (res.isConfirmed) navigate('/login');
            });
            return;
        }
        navigate('/booking', { state: { electricianId: electrician._id } });
    };

    // helper to highlight matched text
    const highlightText = (text) => {
        if (!q) return text;
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex chars
        const regex = new RegExp(`(${escaped})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? (
                <span key={i} className="bg-yellow-300 text-black">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };


    return (
        <div className="flex flex-col min-h-screen bg-gray-900 dark:bg-gray-900 text-yellow">
            <Navbar />
            <main className="flex-grow p-4">
                <div className="relative mb-4 flex justify-center">
                    {!focused && (
                        <MagnifyingGlassIcon
                            className="w-8 h-8 text-gray-400 cursor-pointer"
                            onClick={() => setFocused(true)}
                        />
                    )}
                    {focused && (
                        <input
                            ref={inputRef}
                            autoFocus
                            className="w-full p-2 rounded text-black transition-all duration-300 ease-in-out"
                            placeholder="Search by name, tel or specialty..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onBlur={() => setFocused(false)}
                        />
                    )}
                </div>

                <div className="space-y-3">
                    {filteredItems.length === 0 ? (
                        <p className="text-white">No electricians available</p>
                    ) : (
                        filteredItems.map((e) => (
                            <BookingCard
                                key={e._id}
                                item={{
                                    ...e,
                                    firstName: highlightText(e.firstName),
                                    lastName: highlightText(e.lastName),
                                    tel: highlightText(e.tel),
                                    specialty: e.specialty ? highlightText(e.specialty) : null,
                                }}
                                onBook={handleBookClick}
                            />
                        ))
                    )}
                </div>
            </main>

            <FooterAds />
        </div>
    );
}
