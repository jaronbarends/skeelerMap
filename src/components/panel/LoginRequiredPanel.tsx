import Button from '@/components/button/Button';
import Panel from '@/components/panel/Panel';
import PanelBody from '@/components/panel/PanelBody';
import PanelHeader from '@/components/panel/PanelHeader';

import styles from './LoginRequiredPanel.module.css';

export default function LoginRequiredPanel({ onClose }: { onClose: () => void }) {
  return (
    <Panel testId="login-required-panel">
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
