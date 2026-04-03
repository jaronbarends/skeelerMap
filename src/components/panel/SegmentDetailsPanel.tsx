import { useRef, useEffect } from 'react';

import type { MapUIMode } from '@/components/map/MapUIContainer';

import Panel from './Panel';
import PanelHeader from './PanelHeader';
import PanelInstruction from './PanelInstruction';
import RatingSection from './RatingSection';

import styles from './SegmentDetailsPanel.module.css';

interface Props {
  lengthLabel: string;
  currentRating: number;
  mode: MapUIMode;
  onClose: () => void;
  onEditStart: () => void;
  onDeleteStart: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
  onRatingSelect: (rating: number) => void;
  isPending: boolean;
}

export default function SegmentDetailsPanel({
  lengthLabel,
  currentRating,
  mode,
  onClose,
  onEditStart,
  onDeleteStart,
  onDeleteCancel,
  onDeleteConfirm,
  onRatingSelect,
  isPending,
}: Props) {
  return (
    <Panel>
      {mode === 'details' && (
        <PanelHeader
          title={lengthLabel}
          onClose={onClose}
          actionButtons={[
            { iconName: 'edit', onClick: onEditStart, ariaLabel: 'Segment aanpassen' },
            { iconName: 'delete', onClick: onDeleteStart, ariaLabel: 'Segment verwijderen' },
          ]}
        />
      )}
      {mode === 'edit' && (
        <>
          <PanelHeader title="Bewerk kwaliteit" onClose={onClose} />
          <RatingSection
            onRatingSelect={onRatingSelect}
            currentRating={currentRating}
            isPending={isPending}
            isReadyToRate={true}
          />
        </>
      )}
      {mode === 'delete' && (
        <>
          <PanelHeader title="Segment verwijderen?" onClose={onDeleteCancel} />
          {isPending ? (
            <PanelInstruction>Segment aan het verwijderen...</PanelInstruction>
          ) : (
            <>
              <PanelInstruction>Weet je zeker dat je dit segment wil verwijderen?</PanelInstruction>
              <DeleteActions onDeleteCancel={onDeleteCancel} onDeleteConfirm={onDeleteConfirm} />
            </>
          )}
        </>
      )}
    </Panel>
  );
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
      <button className={styles.cancelButton} onClick={onDeleteCancel}>
        Annuleren
      </button>
      <button className={styles.confirmButton} onClick={onDeleteConfirm} ref={deleteConfirmRef}>
        Verwijderen
      </button>
    </div>
  );
}
