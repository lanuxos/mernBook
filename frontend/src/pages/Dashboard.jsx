import { useEffect, useState, useRef } from 'react';
import { getRole } from '../utils/auth';
import { bookingAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';
import FooterAds from '../components/FooterAds';
import mqtt from 'mqtt';

export default function Dashboard() {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const role = getRole();
    const clientRef = useRef(null);

    // ---------- Load bookings ----------
    const load = async () => {
        try {
            if (role === 'admin') {
                const res = await bookingAPI.adminAll();
                setData(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } else if (role === 'electrician') {
                const res = await bookingAPI.getIncoming();
                setData(res.data.filter((b) => ['pending', 'confirmed'].includes(b.status)));
            } else {
                const res = await bookingAPI.getMine();
                setData(res.data.filter((b) => ['pending', 'confirmed'].includes(b.status)));
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        load();
    }, [role]);

    // ---------- MQTT Connection ----------
    useEffect(() => {
        const userId = localStorage.getItem('userId'); // or decode from JWT
        const client = mqtt.connect('wss://48c086e2145d4b3eb554c49bcd039382.s1.eu.hivemq.cloud:8884/mqtt', {
            username: 'mernbook',
            password: 'T00r@123'
        });
        clientRef.current = client;

        // Subscribe based on role + ID
        let topic;
        if (role === 'customer') {
            topic = `bookings/customer/${userId}`;
        } else if (role === 'electrician') {
            topic = `bookings/electrician/${userId}`;
        } else {
            topic = `bookings/admin`; // admin listens to global
        }

        client.on('connect', () => {
            console.log('✅ MQTT connected');
            client.subscribe(topic, (err) => {
                if (!err) console.log(`📡 Subscribed to ${topic}`);
            });
        });

        client.on('message', (t, message) => {
            try {
                const payload = JSON.parse(message.toString());
                console.log('📩 MQTT Message:', payload);

                // Since the backend sends messages to role-specific topics,
                // we can assume any message received is intended for the current user.
                // We just need to determine the alert type.
                const alertType = (status) => {
                    if (status === 'confirmed') return 'success';
                    if (['cancelled', 'deleted'].includes(status)) return 'warning';
                    return 'info';
                };

                Swal.fire({
                    title: 'Booking Update',
                    text: payload.message,
                    icon: alertType(payload.status),
                });

                load(); // refresh bookings
            } catch (err) {
                console.error('MQTT parse error:', err);
            }
        });

        return () => {
            if (client) client.end();
        };
    }, [role]);


    // ---------- Update Status ----------
    const updateStatus = async (id, action) => {
        try {
            await bookingAPI.updateStatus(id, action);
            Swal.fire('Success', `Order ${action}`, 'success');
            load();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to update', 'error');
        }
    };

    // ---------- Pagination ----------
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex flex-col min-h-screen bg-gray-800 dark:bg-gray-800 text-yellow">
            <Navbar />
            <main className="flex-grow p-4">
                <h1 className="text-2xl text-yellow mb-4">Dashboard - {role}</h1>
                {data.length === 0 ? (
                    <p className="text-white">No records</p>
                ) : (
                    <>
                        <div className="space-y-3">
                            {paginatedData.map((b) => (
                                <div
                                    key={b._id}
                                    className="bg-gray-800 dark:bg-gray-800 p-3 rounded flex justify-between items-start"
                                >
                                    <div>
                                        <div className="font-semibold text-white dark:text-white">
                                            {b.detail}
                                        </div>
                                        <div className="text-sm text-white dark:text-gray-300">
                                            Schedule: {new Date(b.schedule).toLocaleString()}
                                        </div>
                                        <div
                                            className={`text-sm mt-1 font-semibold ${b.status === 'pending'
                                                ? 'text-yellow-500'
                                                : b.status === 'confirmed'
                                                    ? 'text-green-700'
                                                    : b.status === 'deleted'
                                                        ? 'text-red-700'
                                                        : 'text-gray-400'
                                                }`}
                                        >
                                            Status:{' '}
                                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                                        </div>
                                    </div>

                                    <div className="text-sm flex flex-col gap-2 items-end">
                                        {/* Admin info */}
                                        {role === 'admin' && (
                                            <>
                                                <div>
                                                    Customer: {b.customerId?.firstName}
                                                </div>
                                                <div>
                                                    Electrician: {b.electricianId?.firstName}
                                                </div>
                                            </>
                                        )}

                                        {/* Customer sees electrician */}
                                        {role === 'customer' && b.electricianId && (
                                            <div>
                                                {b.electricianId.firstName} {b.electricianId.lastName}{' '}
                                                {b.electricianId.tel && `- ${b.electricianId.tel}`}
                                            </div>
                                        )}

                                        {/* Electrician sees customer */}
                                        {role === 'electrician' && b.customerId && (
                                            <div>
                                                {b.customerId.firstName} {b.customerId.lastName}{' '}
                                                {b.customerId.tel && `- ${b.customerId.tel}`}
                                            </div>
                                        )}

                                        {/* Action buttons */}
                                        {role === 'electrician' && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => updateStatus(b._id, 'confirmed')}
                                                    disabled={b.status === 'confirmed'}
                                                    className={`px-3 py-1 rounded text-white ${b.status === 'confirmed'
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-green-700'
                                                        }`}
                                                >
                                                    Accept
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        let newStatus = 'cancelled';
                                                        if (b.status === 'confirmed') newStatus = 'pending';
                                                        updateStatus(b._id, newStatus);
                                                    }}
                                                    className="px-3 py-1 rounded text-white bg-red-700"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}

                                        {role === 'customer' && (
                                            <button
                                                onClick={() => updateStatus(b._id, 'cancelled')}
                                                disabled={b.status === 'confirmed'}
                                                className={`px-3 py-1 rounded text-white ${b.status === 'confirmed'
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-red-700 hover:bg-gray-600'
                                                    }`}
                                            >
                                                Cancel
                                            </button>
                                        )}

                                        {role === 'admin' && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => updateStatus(b._id, 'pending')}
                                                    disabled={b.status === 'pending'}
                                                    className={`px-3 py-1 rounded text-white ${b.status === 'pending'
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-yellow-500 hover:bg-yellow-600'
                                                        }`}
                                                >
                                                    Pending
                                                </button>

                                                <button
                                                    onClick={() => updateStatus(b._id, 'deleted')}
                                                    disabled={b.status === 'deleted'}
                                                    className={`px-3 py-1 rounded text-white ${b.status === 'deleted'
                                                        ? 'bg-gray-500 cursor-not-allowed'
                                                        : 'bg-red-700 hover:bg-gray-700'
                                                        }`}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination controls */}
                        <div className="flex justify-center items-center mt-4 gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded bg-gray-600 text-white disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="text-white">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded bg-gray-600 text-white disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </main>

            <FooterAds />
        </div>
    );
}
