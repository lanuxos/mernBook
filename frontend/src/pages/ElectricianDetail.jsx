import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { electricianAPI } from '../services/api';
import { getToken } from '../utils/auth';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';
import { UserCircleIcon, PhoneIcon, WrenchScrewdriverIcon, CheckBadgeIcon, XCircleIcon, MapPinIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

export default function ElectricianDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [electrician, setElectrician] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchElectrician = async () => {
            try {
                // This assumes an API endpoint like `electricianAPI.getById(id)` exists.
                // Based on your project structure, this would call GET /api/electricians/:id
                const res = await electricianAPI.getById(id);
                // Handle if backend sends { electrician: ... } or just { ... }
                const electricianData = res.data.electrician || res.data;
                setElectrician(electricianData);
                // console.log("Fetched electrician details:", electricianData);
            } catch (err) {
                console.error("Failed to fetch electrician details:", err);
                Swal.fire('Error', 'Could not load electrician details.', 'error');
                navigate('/'); // Redirect home if electrician not found
            } finally {
                setLoading(false);
            }
        };

        fetchElectrician();
    }, [id, navigate]);

    const handleBookClick = () => {
        if (!getToken()) {
            Swal.fire({
                title: 'Please Login',
                text: 'You must be logged in to book a service.',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Go to Login',
                cancelButtonText: 'Cancel',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                }
            });
            return;
        }
        // Navigate to booking page with electrician info
        navigate('/booking', { state: { electricianId: electrician._id, electricianName: `${electrician.firstName} ${electrician.lastName}` } });
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-900 text-yellow flex justify-center items-center">Loading...</div>;
    }

    if (!electrician) {
        return <div className="min-h-screen bg-gray-900 text-yellow flex justify-center items-center">Electrician not found.</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-2xl mx-auto bg-black rounded-lg shadow-lg overflow-hidden border border-yellow-500">
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row items-center mb-6">
                            <img src="/default.jpg" alt="Profile" className="w-24 h-24 rounded-full border-2 border-yellow-400 mr-0 sm:mr-4 mb-4 sm:mb-0" />
                            <div>
                                <h1 className="text-3xl font-bold text-yellow text-center sm:text-left">{electrician.firstName} {electrician.lastName || ''}</h1>
                                <div className={`flex items-center justify-center sm:justify-start mt-1 text-sm font-medium ${electrician.isVerified ? "text-green-400" : "text-red-400"}`}>
                                    {electrician.isVerified ? <CheckBadgeIcon className="w-5 h-5 mr-1" /> : <XCircleIcon className="w-5 h-5 mr-1" />}
                                    {electrician.isVerified ? "Verified" : "Not Verified"}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 text-gray-300">
                            <div className="flex items-center">
                                <PhoneIcon className="w-5 h-5 mr-2 text-yellow-400" />
                                <span>Tel: {electrician.tel}</span>
                            </div>
                            <div className="flex items-center">
                                <WrenchScrewdriverIcon className="w-5 h-5 mr-2 text-yellow-400" />
                                <span>Specialty: {electrician.specialty || 'General Services'}</span>
                            </div>
                            {electrician.location?.coordinates && (
                                <div className="flex items-center">
                                    <MapPinIcon className="w-5 h-5 mr-2 text-yellow-400" />
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${electrician.location.coordinates[1]},${electrician.location.coordinates[0]}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-yellow-300 underline"
                                    >
                                        View on Map
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center bg-gray-800 p-3 rounded-md border border-gray-700">
                                <DocumentTextIcon className="w-8 h-8 mr-3 text-yellow-400" />
                                <span className="text-sm">Identity documents are on file and have been {electrician.isVerified ? 'verified by an administrator.' : 'pending verification.'}</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={handleBookClick}
                                disabled={!electrician.isVerified}
                                className={`w-full px-4 py-2 rounded font-bold transition ${electrician.isVerified
                                        ? "bg-yellow-500 text-black hover:bg-yellow-400"
                                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                {electrician.isVerified ? 'Book Now' : 'Booking Unavailable'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}