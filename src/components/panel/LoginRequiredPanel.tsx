import Button from '@/components/button/Button';

import Panel from './Panel';
import PanelBody from './PanelBody';
import PanelHeader from './PanelHeader';

import styles from './LoginRequiredPanel.module.css';

export default function LoginRequiredPanel({ onClose }: { onClose: () => void }) {
  return (
    <Panel>
      <PanelHeader onClose={onClose}>
        <h1 className="hln-2">Inloggen vereist</h1>
      </PanelHeader>
      <PanelBody>
        <p>Je moet ingelogd zijn om segmenten toe te voegen.</p>
        <div className={styles.actions}>
          <Button label="Inloggen" variant="primary" href="/inloggen" />
          <Button label="Registreren" variant="secondary" href="/registreren" />
        </div>
      </PanelBody>
    </Panel>
  );
}
