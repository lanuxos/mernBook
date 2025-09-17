import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authAPI } from '../services/api';
import { setToken, setUser } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const schema = yup.object({
    tel: yup.string().required(),
    password: yup.string().required(),
}).required();

export default function Login() {
    const { register, handleSubmit } = useForm({ resolver: yupResolver(schema) });
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const res = await authAPI.login(data);
            setToken(res.data.token);
            setUser(res.data.user);
            // Explicitly set userId and role here to ensure availability for MQTT
            localStorage.setItem('userId', res.data.user._id);
            localStorage.setItem('role', res.data.user.role);

            Swal.fire({
                title: `Welcome back`,
                text: 'Login successfully',
                icon: 'success',
                confirmButtonText: 'OK',
                timer: 3000
            });
            navigate('/dashboard');
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Login failed', 'error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-full max-w-md p-6 bg-black rounded text-yellow">
                <h2 className="text-2xl mb-4">Sign In</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                    <input {...register('tel')} placeholder="Tel" className="p-2 rounded text-black" />
                    <input {...register('password')} type="password" placeholder="Password" className="p-2 rounded text-black" />
                    <button type="submit" className="bg-yellow-500 text-black py-2 rounded">Login</button>
                </form>
            </div>
        </div>
    );
}
