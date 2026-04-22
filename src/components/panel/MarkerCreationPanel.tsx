import Button from '@/components/button/Button';
import { isCreateMarkerMode, type MapUIMode } from '@/lib/mapUIMode';
import type { MarkerType } from '@/lib/markers';

import MarkerForm from './MarkerForm';
import Panel from './Panel';
import PanelBody from './PanelBody';
import PanelHeader from './PanelHeader';

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
