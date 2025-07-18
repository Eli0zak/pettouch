import React from 'react';
import { TagCard } from '@/components/ui/tag-card';
import { NfcTag } from '@/types';

interface TagsGridProps {
  tags: NfcTag[];
  onLinkPet: (tag: NfcTag) => void;
  onToggleStatus: (tagId: string, isActive: boolean) => void;
  onCopyLink: (tagCode: string) => void;
}

const TagsGrid: React.FC<TagsGridProps> = ({
  tags,
  onLinkPet,
  onToggleStatus,
  onCopyLink,
}) => {
  if (tags.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No tags found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tags.map(tag => (
        <TagCard
          key={tag.id}
          tag={tag}
          onLinkPet={onLinkPet}
          onToggleStatus={onToggleStatus}
          onCopyLink={onCopyLink}
        />
      ))}
    </div>
  );
};

export default TagsGrid;
