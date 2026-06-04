import Icon from '@/components/Icon';

import styles from './FeedbackBanner.module.css';

export default function FeedbackBanner() {
  return (
    <div className={styles.feedbackBanner}>
      <Icon iconName="circleExclamation" size={24} />
      De app is tijdelijk niet beschikbaar. Probeer het later opnieuw.
    </div>
  );
}
