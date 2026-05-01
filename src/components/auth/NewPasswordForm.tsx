'use client';

import { useRouter } from 'next/navigation';
import { type SubmitEvent, useState, useTransition } from 'react';

import Button from '@/components/button/Button';
import { type SimpleAuthResult, updatePassword } from '@/lib/supabaseAuth';
import { getUrlWithToast } from '@/lib/toastMessages';

import FormFeedback, { type Feedback } from '@/components/auth/FormFeedback';

export default function NewPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();

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

      {feedback && <FormFeedback message={feedback.message} type={feedback.type} />}

      <Button
        label={isPending ? 'Bezig…' : 'Wachtwoord aanpassen'}
        variant="primary"
        type="submit"
        disabled={isPending}
      />
    </form>
  );

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setFeedback(null);

    if (password !== passwordConfirm) {
      setFeedback({ message: 'Wachtwoorden komen niet overeen', type: 'error' });
      return;
    }

    startTransition(async () => {
      const result: SimpleAuthResult = await updatePassword(password);
      if (!result.success) {
        setFeedback(result.error.feedback);
        return;
      }
      router.push(getUrlWithToast('/', 'passwordChanged'));
    });
  }
}
