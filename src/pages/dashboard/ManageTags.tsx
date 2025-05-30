import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/PageGuard';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { QRCodeSVG } from 'qrcode.react';
import { Tag, QrCode, Unlink, Trash2, Copy, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { logger } from '@/utils/logger';

interface TagData {
  id: string;
  tag_code: string;
  pet_id: string | null;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  pet?: {
    id: string;
    name: string;
  } | null;
}

const ManageTags = () => {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [tagUrl, setTagUrl] = useState<string>('');
  const { userId, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (authLoading) {
      logger.info('Auth is still loading');
      return;
    }
    
    if (!isAuthenticated) {
      logger.info('User is not authenticated');
      return;
    }
    
    logger.info('ManageTags mounted', { userId });
    fetchTags();
  }, [userId, isAuthenticated, authLoading]);

  const fetchTags = async () => {
    logger.info('Fetching tags for user', { userId });
    setLoading(true);
    try {
      if (!userId) {
        logger.warn('No userId available');
        return;
      }

      // Only fetch tags owned by the current user
      const { data, error } = await supabase
        .from('nfc_tags')
        .select(`
          id,
          tag_code,
          pet_id,
          user_id,
          status,
          created_at,
          updated_at,
          pet:pets(id, name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching tags', { error, userId });
        throw error;
      }
      
      logger.info('Tags fetched', { data, count: data?.length || 0, userId });
      setTags((data as any) || []);
      
    } catch (error: any) {
      logger.error('Error fetching tags', { error, userId });
      toast({
        title: t('error'),
        description: error.message || t('Failed to fetch tags'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkTag = async () => {
    if (!selectedTag) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('nfc_tags')
        .update({
          pet_id: null,
          status: 'unassigned',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTag.id);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('Tag unlinked successfully'),
      });

      setIsUnlinkDialogOpen(false);
      fetchTags();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('Failed to unlink tag'),
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
        .eq('id', selectedTag.id);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('Tag deleted successfully'),
      });

      setIsDeleteDialogOpen(false);
      fetchTags();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('Failed to delete tag'),
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const openQRDialog = (tag: TagData) => {
    setSelectedTag(tag);
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/tag/${tag.tag_code}`;
    setTagUrl(url);
    setIsQRDialogOpen(true);
  };

  const openUnlinkDialog = (tag: TagData) => {
    setSelectedTag(tag);
    setIsUnlinkDialogOpen(true);
  };

  const openDeleteDialog = (tag: TagData) => {
    setSelectedTag(tag);
    setIsDeleteDialogOpen(true);
  };

  const copyTagLink = () => {
    if (tagUrl) {
      navigator.clipboard.writeText(tagUrl);
      toast({
        title: t('success'),
        description: t('Link copied to clipboard'),
      });
    }
  };

  const downloadQRCode = () => {
    if (!selectedTag) return;
    
    const svgElement = document.getElementById('tag-qr-code');
    if (svgElement) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 200;
        canvas.height = 200;
        
        if (ctx) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            const pngUrl = canvas.toDataURL('image/png');
            
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `tag-${selectedTag.tag_code}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            URL.revokeObjectURL(url);
          };
          img.src = url;
        }
      } catch (error) {
        console.error('Error downloading QR code:', error);
        toast({
          title: t('error'),
          description: t('Failed to download QR code'),
          variant: 'destructive',
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text={t("Loading...")} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Please sign in to view your NFC tags.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("nfcTags.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {tags.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">{t("nfcTags.empty.title")}</h3>
                <p className="text-muted-foreground">
                  {t("nfcTags.empty.description")}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("nfcTags.tagCode")}</TableHead>
                    <TableHead>{t("nfcTags.linkedPet")}</TableHead>
                    <TableHead>{t("nfcTags.addedOn")}</TableHead>
                    <TableHead className="text-right">{t("nfcTags.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          {tag.tag_code}
                        </div>
                      </TableCell>
                      <TableCell>
                        {tag.pet ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {tag.pet.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">{t("nfcTags.notLinked")}</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(tag.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openQRDialog(tag)}>
                            <QrCode className="h-4 w-4" />
                          </Button>
                          {tag.pet_id && (
                            <Button variant="outline" size="sm" onClick={() => openUnlinkDialog(tag)}>
                              <Unlink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => openDeleteDialog(tag)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("nfcTags.qrDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("nfcTags.qrDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG 
                id="tag-qr-code"
                value={tagUrl} 
                size={200} 
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center">
              <p className="font-medium">{selectedTag?.tag_code}</p>
              <p className="text-sm text-muted-foreground break-all">{tagUrl}</p>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={copyTagLink}>
              <Copy className="mr-2 h-4 w-4" /> {t("nfcTags.copyLink")}
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={downloadQRCode}>
              <QrCode className="mr-2 h-4 w-4" /> {t("nfcTags.downloadQR")}
            </Button>
            <Button className="w-full sm:w-auto" asChild>
              <a href={tagUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> {t("nfcTags.openLink")}
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlink Tag Dialog */}
      <AlertDialog open={isUnlinkDialogOpen} onOpenChange={setIsUnlinkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("nfcTags.unlinkDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("nfcTags.unlinkDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("button.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlinkTag} disabled={processing}>
              {processing ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              {t("button.unlink")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Tag Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("nfcTags.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("nfcTags.deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("button.cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTag} 
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              {t("button.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageTags;
