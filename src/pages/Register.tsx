import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { auth } from '../lib/firebase'; // Importar auth correctamente

const registerSchema = z.object({
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

export const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register: registerForm, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      setError('');
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      if (user) {
        await registerUser("", "", user.email || "", user.uid); // Registrar datos iniciales del usuario
      }
      navigate('/complete-profile'); // Redirigir a la página para completar el perfil
    } catch (err: unknown) {
      console.error('Error en la creación de la cuenta:', err);
      if (err instanceof Error) {
        if (err.message.includes('auth/email-already-in-use')) {
          setError('El correo electrónico ya está en uso');
        } else {
          setError('Error al crear la cuenta');
        }
      } else {
        setError('Error desconocido');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Registrarse</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Correo Electrónico (@fie.undef.edu.ar)</label>
          <input
            type="email"
            {...registerForm('email')}
            className="w-full p-2 border rounded"
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </div>

        <div>
          <label className="block mb-1">Contraseña</label>
          <input
            type="password"
            {...registerForm('password')}
            className="w-full p-2 border rounded"
          />
          {errors.password && (
            <span className="text-red-500 text-sm">{errors.password.message}</span>
          )}
        </div>

        <div>
          <label className="block mb-1">Confirmar Contraseña</label>
          <input
            type="password"
            {...registerForm('confirmPassword')}
            className="w-full p-2 border rounded"
          />
          {errors.confirmPassword && (
            <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
};
