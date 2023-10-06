import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function ChangePassword() {

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [mailValidated, setMailValidated] = useState<boolean>(false)
    const [codeSended, setCodeSended] = useState<boolean>(false)

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email');

        if (!mailValidated) {

            if (!codeSended) {
                const response = await fetch('/api/cambiarpassword/verify', {
                    method: 'POST',
                    body: JSON.stringify({ email }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    setCodeSended(true)
                } else {
                    console.log(response.statusText)
                }

            } else {
                const code = formData.get('code');
                const response = await fetch('/api/cambiarpassword/verify', {
                    method: 'POST',
                    body: JSON.stringify({ email, code }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    setMailValidated(true)
                } else {
                    console.log(response.statusText)
                }
            }
            return
        }

        setIsLoading(true)
        const newPassword = formData.get('newPassword');

        const response = await fetch('/api/cambiarpassword', {
            method: 'POST',
            body: JSON.stringify({ email, newPassword, mailValidated }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json()

        if (response.ok) {
            router.push('/login') // or wherever you want to redirect after a successful password change
        } else {
            setErrorMessage(data.error)
            setIsLoading(false)
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <form className="bg-white p-8 rounded-lg shadow-md w-96" onSubmit={handleSubmit}>
                <div className="mb-4">
                    {!codeSended && <p className="mb-2">Primero necesitamos validar tu email</p>}
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="email" type="email" id="email" required />
                </div>
                {codeSended && !mailValidated && <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code">
                        Introduce el numero que te ha llegado al email
                    </label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="code" type="code" id="text" required />
                </div>}

                {mailValidated && <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                        Nueva Contraseña
                    </label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="newPassword" type="password" id="newPassword" required />
                </div>}

                {errorMessage && <div className="mb-6">
                    <p className="text-sm text-red-600 font-semibold text-center">Error: {errorMessage}</p>
                </div>}
                <div className="flex flex-col items-center justify-between">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all" type="submit" disabled={isLoading}>
                        {!mailValidated ? "Verificar email" : isLoading ? "Cambiando..." : "Cambiar Contraseña"}
                    </button>
                    <Link href="/login" className="text-sm mt-2 text-slate-500 hover:opacity-75 transition-all">Volver al inicio de sesión</Link>
                </div>
            </form>
        </div>
    );
}
