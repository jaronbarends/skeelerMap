import type { Metadata } from 'next';

import ResendConfirmationForm from '@/components/auth/ResendConfirmationForm';

export const metadata: Metadata = {
  title: 'Link niet meer geldig',
};

export default function ResendConfirmationPage() {
  return <ResendConfirmationForm />;
}
