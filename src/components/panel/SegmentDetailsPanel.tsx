import { useRef, useEffect } from 'react';

import Button from '@/components/button/Button';
import type { MapUIMode } from '@/components/map/MapUIContainer';
import { calculateSegmentLength } from '@/components/map/mapUtils';
import type { Segment } from '@/lib/segments';
import { getRatingByValue } from '@/lib/segments';

import Panel from './Panel';
import PanelHeader from './PanelHeader';
import type { ActionButton } from './PanelHeader';
import PanelInstruction from './PanelInstruction';
import RatingSection from './RatingSection';

import styles from './SegmentDetailsPanel.module.css';

interface Props {
  segment: Segment;
  mode: MapUIMode;
  currentUserOwnsSegment: boolean;
  onClose: () => void;
  onEditStart?: () => void;
  onDeleteStart?: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
  onRatingSelect: (rating: number) => void;
  isPending: boolean;
}

export default function SegmentDetailsPanel({
  segment,
  mode,
  currentUserOwnsSegment,
  onClose,
  onEditStart,
  onDeleteStart,
  onDeleteCancel,
  onDeleteConfirm,
  onRatingSelect,
  isPending,
}: Props) {
  const currentRatingValue: number = segment.ratingValue;
  return (
    <Panel>
      {mode === 'details' && (
        <>
          <PanelHeader onClose={onClose} actionButtons={getActionButtons()}>
            <h1 className="hln-2">Segment details</h1>
          </PanelHeader>
          <SegmentDetails segment={segment} currentUserOwnsSegment={currentUserOwnsSegment} />
        </>
      )}
      {mode === 'edit' && (
        <>
          <PanelHeader onClose={onClose}>
            <h1 className="hln-2">Kwaliteit aanpassen</h1>
          </PanelHeader>
          <RatingSection
            onRatingSelect={onRatingSelect}
            currentRatingValue={currentRatingValue}
            isPending={isPending}
            isReadyToRate={true}
          />
        </>
      )}
      {mode === 'delete' && (
        <>
          <PanelHeader onClose={onClose}>
            <h1 className="hln-2">Segment verwijderen?</h1>
          </PanelHeader>
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

  function getActionButtons(): ActionButton[] {
    const actionButtons: ActionButton[] = [];
    if (onEditStart) {
      actionButtons.push({
        iconName: 'edit',
        onClick: onEditStart,
        ariaLabel: 'Segment aanpassen',
      });
    }
    if (onDeleteStart) {
      actionButtons.push({
        iconName: 'delete',
        onClick: onDeleteStart,
        ariaLabel: 'Segment verwijderen',
      });
    }
    return actionButtons;
  }
}

interface SegmentDetailsProps {
  segment: Segment;
  currentUserOwnsSegment: boolean;
}
function SegmentDetails({ segment, currentUserOwnsSegment }: SegmentDetailsProps) {
  const length: number = calculateSegmentLength(segment.coordinates);
  const currentRatingValue: number = segment.ratingValue;
  const currentRatingLabel: string = getRatingByValue(currentRatingValue)?.label || '';
  return (
    <div>
      <p>
        Lengte: <span className={styles.length}>{formatLength(length)}</span>
      </p>
      <p>Kwaliteit: {currentRatingLabel}</p>
      <p>
        {currentUserOwnsSegment
          ? 'Je bent de eigenaar van dit segment'
          : 'Je bent niet de eigenaar van dit segment'}
      </p>
    </div>
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

function formatLength(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}
