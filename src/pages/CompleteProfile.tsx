import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const profileSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio')
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const CompleteProfile = () => {
  const { currentUser, register: updateProfile } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!currentUser || !currentUser.email) {
      setError('No se pudo encontrar al usuario autenticado o su correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      setError('');
      await updateProfile(data.firstName, data.lastName, currentUser.email, currentUser.uid); // Asegurarnos de pasar todos los argumentos
      navigate('/profile'); // Redirigir a la página de perfil
    } catch (err: unknown) {
      console.error('Error al completar el perfil:', err);
      setError('Error al completar el perfil');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Completar Perfil</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Nombre</label>
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
          <label className="block mb-1">Apellido</label>
          <input
            type="text"
            {...register('lastName')}
            className="w-full p-2 border rounded"
          />
          {errors.lastName && (
            <span className="text-red-500 text-sm">{errors.lastName.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
};
