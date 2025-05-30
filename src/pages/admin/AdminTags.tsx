import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Table Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Dialog Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Alert Dialog Components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Dropdown Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Pagination Components
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Icons
import {
  Tag as TagIcon,
  Plus,
  Trash2,
  MoreVertical,
  Copy,
  RefreshCcw,
  Download,
  QrCode,
  Link as LinkIcon,
  User,
  Check,
  X
} from 'lucide-react';

// Types
import { NfcTag } from '@/types';

// Helper function to generate random tag codes
const generateRandomCode = (length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

interface AdminTagsProps {};

const AdminTags = () => {
  const [tags, setTags] = useState<NfcTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<NfcTag | null>(null);
  const [tagCount, setTagCount] = useState(1);
  const [tagType, setTagType] = useState<'standard' | 'premium'>('standard');
  const [tagStatus, setTagStatus] = useState<'active' | 'inactive' | 'unassigned'>('unassigned');
  const [tagNotes, setTagNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalTags, setTotalTags] = useState(0);
  const [search, setSearch] = useState('');
  const [copiedTagCode, setCopiedTagCode] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const pageSize = 10;

  useEffect(() => {
    fetchTags();
  }, [page, search]);

  const fetchTags = async () => {
    setLoading(true);
    try {
      // Count total tags for pagination
      const { count, error: countError } = await supabase
        .from('nfc_tags')
        .select('*', { count: 'exact', head: true })
        .ilike('tag_code', `%${search}%`) as unknown as { count: number | null, error: any };
      
      if (countError) throw countError;
      setTotalTags(count || 0);

      // Fetch tags with pagination
      let query = supabase
        .from('nfc_tags')
        .select('*, pet:pets(*), owner:users(id, first_name, last_name, email)')
        .ilike('tag_code', `%${search}%`)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      const { data, error } = await query as unknown as { data: NfcTag[], error: any };

      if (error) throw error;
      setTags(data || []);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('Failed to fetch tags'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTags = async () => {
    if (tagCount <= 0 || tagCount > 100) {
      toast({
        title: t('error'),
        description: t('Please enter a number between 1 and 100'),
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      // Verify admin authentication
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!userData || !userData.user) {
        throw new Error('User authentication required');
      }

      let successCount = 0;
      const now = new Date().toISOString();
      
      // Create tags one by one with NULL user_id (unowned)
      for (let i = 0; i < tagCount; i++) {
        // Generate a random code
        const code = generateRandomCode();
        
        // Create the tag without owner (user_id = NULL)
        const { error } = await supabase
          .from('nfc_tags')
          .insert({
            tag_code: code,
            user_id: null, // Create unowned tags that can be claimed later
            is_active: tagStatus === 'active',
            status: tagStatus,
            tag_type: tagType,
            notes: tagNotes || null,
            created_at: now,
            last_updated: now
          });
        
        if (error) {
          console.error('Error creating tag:', error);
          continue;
        }
        
        successCount++;
      }
      
      if (successCount > 0) {
        toast({
          title: t('success'),
          description: `Successfully generated ${successCount} unowned tag${successCount > 1 ? 's' : ''} ready for claiming`,
        });
        // Reset all form fields
        setIsGenerateDialogOpen(false);
        setTagCount(1);
        setTagType('standard');
        setTagStatus('unassigned');
        setTagNotes('');
        // Refresh the tags list
        fetchTags();
      } else {
        throw new Error('Failed to create any tags');
      }
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('admin.tags.error.generate'),
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!selectedTag) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('nfc_tags')
        .delete()
        .eq('id', selectedTag.id) as unknown as { error: any };

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('admin.tags.success.deleted'),
      });

      setIsDeleteDialogOpen(false);
      fetchTags();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('admin.tags.error.delete'),
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyTagLink = (tagCode: string) => {
    const url = `${window.location.origin}/tag/${tagCode}`;
    navigator.clipboard.writeText(url);
    setCopiedTagCode(tagCode);
    toast({
      title: t('success'),
      description: t('admin.tags.success.copied'),
    });
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopiedTagCode(null), 2000);
  };

  const handleExportTags = () => {
    // Create CSV content
    const csvContent = [
      ['Tag Code', 'Type', 'Status', 'Owner', 'Pet', 'Created At', 'Link'],
      ...tags.map(tag => [
        tag.tag_code,
        tag.tag_type || 'standard',
        tag.status || (tag.is_active ? 'active' : 'inactive'),
        tag.owner ? `${tag.owner.first_name || ''} ${tag.owner.last_name || ''}`.trim() : 'Unassigned',
        tag.pet ? tag.pet.name : 'None',
        format(new Date(tag.created_at), 'yyyy-MM-dd'),
        `${window.location.origin}/tag/${tag.tag_code}`
      ])
    ]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `nfc-tags-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkExportQRCodes = () => {
    // This would typically generate a PDF with QR codes
    // For now, we'll just show a toast
    toast({
      title: t('info'),
      description: t('admin.tags.info.qrExport'),
    });
  };

  const totalPages = Math.ceil(totalTags / pageSize);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.tags.title')}</h1>
          <p className="text-muted-foreground">{t('admin.tags.description')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setIsGenerateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t('admin.tags.generate')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreVertical className="mr-2 h-4 w-4" /> {t('admin.tags.actions')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportTags}>
                <Download className="mr-2 h-4 w-4" /> {t('admin.tags.exportCSV')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBulkExportQRCodes}>
                <QrCode className="mr-2 h-4 w-4" /> {t('admin.tags.exportQR')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={fetchTags}>
                <RefreshCcw className="mr-2 h-4 w-4" /> {t('admin.tags.refresh')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('admin.tags.search')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
              />
            </div>
            <Button variant="outline" onClick={() => {
              setSearch('');
              setPage(1);
            }} disabled={!search}>
              {t('admin.tags.clear')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text={t('admin.tags.loading')} />
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.tags.tagCode')}</TableHead>
                    <TableHead>{t('admin.tags.status')}</TableHead>
                    <TableHead>{t('admin.tags.owner')}</TableHead>
                    <TableHead>{t('admin.tags.pet')}</TableHead>
                    <TableHead>{t('admin.tags.created')}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <TagIcon className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-lg font-medium mb-2">{t('admin.tags.noTags')}</p>
                          <p className="text-muted-foreground mb-4">
                            {search ? t('admin.tags.noTagsMatch') : t('admin.tags.noTagsDescription')}
                          </p>
                          {search ? (
                            <Button variant="outline" onClick={() => setSearch('')}>
                              {t('admin.tags.clearSearch')}
                            </Button>
                          ) : (
                            <Button onClick={() => setIsGenerateDialogOpen(true)}>
                              <Plus className="mr-2 h-4 w-4" /> {t('admin.tags.generate')}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TagIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono">{tag.tag_code}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {tag.status === 'unassigned' ? (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              {t('admin.tags.unassigned')}
                            </Badge>
                          ) : tag.is_active ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {tag.status}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              {t('admin.tags.inactive')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {tag.owner ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{tag.owner.first_name || ''} {tag.owner.last_name || ''}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">{t('admin.tags.unassigned')}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {tag.pet ? (
                            <span>{tag.pet.name}</span>
                          ) : (
                            <span className="text-muted-foreground">{t('admin.tags.none')}</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(tag.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyTagLink(tag.tag_code)}
                              title="Copy tag link"
                            >
                              {copiedTagCode === tag.tag_code ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedTag(tag);
                                setIsDeleteDialogOpen(true);
                              }}
                              title="Delete tag"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNumber;
                  
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (page <= 3) {
                    pageNumber = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = page - 2 + i;
                  }
                  
                  if (pageNumber > totalPages) return null;
                  
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => setPage(pageNumber)}
                        isActive={page === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && page < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink onClick={() => setPage(totalPages)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Generate Tags Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.tags.generateDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('admin.tags.generateDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tagCount">{t('admin.tags.generateDialog.count')}</Label>
              <Input
                id="tagCount"
                type="number"
                min="1"
                max="100"
                value={tagCount}
                onChange={(e) => setTagCount(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label htmlFor="tagType">{t('admin.tags.generateDialog.type')}</Label>
              <select
                id="tagType"
                value={tagType}
                onChange={(e) => setTagType(e.target.value as 'standard' | 'premium')}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="standard">{t('admin.tags.types.standard')}</option>
                <option value="premium">{t('admin.tags.types.premium')}</option>
              </select>
            </div>
            <div>
              <Label htmlFor="tagStatus">{t('admin.tags.generateDialog.status')}</Label>
              <select
                id="tagStatus"
                value={tagStatus}
                onChange={(e) => setTagStatus(e.target.value as 'active' | 'inactive' | 'unassigned')}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="unassigned">{t('admin.tags.status.unassigned')}</option>
                <option value="active">{t('admin.tags.status.active')}</option>
                <option value="inactive">{t('admin.tags.status.inactive')}</option>
              </select>
            </div>
            <div>
              <Label htmlFor="tagNotes">{t('admin.tags.generateDialog.notes')}</Label>
              <Input
                id="tagNotes"
                value={tagNotes}
                onChange={(e) => setTagNotes(e.target.value)}
                placeholder={t('admin.tags.generateDialog.notesPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
              {t('admin.tags.generateDialog.cancel')}
            </Button>
            <Button onClick={handleGenerateTags} disabled={processing}>
              {processing ? <LoadingSpinner size="sm" className="mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
              {t('admin.tags.generateDialog.generate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.tags.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.tags.deleteDialog.description')}
              {selectedTag?.pet_id && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <span className="font-semibold text-amber-700">{t('warning')}:</span> {t('admin.tags.deleteDialog.warning')}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.tags.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTag} 
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              {t('admin.tags.deleteDialog.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTags;