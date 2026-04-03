import Panel from './Panel';
import PanelHeader from './PanelHeader';
import RatingSection from './RatingSection';

interface Props {
  isReadyToRate: boolean;
  isPending: boolean;
  onCancel: () => void;
  onRatingSelect: (rating: number) => void;
}

export default function SegmentCreation({
  isReadyToRate,
  isPending,
  onCancel,
  onRatingSelect,
}: Props) {
  return (
    <Panel>
      <PanelHeader title="Segment toevoegen" onClose={onCancel} />
      <RatingSection
        isPending={isPending}
        isReadyToRate={isReadyToRate}
        onRatingSelect={onRatingSelect}
      />
    </Panel>
  );
}
