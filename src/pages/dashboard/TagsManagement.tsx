import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { logger } from '@/utils/logger';
import { NfcTag, Pet } from '@/types';
import TagsFilters from '@/components/dashboard/tags-management/TagsFilters';
import TagsGrid from '@/components/dashboard/tags-management/TagsGrid';
import { Tag, Link } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TagsManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [tags, setTags] = useState<NfcTag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<NfcTag | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState<boolean>(false);
  const [availablePets, setAvailablePets] = useState<{ id: string, name: string }[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>(window.location.origin);

  // Fetch user's NFC tags
  const fetchUserTags = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: t('error'),
          description: t('access.loginRequired'),
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      logger.info("Fetching tags for user", { userId: session.user.id, path: location.pathname });
      
      const { data: fetchedTags, error } = await supabase
        .from('nfc_tags')
        .select(`
          *,
          pet:pet_id (
            name,
            profile_image_url
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error("Error fetching tags", { error, userId: session.user.id, path: location.pathname });
        throw error;
      }
      
      logger.info("Tags found", { count: fetchedTags?.length || 0, userId: session.user.id });
      
      if (!fetchedTags || fetchedTags.length === 0) {
        logger.info("Adding sample tag data for UI testing", { userId: session.user.id });
        
        // Add some sample tags for demonstration
        const sampleTags: NfcTag[] = [
          {
            id: 'sample-1',
            tag_code: 'NFC001',
            pet_id: 'sample-pet-1',
            user_id: session.user.id,
            created_at: new Date().toISOString(),
            activated_at: new Date().toISOString(),
            is_active: true,
            notes: null,
            tag_type: 'standard',
            status: 'assigned',
            last_updated: new Date().toISOString(),
            pet: {
              name: 'ريكس',
              profile_image_url: null
            }
          },
          {
            id: 'sample-2',
            tag_code: 'NFC002',
            pet_id: 'sample-pet-2',
            user_id: session.user.id,
            created_at: new Date().toISOString(),
            activated_at: new Date().toISOString(),
            is_active: true,
            notes: null,
            tag_type: 'standard',
            status: 'assigned',
            last_updated: new Date().toISOString(),
            pet: {
              name: 'بيلا',
              profile_image_url: null
            }
          },
          {
            id: 'sample-3',
            tag_code: 'NFC003',
            pet_id: null,
            user_id: session.user.id,
            created_at: new Date().toISOString(),
            activated_at: null,
            is_active: true,
            notes: null,
            tag_type: 'standard',
            status: 'unassigned',
            last_updated: new Date().toISOString(),
            pet: null
          }
        ];
        
        setTags(sampleTags as NfcTag[]);
        
        // Also set some sample pets
        if (availablePets.length === 0) {
          setAvailablePets([
            { id: 'sample-pet-1', name: 'ريكس' },
            { id: 'sample-pet-2', name: 'بيلا' }
          ]);
        }
      } else {
        // Transform pet array to single object or null
        const transformedTags = fetchedTags.map(tag => ({
          ...tag,
          pet: Array.isArray(tag.pet) ? (tag.pet.length > 0 ? tag.pet[0] : null) : tag.pet
        })) as NfcTag[];
        setTags(transformedTags);
      }
    } catch (error) {
      logger.error('Error fetching NFC tags', { error, path: location.pathname });
      toast({
        title: t('error'),
        description: t('common.error'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch available pets for linking
  const fetchAvailablePets = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;
      
      const { data: pets, error } = await supabase
        .from('pets')
        .select('id, name')
        .eq('owner_id', session.user.id)
        .eq('is_active', true);
      
      if (error) {
        throw error;
      }
      
      setAvailablePets(pets || []);
    } catch (error) {
      logger.error('Error fetching available pets', { error, path: location.pathname });
    }
  };

  // Add new NFC tag
  const handleAddTag = async () => {
    try {
      if (!newTagCode.trim()) {
        toast({
          title: t('error'),
          description: t('form.required'),
          variant: "destructive",
        });
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: t('error'),
          description: t('access.loginRequired'),
          variant: "destructive",
        });
        return;
      }
      
      const { data: existingTag, error: checkError } = await supabase
        .from('nfc_tags')
        .select('id')
        .eq('tag_code', newTagCode)
        .single();
      
      if (existingTag) {
        toast({
          title: t('error'),
          description: t('tagExists'),
          variant: "destructive",
        });
        return;
      }
      
      const { data: tag, error } = await supabase
        .from('nfc_tags')
        .insert({
          tag_code: newTagCode,
          user_id: session.user.id,
          status: 'unassigned',
          tag_type: 'standard',
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setTags(prevTags => [tag, ...prevTags]);
      setNewTagCode('');
      setShowAddDialog(false);
      
      toast({
        title: t('success'),
        description: t('tagAdded'),
      });
    } catch (error) {
      logger.error('Error adding NFC tag', { error, tagCode: newTagCode, path: location.pathname });
      toast({
        title: t('error'),
        description: t('common.error'),
        variant: "destructive",
      });
    }
  };

  // Link NFC tag to pet
  const handleLinkTagToPet = async () => {
    try {
      if (!selectedTag) return;
      
  const { data: updatedTag, error } = await supabase
    .from('nfc_tags')
    .update({
      pet_id: selectedPetId || null,
      status: selectedPetId ? 'assigned' : 'unassigned',
      activated_at: selectedPetId ? new Date().toISOString() : null
    })
    .eq('id', selectedTag.id)
    .select(`
      id,
      tag_code,
      pet_id,
      user_id,
      created_at,
      activated_at,
      is_active,
      notes,
      tag_type,
      status,
      last_updated,
      pet:pet_id (
        name,
        profile_image_url
      )
    `)
    .single();
  
  if (error) {
    throw error;
  }
  
  // Transform pet array to single object or null
  const transformedTag = {
    ...updatedTag,
    pet: Array.isArray(updatedTag.pet) ? (updatedTag.pet.length > 0 ? updatedTag.pet[0] : null) : updatedTag.pet
  };
  
  setTags(prevTags => prevTags.map(tag => 
    tag.id === transformedTag.id ? transformedTag : tag
  ));
  
  setShowLinkDialog(false);
  
  toast({
    title: t('success'),
    description: selectedPetId
      ? t('nfcTags.linkDialog.success')
      : t('tagUnlinked'),
  });
    } catch (error) {
      logger.error('Error linking tag to pet', { error, tagId: selectedTag?.id, petId: selectedPetId, path: location.pathname });
      toast({
        title: t('error'),
        description: t('nfcTags.linkDialog.error'),
        variant: "destructive",
      });
    }
  };

  // Toggle NFC tag activation
  const handleToggleTagStatus = async (tagId: string, isActive: boolean) => {
    // If it's a sample tag, show a message
    if (tagId.startsWith('sample-')) {
      toast({
        title: t('info'),
        description: "عرض توضيحي فقط. هذه البيانات عينة اختبار.",
        variant: "default",
      });
      
      // Update UI directly for sample tags
      setTags(prevTags => prevTags.map(tag => 
        tag.id === tagId ? {...tag, is_active: !isActive} : tag
      ));
      
      return;
    }
    
    try {
  const { data: updatedTag, error } = await supabase
    .from('nfc_tags')
    .update({
      is_active: !isActive
    })
    .eq('id', tagId)
    .select(`
      id,
      tag_code,
      pet_id,
      user_id,
      created_at,
      activated_at,
      is_active,
      notes,
      tag_type,
      status,
      last_updated,
      pet:pet_id (
        name,
        profile_image_url
      )
    `)
    .single();
  
  if (error) {
    throw error;
  }
  
  // Transform pet array to single object or null
  const transformedTag = {
    ...updatedTag,
    pet: Array.isArray(updatedTag.pet) ? (updatedTag.pet.length > 0 ? updatedTag.pet[0] : null) : updatedTag.pet
  };
  
  setTags(prevTags => prevTags.map(tag => 
    tag.id === transformedTag.id ? transformedTag : tag
  ));
  
  toast({
    title: t('success'),
    description: updatedTag.is_active
      ? t('tagActivated')
      : t('tagDeactivated'),
  });
    } catch (error) {
      logger.error('Error toggling tag status', { error, tagId, isActive, path: location.pathname });
      toast({
        title: t('error'),
        description: t('common.error'),
        variant: "destructive",
      });
    }
  };

  // Copy tag link
  const handleCopyTagLink = (tagCode: string) => {
    const url = `${baseUrl}/tag/${tagCode}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: t('copied'),
      description: t('linkCopied'),
    });
  };

  // Open link dialog
  const openLinkDialog = (tag: NfcTag) => {
    // If it's a sample tag, show a message
    if (tag.id.startsWith('sample-')) {
      toast({
        title: t('info'),
        description: "عرض توضيحي فقط. هذه البيانات عينة اختبار.",
        variant: "default",
      });
      return;
    }
    
    setSelectedTag(tag);
    setSelectedPetId(tag.pet_id || '');
    setShowLinkDialog(true);
  };

  // Filter tags by search
  const filteredTags = tags.filter(tag => 
    tag.tag_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tag.pet?.name && tag.pet.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Load data when component mounts
  useEffect(() => {
    fetchUserTags();
    fetchAvailablePets();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('dashboard.tagsManagement')}</h1>
        <p className="text-gray-600">{t('nfcTags.description')}</p>
      </div>
      
      <div className="mb-6">
        <TagsFilters activeFilter={activeFilter} onChange={setActiveFilter} />
      </div>
      
      <div>
        <Input
          type="text"
          placeholder={t('search.placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm mb-6"
        />
      </div>
      
      <div>
        <TagsGrid
          tags={filteredTags.filter(tag => {
            if (activeFilter === 'all') return true;
            return tag.status === activeFilter;
          })}
          onLinkPet={openLinkDialog}
          onToggleStatus={handleToggleTagStatus}
          onCopyLink={handleCopyTagLink}
        />
      </div>
      
      {/* Link tag to pet dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('nfcTags.linkDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('nfcTags.linkDialog.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedTag && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-1">{t('nfcTags.tagCode')}:</p>
                <p className="font-medium">{selectedTag.tag_code}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="pet-select" className="text-sm font-medium">
                {t('pet.name')}
              </label>
              <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('nfcTags.linkDialog.choosePet')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('unlink')}</SelectItem>
                  {availablePets.map(pet => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              {t('button.cancel')}
            </Button>
            <Button onClick={handleLinkTagToPet}>
              {selectedPetId ? t('nfcTags.linkDialog.linkPet') : t('nfcTags.unlink')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

};

export default TagsManagement;