'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type SubmitEvent, useState, useTransition } from 'react';

import SimpleContent from '@/components/SimpleContent';
import FormFeedback, { type Feedback } from '@/components/auth/FormFeedback';
import Button from '@/components/button/Button';
import { type AuthResult, signIn } from '@/lib/supabaseAuth';
import { getUrlWithToast } from '@/lib/toastMessages';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form className="form" onSubmit={handleSubmit}>
      <SimpleContent>
        <h1>Inloggen</h1>
      </SimpleContent>

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
        <div className="formItem formSecondaryText">
          <Link href="/wachtwoord-vergeten">Wachtwoord vergeten?</Link>
        </div>
      </div>

      {feedback && <FormFeedback {...feedback} />}

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

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result: AuthResult = await signIn(email, password);
      if (!result.success) {
        setFeedback(result.error.feedback);
        return;
      }
      router.push(getUrlWithToast('/', 'loggedIn'));
      // push only re-renders client-side. We need to refresh server side AuthControls as well to show correct login state. router.refresh() does that.
      router.refresh();
    });
  }
}
