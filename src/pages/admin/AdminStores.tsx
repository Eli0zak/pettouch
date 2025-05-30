import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Store as StoreIcon,
  ImagePlus,
  X,
  Link as LinkIcon
} from 'lucide-react';
import { Store } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStoreDialog, setShowStoreDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStore, setCurrentStore] = useState<Partial<Store>>({
    name: '',
    description: '',
    logo_url: '',
    banner_url: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    social_media: {
      facebook: '',
      instagram: '',
      twitter: ''
    },
    is_active: true
  });
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchStores = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('store_stores')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setStores(data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast({
        title: "Error",
        description: "Failed to load stores data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [searchTerm]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      // Handle nested fields like social_media.facebook
      const [parent, child] = field.split('.');
      setCurrentStore(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object || {}),
          [child]: value
        }
      }));
    } else {
      setCurrentStore(prev => ({ ...prev, [field]: value }));
    }
  };

  const resetForm = () => {
    setCurrentStore({
      name: '',
      description: '',
      logo_url: '',
      banner_url: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      social_media: {
        facebook: '',
        instagram: '',
        twitter: ''
      },
      is_active: true
    });
    setIsEditing(false);
  };

  const openStoreDialog = (store?: Store) => {
    if (store) {
      setCurrentStore(store);
      setIsEditing(true);
    } else {
      resetForm();
    }
    setShowStoreDialog(true);
  };

  const handleSaveStore = async () => {
    try {
      // Validate required fields
      if (!currentStore.name) {
        toast({
          title: "Validation Error",
          description: "Store name is required",
          variant: "destructive"
        });
        return;
      }

      if (isEditing && currentStore.id) {
        // Update existing store
        const { error } = await supabase
          .from('store_stores')
          .update({
            name: currentStore.name,
            description: currentStore.description,
            logo_url: currentStore.logo_url,
            banner_url: currentStore.banner_url,
            address: currentStore.address,
            phone: currentStore.phone,
            email: currentStore.email,
            website: currentStore.website,
            social_media: currentStore.social_media,
            is_active: currentStore.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentStore.id);

        if (error) throw error;

        toast({
          title: "Store Updated",
          description: "Store has been updated successfully"
        });
      } else {
        // Create new store
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('store_stores')
          .insert({
            name: currentStore.name,
            description: currentStore.description,
            logo_url: currentStore.logo_url || '',
            banner_url: currentStore.banner_url || '',
            address: currentStore.address || '',
            phone: currentStore.phone || '',
            email: currentStore.email || '',
            website: currentStore.website || '',
            social_media: currentStore.social_media || {},
            is_active: currentStore.is_active ?? true,
            owner_id: user?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: "Store Created",
          description: "Store has been created successfully"
        });
      }

      // Refresh stores list
      fetchStores();
      setShowStoreDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error saving store:', error);
      toast({
        title: "Error",
        description: "Failed to save store",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      // Check if store has products
      const { count, error: countError } = await supabase
        .from('store_products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', storeId);
      
      if (countError) throw countError;
      
      if (count && count > 0) {
        toast({
          title: "Cannot Delete",
          description: `This store has ${count} products. Please remove or reassign them first.`,
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('store_stores')
        .delete()
        .eq('id', storeId);
        
      if (error) throw error;
      
      toast({
        title: "Store Deleted",
        description: "Store has been deleted successfully"
      });
      
      fetchStores();
    } catch (error) {
      console.error('Error deleting store:', error);
      toast({
        title: "Error",
        description: "Failed to delete store",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (storeId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('store_stores')
        .update({ 
          is_active: !isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', storeId);
        
      if (error) throw error;
      
      toast({
        title: "Store Updated",
        description: `Store is now ${!isActive ? 'active' : 'inactive'}`
      });
      
      fetchStores();
    } catch (error) {
      console.error('Error updating store:', error);
      toast({
        title: "Error",
        description: "Failed to update store status",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('admin.stores.title') || 'Stores'}</CardTitle>
            <CardDescription>
              {t('admin.stores.description') || 'Manage stores in your marketplace'}
            </CardDescription>
          </div>
          <Button onClick={() => openStoreDialog()} className="flex items-center gap-1">
            <Plus size={16} />
            <span>{t('admin.stores.addStore') || 'Add Store'}</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('admin.stores.searchStores') || 'Search stores...'}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm 
                ? (t('admin.stores.noStoresFound') || 'No stores found matching your search')
                : (t('admin.stores.noStores') || 'No stores yet. Create your first store!')}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.stores.name') || 'Name'}</TableHead>
                    <TableHead>{t('admin.stores.status') || 'Status'}</TableHead>
                    <TableHead>{t('admin.stores.products') || 'Products'}</TableHead>
                    <TableHead>{t('admin.stores.createdAt') || 'Created At'}</TableHead>
                    <TableHead className="text-right">{t('admin.common.actions') || 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {store.logo_url ? (
                            <img 
                              src={store.logo_url} 
                              alt={store.name} 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <StoreIcon size={16} />
                            </div>
                          )}
                          {store.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={store.is_active ? "success" : "secondary"}>
                          {store.is_active ? 
                            (t('admin.stores.active') || 'Active') : 
                            (t('admin.stores.inactive') || 'Inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {/* This will be filled in dynamically when we fetch product counts */}
                        <span className="text-muted-foreground">-</span>
                      </TableCell>
                      <TableCell>{formatDate(store.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openStoreDialog(store)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleActive(store.id, store.is_active)}
                          >
                            {store.is_active ? <X size={16} /> : <StoreIcon size={16} />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteStore(store.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Store Dialog */}
      <Dialog open={showStoreDialog} onOpenChange={setShowStoreDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 
                (t('admin.stores.editStore') || 'Edit Store') : 
                (t('admin.stores.addStore') || 'Add Store')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.stores.storeDetails') || 'Enter store details below'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('admin.stores.name') || 'Name'} *</Label>
                <Input
                  id="name"
                  value={currentStore.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('admin.stores.storeName') || 'Store name'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">{t('admin.stores.description') || 'Description'}</Label>
                <Textarea
                  id="description"
                  value={currentStore.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('admin.stores.storeDescription') || 'Store description'}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo_url">{t('admin.stores.logoUrl') || 'Logo URL'}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logo_url"
                      value={currentStore.logo_url || ''}
                      onChange={(e) => handleInputChange('logo_url', e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                    <Button variant="outline" size="icon" type="button">
                      <ImagePlus size={16} />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="banner_url">{t('admin.stores.bannerUrl') || 'Banner URL'}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="banner_url"
                      value={currentStore.banner_url || ''}
                      onChange={(e) => handleInputChange('banner_url', e.target.value)}
                      placeholder="https://example.com/banner.png"
                    />
                    <Button variant="outline" size="icon" type="button">
                      <ImagePlus size={16} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">{t('admin.stores.address') || 'Address'}</Label>
                <Textarea
                  id="address"
                  value={currentStore.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={t('admin.stores.storeAddress') || 'Store address'}
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('admin.stores.phone') || 'Phone'}</Label>
                  <Input
                    id="phone"
                    value={currentStore.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t('admin.stores.email') || 'Email'}</Label>
                  <Input
                    id="email"
                    value={currentStore.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="store@example.com"
                    type="email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">{t('admin.stores.website') || 'Website'}</Label>
                <div className="flex gap-2">
                  <Input
                    id="website"
                    value={currentStore.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                  {currentStore.website && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      type="button"
                      onClick={() => window.open(currentStore.website, '_blank')}
                    >
                      <LinkIcon size={16} />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <Label>{t('admin.stores.socialMedia') || 'Social Media'}</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">{t('admin.stores.facebook') || 'Facebook'}</Label>
                    <Input
                      id="facebook"
                      value={currentStore.social_media?.facebook || ''}
                      onChange={(e) => handleInputChange('social_media.facebook', e.target.value)}
                      placeholder="https://facebook.com/storename"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instagram">{t('admin.stores.instagram') || 'Instagram'}</Label>
                    <Input
                      id="instagram"
                      value={currentStore.social_media?.instagram || ''}
                      onChange={(e) => handleInputChange('social_media.instagram', e.target.value)}
                      placeholder="https://instagram.com/storename"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter">{t('admin.stores.twitter') || 'Twitter'}</Label>
                    <Input
                      id="twitter"
                      value={currentStore.social_media?.twitter || ''}
                      onChange={(e) => handleInputChange('social_media.twitter', e.target.value)}
                      placeholder="https://twitter.com/storename"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={currentStore.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="is_active">
                  {t('admin.stores.activeStore') || 'Active store'}
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStoreDialog(false)}>
              {t('admin.common.cancel') || 'Cancel'}
            </Button>
            <Button onClick={handleSaveStore}>
              {isEditing ? 
                (t('admin.common.update') || 'Update') : 
                (t('admin.common.create') || 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStores; 