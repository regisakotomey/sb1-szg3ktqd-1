'use client';

import AdSpotHeader from './sections/AdSpotHeader';
import AdSpotActions from './sections/AdSpotActions';
import AdSpotStatistics from './sections/AdSpotStatistics';
import AdSpotCreator from './sections/AdSpotCreator';
import AdSpotComments from './sections/AdSpotComments';

interface AdSpot {
  _id: string;
  media: Array<{
    url: string;
    caption: string;
  }>;
  creator?: {
    id: string;
    name: string;
    followers: number;
    isFollowed: boolean;
    type: 'user' | 'place';
  };
  views: Array<{ userId: string; viewedAt: string }>;
}

interface DesktopAdSpotViewProps {
  adSpot: AdSpot;
  isOwner: boolean;
  isCreatorFollowing: boolean;
  currentMediaIndex: number;
  onChangeMedia: (index: number) => void;
  onShare: () => void;
  onSponsor: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onToggleFollow: (newState: boolean) => void;
}

export default function DesktopAdSpotView({
  adSpot,
  isOwner,
  isCreatorFollowing,
  currentMediaIndex,
  onChangeMedia,
  onShare,
  onSponsor,
  onEdit,
  onDelete,
  onReport,
  onToggleFollow
}: DesktopAdSpotViewProps) {
  return (
    <main className="flex-1 pt-[76px] mx-auto w-full max-w-[800px] transition-all">
      <div className="p-4">
        <AdSpotHeader
          media={adSpot.media}
          currentIndex={currentMediaIndex}
          onChangeMedia={onChangeMedia}
        />

        <AdSpotActions
          adSpotId={adSpot._id}
          isOwner={isOwner}
          onSponsor={onSponsor}
          onEdit={onEdit}
          onDelete={onDelete}
          onReport={onReport}
          onShare={onShare}
        />

        {isOwner ? (
          <AdSpotStatistics
            viewCount={adSpot.views?.length || 0}
          />
        ) : adSpot.creator && (
          <AdSpotCreator
            creator={adSpot.creator}
            isOwner={isOwner}
            isFollowing={isCreatorFollowing}
            onFollow={() => onToggleFollow(!isCreatorFollowing)}
          />
        )}

        <AdSpotComments adSpotId={adSpot._id} />
      </div>
    </main>
  );
}