'use client';

import { useRouter } from 'next/navigation';
import { type SubmitEvent, useState } from 'react';

import Button from '@/components/button/Button';
import { type SimpleAuthResult, updatePassword } from '@/lib/supabaseAuth';
import { getUrlWithToast } from '@/lib/toastMessages';

import FormError from './FormError';

export default function NewPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h1>Nieuw wachtwoord opgeven</h1>

      <div className="formGroup">
        <div className="formItem">
          <label htmlFor="password">Nieuw wachtwoord</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="formItem">
          <label htmlFor="passwordConfirm">Herhaal wachtwoord</label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      {error && <FormError message={error} />}

      <Button
        label={isPending ? 'Bezig…' : 'Wachtwoord aanpassen'}
        variant="primary"
        type="submit"
        disabled={isPending}
      />
    </form>
  );

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    setIsPending(true);

    const result: SimpleAuthResult = await updatePassword(password);

    if (!result.success) {
      setError(result.error.message);
      setIsPending(false);
      return;
    }

    router.push(getUrlWithToast('/', 'passwordChanged'));
  }
}
