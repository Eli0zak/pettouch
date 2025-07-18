import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';

interface TagsFiltersProps {
  activeFilter: string;
  onChange: (value: string) => void;
}

const TagsFilters: React.FC<TagsFiltersProps> = ({ activeFilter, onChange }) => {
  const { t } = useTranslation();

  return (
    <Tabs
      value={activeFilter}
      onValueChange={onChange}
      className="w-full mb-6"
    >
      <TabsList className="grid grid-cols-3 rounded-full bg-gray-200 dark:bg-gray-700 p-1">
        <TabsTrigger
          value="all"
          className="text-center rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          {t('tags.filters.all')}
        </TabsTrigger>
        <TabsTrigger
          value="assigned"
          className="text-center rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          {t('tags.filters.assigned')}
        </TabsTrigger>
        <TabsTrigger
          value="unassigned"
          className="text-center rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          {t('tags.filters.unassigned')}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default TagsFilters;
