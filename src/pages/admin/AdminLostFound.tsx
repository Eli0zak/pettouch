import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Calendar,
  Phone,
  Mail,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { format } from 'date-fns';
import { LostFoundPost } from '@/types';

const AdminLostFound = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<LostFoundPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<LostFoundPost | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('lost_found_posts')
        .select(`
          *,
          user:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const postsWithTypedStatus = data.map(post => ({
          ...post,
          status: post.status as 'open' | 'resolved' | 'closed'
        }));
        setPosts(postsWithTypedStatus);
      }
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report: LostFoundPost) => {
    setSelectedPost(report);
    setIsViewDialogOpen(true);
  };

  const handleDeleteReport = async () => {
    if (!selectedPost) return;

    try {
      const { error } = await supabase
        .from('lost_found_posts')
        .delete()
        .eq('id', selectedPost.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report deleted successfully",
      });

      fetchReports();
      setIsDeleteDialogOpen(false);
      setIsViewDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  const handleResolveReport = async () => {
    if (!selectedPost) return;

    try {
      const { error } = await supabase
        .from('lost_found_posts')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', selectedPost.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report marked as resolved",
      });

      fetchReports();
      setIsResolveDialogOpen(false);
      setIsViewDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve report",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'open':
        return {
          variant: "default" as const,
          className: "bg-blue-100 text-blue-800"
        };
      case 'resolved':
        return {
          variant: "default" as const,
          className: "bg-green-100 text-green-800"
        };
      case 'closed':
        return {
          variant: "secondary" as const,
          className: "bg-gray-100 text-gray-800"
        };
      default:
        return {
          variant: "default" as const,
          className: ""
        };
    }
  };

  const filteredReports = posts.filter(report => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      report.title.toLowerCase().includes(searchLower) ||
      report.description.toLowerCase().includes(searchLower) ||
      (report.pet_name && report.pet_name.toLowerCase().includes(searchLower)) ||
      (report.last_seen_location && report.last_seen_location.toLowerCase().includes(searchLower)) ||
      (report.user?.email && report.user.email.toLowerCase().includes(searchLower));
    
    const matchesStatus = !statusFilter || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lost & Found Reports</h1>
        <Button onClick={fetchReports}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Reports Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pet-primary"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Pet Details</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No reports found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                          {report.image_url ? (
                            <img 
                              src={report.image_url} 
                              alt="Report"
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {report.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {report.pet_name && (
                          <p className="font-medium">{report.pet_name}</p>
                        )}
                        {report.pet_type && (
                          <Badge variant="outline" className="mt-1">
                            {report.pet_type.charAt(0).toUpperCase() + report.pet_type.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[150px]">
                          {report.last_seen_location || 'Not specified'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.user ? (
                        <div>
                          <p className="font-medium">
                            {report.user.first_name || report.user.last_name 
                              ? `${report.user.first_name || ''} ${report.user.last_name || ''}`.trim()
                              : 'Anonymous'
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">{report.user.email}</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Anonymous</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge {...getStatusBadgeProps(report.status)}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(report.created_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewReport(report)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        {report.status === 'open' && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedPost(report);
                              setIsResolveDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only">Mark Resolved</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
      
      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Detailed information about this lost/found report.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-6">
              {selectedPost.image_url && (
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <img 
                    src={selectedPost.image_url} 
                    alt="Report"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-bold">{selectedPost.title}</h3>
                <Badge {...getStatusBadgeProps(selectedPost.status)} className="mt-2">
                  {selectedPost.status.charAt(0).toUpperCase() + selectedPost.status.slice(1)}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="mt-1">{selectedPost.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pet Name</p>
                  <p>{selectedPost.pet_name || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pet Type</p>
                  <p>{selectedPost.pet_type 
                    ? selectedPost.pet_type.charAt(0).toUpperCase() + selectedPost.pet_type.slice(1)
                    : 'Not specified'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pet Breed</p>
                  <p>{selectedPost.pet_breed || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pet Color</p>
                  <p>{selectedPost.pet_color || 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Seen Location</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p>{selectedPost.last_seen_location || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Phone</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedPost.contact_phone || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedPost.contact_email || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dates</p>
                <div className="space-y-2 mt-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">Reported: {formatDate(selectedPost.created_at)}</p>
                      {selectedPost.resolved_at && (
                        <p className="text-sm text-muted-foreground">
                          Resolved: {formatDate(selectedPost.resolved_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedPost && selectedPost.status === 'open' && (
              <>
                <Button
                  variant="default"
                  onClick={() => {
                    setIsResolveDialogOpen(true);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </Button>
              </>
            )}
            <Button
              variant="destructive"
              onClick={() => {
                setIsDeleteDialogOpen(true);
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Delete Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Confirmation Dialog */}
      <AlertDialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Resolved?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the report as resolved. This indicates that the pet has been found
              or returned to their owner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsResolveDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleResolveReport}>
              Mark as Resolved
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The report will be permanently deleted from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteReport}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminLostFound;
