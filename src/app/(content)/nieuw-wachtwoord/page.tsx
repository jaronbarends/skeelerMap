import type { Metadata } from 'next';

import NewPasswordForm from '@/components/auth/NewPasswordForm';

export const metadata: Metadata = {
  title: 'Nieuw wachtwoord',
};

export default function NewPasswordPage() {
  return <NewPasswordForm />;
}
