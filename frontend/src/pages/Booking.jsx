import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { bookingAPI } from '../services/api';
import Swal from 'sweetalert2';

const schema = yup.object({
    electricianId: yup.string().required(),
    schedule: yup.date().required(),
    detail: yup.string().required(),
}).required();

export default function Booking() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { register, handleSubmit, setValue } = useForm({ resolver: yupResolver(schema) });

    // Prefill electricianId if passed from state
    if (state?.electricianId) {
        setValue('electricianId', state.electricianId);
    }

    const onSubmit = async (data) => {
        try {
            const payload = {
                electricianId: data.electricianId,
                schedule: data.schedule,
                detail: data.detail,
                location: { type: 'Point', coordinates: [102.57, 17.95] }
            };
            await bookingAPI.create(payload);
            Swal.fire('Booked', 'Booking created successfully', 'success');
            navigate('/dashboard');
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Booking failed', 'error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-full max-w-md p-6 bg-black rounded text-yellow">
                <h2 className="text-2xl mb-4">Create Booking</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">

                    {/* Show electrician name (read-only) */}
                    {state?.electricianName && (
                        <input
                            value={state.electricianName}
                            disabled
                            className="p-2 rounded bg-gray-300 text-black"
                        />
                    )}

                    {/* Hidden electricianId to submit */}
                    <input type="hidden" {...register('electricianId')} />

                    <input {...register('schedule')} type="datetime-local" className="p-2 rounded text-black" />
                    <textarea {...register('detail')} placeholder="Details" className="p-2 rounded text-black" />
                    <button type="submit" className="bg-yellow-500 text-black py-2 rounded">Create Booking</button>
                </form>
            </div>
        </div>
    );
}
