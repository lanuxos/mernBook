import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { bookingAPI } from '../services/api';
import Swal from 'sweetalert2';

const schema = yup.object({
    electricianId: yup.string().required(),
    schedule: yup.date()
        .min(new Date(), 'Schedule date and time must be in the future.')
        .required('Please select a date and time.'),
    detail: yup.string().required('Please provide details for the booking.'),
}).required();

export default function Booking() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

    // Prefill electricianId if passed from state
    if (state?.electricianId) {
        setValue('electricianId', state.electricianId);
    }

    // Generate a string for the min attribute of the datetime-local input
    // This prevents selecting past dates in the browser's date picker
    const minDateTime = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

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
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="w-full max-w-md p-6 bg-black border border-yellow-500 rounded-lg text-yellow">
                <h2 className="text-2xl font-bold mb-6 text-center">Create Booking</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">

                    {/* Show electrician name (read-only) */}
                    {state?.electricianName && (
                        <div>
                            <label className="text-sm font-semibold text-gray-300">For Electrician</label>
                            <input
                                value={state.electricianName}
                                disabled
                                className="w-full mt-1 p-2 rounded bg-gray-800 text-white border border-gray-600"
                            />
                        </div>
                    )}

                    {/* Hidden electricianId to submit */}
                    <input type="hidden" {...register('electricianId')} />

                    <div>
                        <input {...register('schedule')} type="datetime-local" className="w-full p-2 rounded bg-gray-200 text-black" min={minDateTime} />
                        {errors.schedule && <p className="text-red-500 text-xs mt-1">{errors.schedule.message}</p>}
                    </div>
                    <div>
                        <textarea {...register('detail')} placeholder="Describe the issue..." rows="4" className="w-full p-2 rounded bg-gray-200 text-black" />
                        {errors.detail && <p className="text-red-500 text-xs mt-1">{errors.detail.message}</p>}
                    </div>
                    <button type="submit" className="bg-yellow-500 text-black py-2 rounded font-bold hover:bg-yellow-400 transition-colors">Create Booking</button>
                </form>
            </div>
        </div>
    );
}
