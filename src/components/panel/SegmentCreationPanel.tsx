import Panel from './Panel';
import PanelHeader from './PanelHeader';
import PanelInstruction from './PanelInstruction';
import RatingButtons from './RatingButtons';

interface Props {
  controlPointCount: number;
  onCancel: () => void;
  onRatingSelect: (rating: number) => void;
}

export default function SegmentCreation({ controlPointCount, onCancel, onRatingSelect }: Props) {
  const readyToRate = controlPointCount >= 2;
  return (
    <Panel>
      <PanelHeader title="Segment toevoegen" onClose={onCancel} />
      {readyToRate ? (
        <RatingButtons onRatingSelect={onRatingSelect} />
      ) : (
        <PanelInstruction>Klik minstens 2 punten om een segment te maken</PanelInstruction>
      )}
    </Panel>
  );
}
