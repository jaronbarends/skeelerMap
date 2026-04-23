'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type SubmitEvent, useState } from 'react';

import Button from '@/components/button/Button';
import { type AuthResult, signIn } from '@/lib/supabaseAuth';
import { getUrlWithToast } from '@/lib/toastMessages';

import FormError from './FormError';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>('');
  const [isPending, setIsPending] = useState(false);

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h1>Inloggen</h1>

      <div className="formGroup">
        <div className="formItem">
          <label htmlFor="email">E-mailadres</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="formItem">
          <label htmlFor="password">Wachtwoord</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
      </div>

      {error && <FormError message={error} />}

      <Button
        label={isPending ? 'Bezig…' : 'Inloggen'}
        variant="primary"
        type="submit"
        disabled={isPending}
      />

      <p className="formFooter">
        Nog geen account? <Link href="/registreren">Maak een account aan</Link>
      </p>
    </form>
  );

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const result: AuthResult = await signIn(email, password);

    if (!result.success) {
      setError(result.error.message);
      setIsPending(false);
      return;
    }

    // no need to call setIsPending(false) here: the component unmounts via navigation, so resetting it would cause a state update on an unmounted component.
    router.push(getUrlWithToast('/', 'loggedIn'));
    // push only re-renders client-side. We need to refresh server side AuthControls as well to show correct login state. router.refresh() does that.
    router.refresh();
  }
}
