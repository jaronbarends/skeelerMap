import { useRef, useEffect, useState } from 'react';

import Button from '@/components/button/Button';
import type { MapUIMode } from '@/components/map/MapUIContainer';
import { calculateSegmentLength } from '@/components/map/mapUtils';
import { getIconByName } from '@/lib/getIconByName';
import type { RatingValue, Segment } from '@/lib/segments';
import { getRatingByValue } from '@/lib/segments';

import Panel from './Panel';
import PanelBody from './PanelBody';
import PanelHeader from './PanelHeader';
import type { ActionButton } from './PanelHeader';
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
  onRatingSelect: (ratingValue: RatingValue) => void;
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
          <PanelBody>
            <SegmentDetails segment={segment} currentUserOwnsSegment={currentUserOwnsSegment} />
          </PanelBody>
        </>
      )}
      {mode === 'edit' && (
        <>
          <PanelHeader onClose={onClose}>
            <h1 className="hln-2">Kwaliteit aanpassen</h1>
          </PanelHeader>
          <PanelBody>
            <RatingSection
              onRatingSelect={onRatingSelect}
              currentRatingValue={currentRatingValue}
              isPending={isPending}
              isReadyToRate={true}
            />
          </PanelBody>
        </>
      )}
      {mode === 'delete' && (
        <>
          <PanelHeader onClose={onClose}>
            <h1 className="hln-2">Segment verwijderen?</h1>
          </PanelHeader>
          <PanelBody>
            {isPending ? (
              <p>Segment aan het verwijderen...</p>
            ) : (
              <>
                <p>Weet je zeker dat je dit segment wil verwijderen?</p>
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
  const [infoIsOpen, setInfoIsOpen] = useState(false);
  const length: number = calculateSegmentLength(segment.coordinates);
  const rating = getRatingByValue(segment.ratingValue);
  const infoIcon = getIconByName('info');
  return (
    <>
      <dl className={styles.specs} data-rating={segment.ratingValue}>
        <dt>Lengte:</dt>
        <dd> {formatLength(length)} </dd>
        <dt>Kwaliteit:</dt>
        <dd>
          {rating.label} <span className={styles.stars}>{rating.stars}</span>{' '}
          <button
            className={styles.infoButton}
            onClick={toggleInfo}
            aria-label="Info over kwaliteit"
          >
            {infoIcon({})}
          </button>
        </dd>
      </dl>
      {infoIsOpen && (
        <p>
          <em>{rating.label}</em> houdt in: {rating.description}
        </p>
      )}
      <p>
        {currentUserOwnsSegment
          ? 'Segment aangemaakt door jou'
          : 'Segment aangemaakt door andere gebruiker'}
      </p>
    </>
  );

  function toggleInfo() {
    setInfoIsOpen(!infoIsOpen);
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

function formatLength(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}
