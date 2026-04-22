import { useRef, useEffect } from 'react';

import Button from '@/components/button/Button';
import { getIconByName } from '@/lib/getIconByName';
import type { MarkerDetailsMode } from '@/lib/mapUIMode';
import { MARKER_TYPES, type Marker, type MarkerType } from '@/lib/markers';

import MarkerForm from './MarkerForm';
import OwnerText from './OwnerText';
import Panel from './Panel';
import PanelBody from './PanelBody';
import PanelHeader from './PanelHeader';
import type { ActionButton } from './PanelHeader';

import styles from './MarkerDetailsPanel.module.css';

interface Props {
  marker: Marker;
  mode: MarkerDetailsMode;
  currentUserOwnsMarker: boolean;
  userIsLoggedIn: boolean;
  onClose: () => void;
  onEditStart?: () => void;
  onDeleteStart?: () => void;
  onEditCancel: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
  onSave: (type: MarkerType, description: string | null) => void;
  isPending: boolean;
}

export default function MarkerDetailsPanel({
  marker,
  mode,
  currentUserOwnsMarker,
  userIsLoggedIn,
  onClose,
  onEditStart,
  onDeleteStart,
  onEditCancel,
  onDeleteCancel,
  onDeleteConfirm,
  onSave,
  isPending,
}: Props) {
  return (
    <Panel>
      {mode === 'markerDetails' && (
        <>
          <PanelHeader onClose={onClose} actionButtons={getActionButtons()}>
            <h1 className="hln-2">{MARKER_TYPES[marker.type].title}</h1>
          </PanelHeader>
          <PanelBody>
            <div className={styles.markerDetailIcon}>
              {getIconByName(MARKER_TYPES[marker.type].iconName)({})}
            </div>
            {marker.description !== null && <p>{marker.description}</p>}
            <OwnerText
              userIsLoggedIn={userIsLoggedIn}
              currentUserIsOwner={currentUserOwnsMarker}
              objectName="Waarschuwing"
            />
          </PanelBody>
        </>
      )}
      {mode === 'editMarker' && (
        <>
          <PanelHeader onClose={onClose}>
            <h1 className="hln-2">Waarschuwing aanpassen</h1>
          </PanelHeader>
          <PanelBody>
            <MarkerForm
              key={marker.id}
              defaultMarkerType={marker.type}
              defaultDescription={marker.description ?? ''}
              onSave={onSave}
              onCancel={onEditCancel}
              isPending={isPending}
            />
          </PanelBody>
        </>
      )}
      {mode === 'deleteMarker' && (
        <>
          <PanelHeader onClose={onClose}>
            <h1 className="hln-2">Waarschuwing verwijderen?</h1>
          </PanelHeader>
          <PanelBody>
            {isPending ? (
              <p>Waarschuwing aan het verwijderen...</p>
            ) : (
              <>
                <p>Weet je zeker dat je deze waarschuwing wil verwijderen?</p>
                <DeleteActions onDeleteCancel={onDeleteCancel} onDeleteConfirm={onDeleteConfirm} />
              </>
            )}
          </PanelBody>
        </>
      )}
    </Panel>
  );

  function getActionButtons(): ActionButton[] {
    const actionButtons: ActionButton[] = [];
    if (!currentUserOwnsMarker) {
      return actionButtons;
    }
    if (onEditStart) {
      actionButtons.push({
        iconName: 'edit',
        onClick: onEditStart,
        ariaLabel: 'Waarschuwing aanpassen',
      });
    }
    if (onDeleteStart) {
      actionButtons.push({
        iconName: 'delete',
        onClick: onDeleteStart,
        ariaLabel: 'Waarschuwing verwijderen',
      });
    }
    return actionButtons;
  }
}

interface DeleteActionsProps {
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
}

function DeleteActions({ onDeleteCancel, onDeleteConfirm }: DeleteActionsProps) {
  const deleteConfirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // the Delete key handler in MapUIContainer calls handleDeleteStart(), which triggers a re-render. The browser may be returning focus to wherever it was after the keydown event resolves — after useEffect has already run. setTimeout(..., 0) pushes the focus call to the next task, after the browser finishes processing the keydown event.
    const id = setTimeout(() => {
      deleteConfirmRef.current?.focus();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className={styles.deleteActions}>
      <Button label="Annuleren" variant="secondary" onClick={onDeleteCancel} />
      <Button
        label="Verwijderen"
        variant="danger"
        onClick={onDeleteConfirm}
        ref={deleteConfirmRef}
      />
    </div>
  );
}
