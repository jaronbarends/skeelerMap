import Panel from './Panel';
import PanelBody from './PanelBody';
import PanelHeader from './PanelHeader';
import RatingSection from './RatingSection';

interface Props {
  isReadyToRate: boolean;
  isPending: boolean;
  onCancel: () => void;
  onRatingSelect: (rating: number) => void;
}

export default function SegmentCreationPanel({
  isReadyToRate,
  isPending,
  onCancel,
  onRatingSelect,
}: Props) {
  return (
    <Panel>
      <PanelHeader onClose={onCancel}>
        <h1 className="hln-2">Segment toevoegen</h1>
      </PanelHeader>
      <PanelBody>
        <RatingSection
          isPending={isPending}
          isReadyToRate={isReadyToRate}
          onRatingSelect={onRatingSelect}
        />
      </PanelBody>
    </Panel>
  );
}
