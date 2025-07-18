import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tag, MoreVertical, Link as LinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NfcTag } from '@/types';

interface TagCardProps {
  tag: NfcTag;
  onLinkPet: (tag: NfcTag) => void;
  onToggleStatus: (tagId: string, isActive: boolean) => void;
  onCopyLink: (tagCode: string) => void;
}

export const TagCard: React.FC<TagCardProps> = ({
  tag,
  onLinkPet,
  onToggleStatus,
  onCopyLink,
}) => {
  const { t } = useTranslation();

  const isAssigned = tag.status === 'assigned';
  const statusColor = isAssigned ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';

  return (
    <Card className="relative hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Status Badge */}
        <Badge 
          className={`absolute top-3 right-12 ${statusColor}`}
          variant="outline"
        >
          {isAssigned ? t('tags.card.assignedLabel') : t('tags.card.unassignedLabel')}
        </Badge>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isAssigned && (
              <DropdownMenuItem onClick={() => onLinkPet(tag)}>
                {t('tags.card.actions.changePet')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onCopyLink(tag.tag_code)}>
              {t('tags.card.actions.copyLink')}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onToggleStatus(tag.id, tag.is_active)}
              className="text-red-600"
            >
              {t('tags.card.actions.deactivate')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tag Icon and Code */}
        <div className="flex items-center mb-4">
          <Tag className="h-8 w-8 mr-3 text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-600">{t('nfcTags.tagCode')}</p>
            <p className="text-lg font-semibold">{tag.tag_code}</p>
          </div>
        </div>

        {/* Main Content - Conditional based on assignment status */}
        {isAssigned ? (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">{t('tags.card.linkedTo')}</p>
            <div className="flex items-center">
              {tag.pet?.profile_image_url ? (
                <img
                  src={tag.pet.profile_image_url}
                  alt={tag.pet.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 mr-2" />
              )}
              <span className="font-medium">{tag.pet?.name}</span>
            </div>
          </div>
        ) : (
          <Button 
            onClick={() => onLinkPet(tag)}
            className="w-full mt-4"
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            {t('tags.card.linkToPet')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
