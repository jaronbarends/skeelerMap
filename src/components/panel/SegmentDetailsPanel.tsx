import Panel from './Panel';
import PanelHeader from './PanelHeader';
import PanelInstruction from './PanelInstruction';
import RatingButtons from './RatingButtons';
import styles from './SegmentDetailsPanel.module.css';

type Mode = 'view' | 'edit' | 'delete';

interface Props {
  lengthLabel: string;
  currentRating: number;
  mode: Mode;
  onClose: () => void;
  onEditStart: () => void;
  onDeleteStart: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
  onRatingSelect: (rating: number) => void;
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
}: Props) {
  return (
    <Panel>
      {mode === 'view' && (
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
          <RatingButtons onRatingSelect={onRatingSelect} currentRating={currentRating} />
        </>
      )}
      {mode === 'delete' && (
        <>
          <PanelHeader title="Segment verwijderen?" onClose={onDeleteCancel} />
          <PanelInstruction>Weet je zeker dat je dit segment wil verwijderen?</PanelInstruction>
          <div className={styles.deleteActions}>
            <button className={styles.cancelButton} onClick={onDeleteCancel}>
              Annuleren
            </button>
            <button className={styles.confirmButton} onClick={onDeleteConfirm}>
              Verwijderen
            </button>
          </div>
        </>
      )}
    </Panel>
  );
}
