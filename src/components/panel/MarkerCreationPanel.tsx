import Button from '@/components/button/Button';
import { isCreateMarkerMode, type MapUIMode } from '@/lib/mapUIMode';
import type { MarkerType } from '@/lib/markers';

import MarkerForm from '@/components/panel/MarkerForm';
import Panel from '@/components/panel/Panel';
import PanelBody from '@/components/panel/PanelBody';
import PanelHeader from '@/components/panel/PanelHeader';

interface Props {
  mode: MapUIMode;
  isPending: boolean;
  onCancel: () => void;
  onSaveMarker: (type: MarkerType, description: string | null) => void;
}

export default function MarkerCreationPanel({ mode, isPending, onCancel, onSaveMarker }: Props) {
  if (!isCreateMarkerMode(mode)) {
    return null;
  }

  return (
    <Panel>
      <PanelHeader onClose={onCancel}>
        <h1 className="hln-2">Waarschuwing toevoegen</h1>
      </PanelHeader>
      <PanelBody>
        {mode === 'placeMarker' && (
          <>
            <p>Tik op de kaart om de locatie te kiezen</p>
            <Button label="Annuleren" variant="secondary" onClick={onCancel} />
          </>
        )}

        {mode === 'markerForm' && (
          <MarkerForm
            isPending={isPending}
            defaultMarkerType="danger"
            defaultDescription=""
            onSave={onSaveMarker}
            onCancel={onCancel}
          />
        )}
      </PanelBody>
    </Panel>
  );
}
