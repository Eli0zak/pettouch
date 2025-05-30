import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { SubscriptionRequest } from '@/types';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ExternalLink,
  FileImage,
  Search,
  Filter,
  Info
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const AdminUpgradeRequests = () => {
  const { toast } = useToast();
  const [upgradeRequests, setUpgradeRequests] = useState<SubscriptionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detailsRequest, setDetailsRequest] = useState<SubscriptionRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    const fetchUpgradeRequests = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching subscription requests...");
        
        // Fetch all subscription requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('subscription_requests')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (requestsError) {
          console.error("Error fetching subscription requests:", requestsError);
          throw requestsError;
        }
        
        console.log("Fetched requests:", requestsData);
        
        // If there are requests, fetch user details for each request
        if (requestsData && requestsData.length > 0) {
          const requestsWithUserDetails = await Promise.all(
            requestsData.map(async (request) => {
              // Fetch user details for this request
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('first_name, last_name, email')
                .eq('id', request.user_id)
                .single();
                
              if (userError) {
                console.warn(`Could not fetch user details for request ${request.id}:`, userError);
                return { ...request, user: null };
              }
              
              return { ...request, user: userData };
            })
          );
          
          setUpgradeRequests(requestsWithUserDetails);
        } else {
          setUpgradeRequests([]);
        }
      } catch (error: any) {
        console.error('Error fetching upgrade requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to load upgrade requests.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUpgradeRequests();
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('custom-upgrade-requests-channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'subscription_requests' 
      }, () => {
        fetchUpgradeRequests();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleStatusChange = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    setIsProcessing(true);
    try {
      // Update the subscription request status
      const { error } = await supabase
        .from('subscription_requests')
        .update({ 
          status, 
          notes: notes || undefined
        })
        .eq('id', requestId);
        
      if (error) throw error;
      
      // The database trigger will automatically update the user's plan and subscription history
      if (status === 'approved') {
        const request = upgradeRequests.find(req => req.id === requestId);
        if (request) {
          console.log(`Approving subscription request for user ${request.user_id} to upgrade to ${request.requested_plan}`);
          
          // Update the user's plan
          const { error: userError } = await supabase
            .from('users')
            .update({ 
              plan: request.requested_plan
            })
            .eq('id', request.user_id);
            
          if (userError) {
            throw new Error(`Failed to update user plan: ${userError.message}`);
          }
          
          // Record in subscription history
          const { error: historyError } = await supabase
            .from('subscription_history')
            .insert({
              user_id: request.user_id,
              previous_plan: request.current_plan,
              new_plan: request.requested_plan,
              change_date: new Date().toISOString(),
              request_id: requestId
            });
            
          if (historyError) {
            console.warn("Could not record subscription history:", historyError);
          }
        }
      }
      
      // Update local state
      setUpgradeRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status, notes } : req
      ));
      
      toast({
        title: 'Success',
        description: `Upgrade request ${status === 'approved' ? 'approved' : 'rejected'} successfully.`,
      });
      
      setSelectedRequestId(null);
      setRejectReason('');
    } catch (error: any) {
      console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} request:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${status === 'approved' ? 'approve' : 'reject'} the request.`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getFilteredRequests = () => {
    let filtered = upgradeRequests;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req => 
        req.phone_number?.toLowerCase().includes(query) ||
        req.user_id?.toLowerCase().includes(query) ||
        req.payment_method?.toLowerCase().includes(query) ||
        (req.user as any)?.email?.toLowerCase().includes(query) ||
        (req.user as any)?.first_name?.toLowerCase().includes(query) ||
        (req.user as any)?.last_name?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  const displayUserName = (request: SubscriptionRequest) => {
    const user = request.user as any;
    if (!user) return "Unknown User";
    if (user?.first_name || user?.last_name) {
      return `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    }
    return user?.email || "Unnamed Customer";
  };

  const openDetailsDialog = (request: SubscriptionRequest) => {
    setDetailsRequest(request);
    setShowDetailsDialog(true);
  };

  const filteredRequests = getFilteredRequests();
  
  console.log("Filtered requests:", filteredRequests);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscription Upgrade Requests</h2>
          <p className="text-muted-foreground">Manage and process customer subscription upgrade requests.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <span>Filter</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" text="Loading upgrade requests..." />
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No upgrade requests found</CardTitle>
            <CardDescription>
              {filterStatus !== 'all' || searchQuery 
                ? 'Try changing your filters or search query'
                : 'When customers request subscription upgrades, they will appear here'}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                Showing {filteredRequests.length} of {upgradeRequests.length} subscription upgrade requests
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Current Plan</TableHead>
                  <TableHead>Requested Plan</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow 
                    key={request.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openDetailsDialog(request)}
                  >
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(request.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{displayUserName(request)}</span>
                        <span className="text-sm text-muted-foreground">{(request.user as any)?.email || 'No email'}</span>
                        <span className="text-xs text-muted-foreground">Phone: {request.phone_number || 'Not provided'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {request.current_plan || 'Unknown'}
                    </TableCell>
                    <TableCell className="capitalize">
                      <div className="flex flex-col">
                        <span>{request.requested_plan || 'Unknown'}</span>
                        {request.notes && request.notes.includes('Duration:') && (
                          <span className="text-xs text-muted-foreground">
                            {request.notes.split(',').filter(note => 
                              note.includes('Duration:') || note.includes('Amount:')
                            ).join(', ')}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {request.payment_method || 'Not specified'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {request.transaction_proof_url && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            asChild
                            title="View payment proof"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              window.open(request.transaction_proof_url, '_blank');
                            }}
                          >
                            <a href={request.transaction_proof_url} target="_blank" rel="noopener noreferrer">
                              <FileImage className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="icon"
                          title="View details"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            openDetailsDialog(request);
                          }}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-green-500 hover:text-green-700"
                              title="Approve request"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click
                                handleStatusChange(request.id, 'approved');
                              }}
                              disabled={isProcessing}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700"
                                  title="Reject request"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click
                                    setSelectedRequestId(request.id);
                                  }}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Upgrade Request</DialogTitle>
                                  <DialogDescription>
                                    Provide a reason for rejecting this upgrade request. This will be communicated to the user.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="rejectReason">Reason for rejection (optional)</Label>
                                    <Textarea
                                      id="rejectReason"
                                      placeholder="Enter reason for rejection..."
                                      value={rejectReason}
                                      onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setSelectedRequestId(null);
                                      setRejectReason('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => {
                                      if (selectedRequestId) {
                                        handleStatusChange(selectedRequestId, 'rejected', rejectReason);
                                      }
                                    }}
                                    disabled={isProcessing}
                                  >
                                    Reject Request
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Request Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Request Details</DialogTitle>
          </DialogHeader>
          
          {detailsRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Customer</Label>
                  <div className="font-medium">{displayUserName(detailsRequest)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(detailsRequest.status)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Current Plan</Label>
                  <div className="font-medium capitalize">{detailsRequest.current_plan}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Requested Plan</Label>
                  <div className="font-medium capitalize">{detailsRequest.requested_plan}</div>
                </div>
              </div>
              
              {/* Extract and display duration and amount if available */}
              {detailsRequest.notes && detailsRequest.notes.includes('Duration:') && (
                <div className="grid grid-cols-2 gap-4">
                  {detailsRequest.notes.includes('Duration:') && (
                    <div>
                      <Label className="text-muted-foreground">Duration</Label>
                      <div className="font-medium">
                        {detailsRequest.notes.split(',').find(note => note.includes('Duration:'))?.replace('Duration:', '').trim()}
                      </div>
                    </div>
                  )}
                  {detailsRequest.notes.includes('Amount:') && (
                    <div>
                      <Label className="text-muted-foreground">Amount</Label>
                      <div className="font-medium">
                        {detailsRequest.notes.split(',').find(note => note.includes('Amount:'))?.replace('Amount:', '').trim()}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Payment Method</Label>
                  <div className="font-medium capitalize">{detailsRequest.payment_method}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone Number</Label>
                  <div className="font-medium">{detailsRequest.phone_number || 'Not provided'}</div>
                </div>
              </div>
              
              {/* Display additional notes if available */}
               {detailsRequest.notes && detailsRequest.notes.includes('Notes:') && (
                 <div>
                   <Label className="text-muted-foreground">Additional Notes</Label>
                   <div className="font-medium">
                     {detailsRequest.notes.split('Notes:')[1].trim()}
                   </div>
                 </div>
               )}
               
               {/* Display full notes if no structured format is detected */}
               {detailsRequest.notes && !detailsRequest.notes.includes('Duration:') && !detailsRequest.notes.includes('Notes:') && (
                 <div>
                   <Label className="text-muted-foreground">Notes</Label>
                   <div className="font-medium">{detailsRequest.notes}</div>
                 </div>
               )}
              
              {detailsRequest.transaction_proof_url && (
                <div>
                  <Label className="text-muted-foreground">Payment Proof</Label>
                  <div className="mt-1">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      asChild
                    >
                      <a href={detailsRequest.transaction_proof_url} target="_blank" rel="noopener noreferrer">
                        <FileImage className="h-4 w-4 mr-2" />
                        View Payment Proof
                      </a>
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <Label className="text-muted-foreground">Date Submitted</Label>
                <div className="font-medium">{formatDate(detailsRequest.created_at)}</div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            {detailsRequest && detailsRequest.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    if (detailsRequest) {
                      handleStatusChange(detailsRequest.id, 'approved');
                      setShowDetailsDialog(false);
                    }
                  }}
                  disabled={isProcessing}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (detailsRequest) {
                      setSelectedRequestId(detailsRequest.id);
                      setShowDetailsDialog(false);
                    }
                  }}
                >
                  Reject
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUpgradeRequests;
