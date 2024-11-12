import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  email: z.string()
    .email('Dirección de correo electrónico no válida')
    .refine(email => email.endsWith('@fie.undef.edu.ar'), {
      message: 'Solo se permiten direcciones de correo @fie.undef.edu.ar'
    }),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      setError('');
      await registerUser(data.firstName, data.lastName, data.email, data.password);
      setSuccessMessage('Usuario Registrado Exitosamente');
      setTimeout(() => navigate('/'), 2000); // Redirigir después de 2 segundos
    } catch (err) {
      setError('Fallo al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-50 pt-10">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Registro</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
        {successMessage && <div className="bg-green-100 text-green-700 p-3 mb-4 rounded">{successMessage}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700">Nombre</label>
            <input
              type="text"
              {...register('firstName')}
              className="w-full p-2 border rounded"
            />
            {errors.firstName && (
              <span className="text-red-500 text-sm">{errors.firstName.message}</span>
            )}
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Apellido</label>
            <input
              type="text"
              {...register('lastName')}
              className="w-full p-2 border rounded"
            />
            {errors.lastName && (
              <span className="text-red-500 text-sm">{errors.lastName.message}</span>
            )}
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Correo Electrónico (@fie.undef.edu.ar)</label>
            <input
              type="email"
              {...register('email')}
              className="w-full p-2 border rounded"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Contraseña</label>
            <input
              type="password"
              {...register('password')}
              className="w-full p-2 border rounded"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">{errors.password.message}</span>
            )}
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Confirmar Contraseña</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full p-2 border rounded"
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-3 border-t-2 border-white rounded-full" viewBox="0 0 24 24"></svg>
            ) : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
