import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Tag, Link, TagIcon, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { logger } from '@/utils/logger';
import { NfcTag } from '@/types';

const TagsManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [tags, setTags] = useState<NfcTag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<NfcTag | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState<boolean>(false);
  const [availablePets, setAvailablePets] = useState<{ id: string, name: string }[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [newTagCode, setNewTagCode] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
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
      
      logger.info("Fetching tags for user", { userId: session.user.id });
      
      const { data: tags, error } = await supabase
        .from('nfc_tags')
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
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error("Error fetching tags", { error, userId: session.user.id });
        throw error;
      }
      
      logger.info("Tags found", { count: tags?.length || 0, userId: session.user.id });
      
      if (!tags || tags.length === 0) {
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
        
        setTags(sampleTags);
        
        // Also set some sample pets
        if (availablePets.length === 0) {
          setAvailablePets([
            { id: 'sample-pet-1', name: 'ريكس' },
            { id: 'sample-pet-2', name: 'بيلا' }
          ]);
        }
      } else {
        setTags(tags);
      }
    } catch (error) {
      logger.error('Error fetching NFC tags', { error });
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
      logger.error('Error fetching available pets', { error });
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
      logger.error('Error adding NFC tag', { error, tagCode: newTagCode });
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
      
      setTags(prevTags => prevTags.map(tag => 
        tag.id === updatedTag.id ? updatedTag : tag
      ));
      
      setShowLinkDialog(false);
      
      toast({
        title: t('success'),
        description: selectedPetId
          ? t('nfcTags.linkDialog.success')
          : t('tagUnlinked'),
      });
    } catch (error) {
      logger.error('Error linking tag to pet', { error, tagId: selectedTag?.id, petId: selectedPetId });
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
      
      setTags(prevTags => prevTags.map(tag => 
        tag.id === updatedTag.id ? updatedTag : tag
      ));
      
      toast({
        title: t('success'),
        description: updatedTag.is_active
          ? t('tagActivated')
          : t('tagDeactivated'),
      });
    } catch (error) {
      logger.error('Error toggling tag status', { error, tagId, isActive });
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
      
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative">
          <Input
            type="text"
            placeholder={t('placeholder.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Button onClick={() => setShowAddDialog(true)}>
          <Tag className="h-4 w-4 mr-2" />
          {t('nfcTags.addNew')}
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all">{t('community.filters.all')}</TabsTrigger>
          <TabsTrigger value="assigned">{t('dashboard.assigned')}</TabsTrigger>
          <TabsTrigger value="unassigned">{t('dashboard.unassigned')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>{t('allTags')}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTagsTable(filteredTags)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assigned">
          <Card>
            <CardHeader>
              <CardTitle>{t('assignedTags')}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTagsTable(filteredTags.filter(tag => tag.status === 'assigned'))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="unassigned">
          <Card>
            <CardHeader>
              <CardTitle>{t('unassignedTags')}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTagsTable(filteredTags.filter(tag => tag.status === 'unassigned'))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add new tag dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('nfcTags.addDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('nfcTags.addDialog.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="tag-code" className="text-sm font-medium">
                {t('nfcTags.tagCode')}
              </label>
              <Input
                id="tag-code"
                placeholder={t('enterTagCode')}
                value={newTagCode}
                onChange={(e) => setNewTagCode(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t('button.cancel')}
            </Button>
            <Button onClick={handleAddTag}>
              {t('nfcTags.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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

  // Render tags table
  function renderTagsTable(tagsToRender: NfcTag[]) {
    if (loading) {
      return (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>{t('common.loading')}</p>
        </div>
      );
    }
    
    if (tagsToRender.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Tag className="mx-auto h-10 w-10 mb-4 text-gray-400" />
          <p>{t('nfcTags.empty.title')}</p>
          <p className="mt-2">{t('nfcTags.empty.description')}</p>
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('nfcTags.tagCode')}</TableHead>
            <TableHead>{t('nfcTags.status')}</TableHead>
            <TableHead>{t('nfcTags.linkedPet')}</TableHead>
            <TableHead>{t('nfcTags.addedOn')}</TableHead>
            <TableHead>{t('admin.common.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tagsToRender.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell className="font-medium">
                {tag.tag_code}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={getStatusVariant(tag.status)}
                  className={`${!tag.is_active ? 'opacity-50' : ''}`}
                >
                  {getStatusLabel(tag.status, tag.is_active)}
                </Badge>
              </TableCell>
              <TableCell>
                {tag.pet ? tag.pet.name : t('nfcTags.notLinked')}
              </TableCell>
              <TableCell>
                {new Date(tag.created_at).toLocaleDateString(i18n.language)}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openLinkDialog(tag)}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    {tag.pet_id ? t('changeLink') : t('link')}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToggleTagStatus(tag.id, tag.is_active)}
                  >
                    {tag.is_active ? t('deactivate') : t('activate')}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyTagLink(tag.tag_code)}
                  >
                    {t('nfcTags.copyLink')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // Get badge variant by status
  function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
      case 'assigned':
        return 'default';
      case 'unassigned':
        return 'secondary';
      case 'lost':
        return 'destructive';
      case 'disabled':
        return 'outline';
      default:
        return 'outline';
    }
  }

  // Get status label
  function getStatusLabel(status: string, isActive: boolean): string {
    if (!isActive) return t('dashboard.deactivated');
    
    switch (status) {
      case 'assigned':
        return t('dashboard.assigned');
      case 'unassigned':
        return t('dashboard.unassigned');
      case 'lost':
        return t('lost.status.lost');
      case 'disabled':
        return t('dashboard.deactivated');
      default:
        return status;
    }
  }
};

export default TagsManagement;