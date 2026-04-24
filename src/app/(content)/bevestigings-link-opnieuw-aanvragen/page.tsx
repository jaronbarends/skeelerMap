import type { Metadata } from 'next';

import ResendConfirmationForm from '@/components/auth/ResendConfirmationForm';

export const metadata: Metadata = {
  title: 'Bevestigingslink opnieuw aanvragen',
};

export default function ResendConfirmationPage() {
  return <ResendConfirmationForm />;
}
