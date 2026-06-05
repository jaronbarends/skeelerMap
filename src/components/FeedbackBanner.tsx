import Icon from '@/components/Icon';

import styles from './FeedbackBanner.module.css';

export default function FeedbackBanner() {
  return (
    <div className={styles.feedbackBanner} role="alert" aria-live="assertive">
      <Icon iconName="circleExclamation" size={24} />
      <div>
        <p>De app is tijdelijk niet beschikbaar. Probeer het later opnieuw.</p>
      </div>
    </div>
  );
}
