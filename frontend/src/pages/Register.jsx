import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authAPI } from '../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const schema = yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    tel: yup.string().required('Tel is required').matches(/^[0-9]{10}$/, 'Tel must be 10 digits'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
    role: yup.string().oneOf(['customer', 'electrician']).required('Please select a role'),
}).required();

export default function Register() {
    const { register, handleSubmit } = useForm({ resolver: yupResolver(schema) });
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            // remove confirmPassword before sending
            const { confirmPassword, ...payload } = data;

            await authAPI.register({
                ...payload,
                location: { type: 'Point', coordinates: [102.57, 17.95] }
            });
            Swal.fire('Success', 'Registered. Please login.', 'success');
            navigate('/login');
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Register failed', 'error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-full max-w-md p-6 bg-black rounded text-yellow">
                <h2 className="text-2xl mb-4">Register</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                    <input {...register('firstName')} placeholder="First name" className="p-2 rounded text-black" />
                    <input {...register('lastName')} placeholder="Last name" className="p-2 rounded text-black" />
                    <input {...register('tel')} placeholder="Tel (10 digits)" className="p-2 rounded text-black" />
                    <input {...register('email')} placeholder="Email" className="p-2 rounded text-black" />
                    <input {...register('password')} type="password" placeholder="Password" className="p-2 rounded text-black" />

                    {/* Confirm password */}
                    <input {...register('confirmPassword')} type="password" placeholder="Confirm password" className="p-2 rounded text-black" />

                    {/* Role selector */}
                    <select {...register('role')} className="p-2 rounded text-black">
                        <option value="">Select role</option>
                        <option value="customer">Customer</option>
                        <option value="electrician">Electrician</option>
                    </select>

                    <button type="submit" className="bg-yellow-500 text-black py-2 rounded">Register</button>
                </form>
            </div>
        </div>
    );
}
