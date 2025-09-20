import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BookingCard from '../components/BookingCard';
import { electricianAPI, adminAPI } from '../services/api';
import { getToken, getRole } from '../utils/auth';
import Swal from 'sweetalert2';
import FooterAds from '../components/FooterAds';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Home() {
    const [q, setQ] = useState('');
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [focused, setFocused] = useState(false);
    const navigate = useNavigate();
    const role = getRole();
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
        navigate('/booking', { state: { electricianId: electrician._id, electricianName: `${electrician.firstName} ${electrician.lastName}` } });
    };

    const handleVerifyClick = async (electricianId) => {
        try {
            await adminAPI.verifyElectrician(electricianId);
            Swal.fire({
                title: 'Success',
                text: 'Electrician has been verified.',
                icon: 'success',
            });
            fetchAll(); // Refresh the list to show the updated status
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to verify electrician.', 'error');
        }
    };
    

    const handleUnVerifyClick = async (electricianId) => {
        try {
            await adminAPI.unVerifyElectrician(electricianId);
            Swal.fire({
                title: 'Success',
                text: 'Electrician has been verified.',
                icon: 'success',
            });
            fetchAll(); // Refresh the list to show the updated status
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to un-verify electrician.', 'error');
        }
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
                            (() => {
                                const isAdmin = role === 'admin';
                                const isVerified = e.isVerified;

                                const buttonProps = {
                                    text: 'Book',
                                    disabled: !isVerified,
                                    className: isVerified
                                        ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                                        : 'bg-gray-400 text-gray-200 cursor-not-allowed',
                                };

                                let onAction = () => handleBookClick(e);
                                let actionComponent = null; // For multiple buttons

                                if (isAdmin) {
                                    if (isVerified) {
                                        // For verified electricians, show a disabled "Verified" and an active "Unverify" button
                                        actionComponent = (
                                            <div className="flex items-center gap-2">
                                                <button onClick={(evt) => { evt.preventDefault(); handleUnVerifyClick(e._id); }} className="px-3 py-1 rounded text-white bg-red-700 hover:bg-red-600">
                                                    Unverify
                                                </button>
                                            </div>
                                        );
                                    } else {
                                        // For unverified, show the "Verify" button
                                        buttonProps.text = 'Verify';
                                        buttonProps.disabled = false;
                                        buttonProps.className = 'bg-blue-600 text-white hover:bg-blue-500';
                                        onAction = () => handleVerifyClick(e._id);
                                    }
                                } else {
                                    onAction = () => handleBookClick(e);
                                }

                                return (
                                    <Link to={`/electrician/${e._id}`} key={e._id} className="block no-underline">
                                        <BookingCard
                                            item={{
                                                ...e,
                                                firstName: highlightText(e.firstName),
                                                lastName: highlightText(e.lastName),
                                                rating: 4, // Placeholder rating
                                            }}
                                            actionComponent={actionComponent}
                                            {...(!actionComponent && { onAction, buttonProps })}
                                        />
                                    </Link>
                                );
                            })()
                        ))
                    )}
                </div>
            </main>

            <FooterAds />
        </div>
    );
}
