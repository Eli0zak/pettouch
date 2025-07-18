import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LostFoundInteractionModal } from '@/components/LostFoundInteractionModal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { LostFoundPost } from '@/types';
import { Mail, Phone, Trash2, Plus, Search, Calendar, MapPin } from 'lucide-react';
import { uploadLostFoundImage } from '@/lib/upload-helper';

const LostFound = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<LostFoundPost[]>([]);
  const [userPosts, setUserPosts] = useState<LostFoundPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [interactionModalOpen, setInteractionModalOpen] = useState(false);
  const [interactionPostId, setInteractionPostId] = useState<string | null>(null);
  const [interactionPostTitle, setInteractionPostTitle] = useState('');
  const [interactionType, setInteractionType] = useState<'found' | 'know'>('found');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pet_name: '',
    pet_type: 'dog',
    pet_breed: '',
    pet_color: '',
    pet_gender: 'unknown',
    pet_age: '',
    last_seen_location: '',
    last_seen_date: '',
    contact_phone: '',
    contact_email: '',
    image: null as File | null,
  });

  useEffect(() => {
    fetchPosts();
    fetchUserPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lost_found_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Cast string status to the expected enum type
      const typedPosts = data?.map(post => ({
        ...post,
        status: post.status as 'open' | 'resolved' | 'closed'
      })) as LostFoundPost[];
      
      setPosts(typedPosts || []);
    } catch (error) {
      console.error('Error fetching lost and found posts:', error);
      toast({
        title: "Error",
        description: "Failed to load lost and found posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { data, error } = await supabase
        .from('lost_found_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Cast string status to the expected enum type
      const typedPosts = data?.map(post => ({
        ...post,
        status: post.status as 'open' | 'resolved' | 'closed'
      })) as LostFoundPost[];
      
      setUserPosts(typedPosts || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleCreatePost = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to create reports",
          variant: "destructive"
        });
        return;
      }

      // Create the post
      const { data, error } = await supabase
        .from('lost_found_posts')
        .insert({
          title: formData.title,
          description: formData.description,
          pet_name: formData.pet_name || null,
          pet_type: formData.pet_type,
          pet_breed: formData.pet_breed || null,
          pet_color: formData.pet_color || null,
          pet_gender: formData.pet_gender,
          pet_age: formData.pet_age ? parseInt(formData.pet_age) : null,
          last_seen_location: formData.last_seen_location || null,
          last_seen_date: formData.last_seen_date ? new Date(formData.last_seen_date).toISOString() : null,
          status: 'open',
          contact_phone: formData.contact_phone || null,
          contact_email: formData.contact_email || null,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Handle image upload if present
      if (formData.image && data) {
        await uploadLostFoundImage(formData.image, data.id);
      }

      toast({
        title: "Report Created",
        description: "Your lost and found report has been created successfully",
      });

      // Reset form & refresh posts
      setFormData({
        title: '',
        description: '',
        pet_name: '',
        pet_type: 'dog',
        pet_breed: '',
        pet_color: '',
        pet_gender: 'unknown',
        pet_age: '',
        last_seen_location: '',
        last_seen_date: '',
        contact_phone: '',
        contact_email: '',
        image: null,
      });
      setIsCreateOpen(false);
      fetchPosts();
      fetchUserPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create your report",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePostStatus = async (postId: string, newStatus: 'open' | 'resolved' | 'closed') => {
    try {
      const { error } = await supabase
        .from('lost_found_posts')
        .update({ 
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Report status has been updated to ${newStatus}`,
      });

      fetchPosts();
      fetchUserPosts();
    } catch (error) {
      console.error('Error updating post status:', error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive"
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      const { error } = await supabase
        .from('lost_found_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Report Deleted",
        description: "Your report has been deleted successfully",
      });

      fetchPosts();
      fetchUserPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete the report",
        variant: "destructive"
      });
    }
  };

  const filteredPosts = posts.filter(post => {
    // Search filter
    const searchMatch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.pet_name && post.pet_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.pet_breed && post.pet_breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.last_seen_location && post.last_seen_location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Pet type filter
    const typeMatch = filterType === 'all' || post.pet_type === filterType;
    
    // Status filter
    const statusMatch = filterStatus === 'all' || post.status === filterStatus;
    
    return searchMatch && typeMatch && statusMatch;
  });

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown date';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Unknown date';
    }
  };

  const getStatusBadgeClass = (status: 'open' | 'resolved' | 'closed') => {
    switch (status) {
      case 'open':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <React.Fragment>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Lost & Found Community</h1>
        <p className="text-muted-foreground mb-8">
          Help reunite lost pets with their owners by reporting lost pets or searching for found ones.
        </p>
        
        {/* Search and filter controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <div className="w-40">
              <Select value={filterType} onValueChange={(value) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pet Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="bird">Bird</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-40">
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Create new report button */}
        <div className="mb-8 flex justify-end">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Report Lost/Found Pet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Report Lost or Found Pet</DialogTitle>
                <DialogDescription>
                  Fill out the form below to create a lost or found pet report. The more details you provide, the better chances of reuniting the pet with its owner.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Report Title *</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="E.g., Lost Golden Retriever in Downtown" 
                    value={formData.title} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Provide as many details as possible about the pet and the circumstances" 
                    value={formData.description} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pet_name">Pet Name</Label>
                    <Input 
                      id="pet_name" 
                      name="pet_name" 
                      placeholder="If known" 
                      value={formData.pet_name} 
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="pet_type">Pet Type *</Label>
                    <Select name="pet_type" value={formData.pet_type} onValueChange={(value) => handleSelectChange('pet_type', value)}>
                      <SelectTrigger id="pet_type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pet_breed">Breed</Label>
                    <Input 
                      id="pet_breed" 
                      name="pet_breed" 
                      placeholder="E.g., Golden Retriever" 
                      value={formData.pet_breed} 
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="pet_color">Color</Label>
                    <Input 
                      id="pet_color" 
                      name="pet_color" 
                      placeholder="E.g., Golden, Brown" 
                      value={formData.pet_color} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pet_gender">Gender</Label>
                    <Select name="pet_gender" value={formData.pet_gender} onValueChange={(value) => handleSelectChange('pet_gender', value)}>
                      <SelectTrigger id="pet_gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="pet_age">Age (years)</Label>
                    <Input 
                      id="pet_age" 
                      name="pet_age" 
                      type="number" 
                      placeholder="If known" 
                      value={formData.pet_age} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="last_seen_location">Last Seen Location</Label>
                  <Input 
                    id="last_seen_location" 
                    name="last_seen_location" 
                    placeholder="Address or area where the pet was last seen" 
                    value={formData.last_seen_location} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="last_seen_date">Last Seen Date</Label>
                  <Input 
                    id="last_seen_date" 
                    name="last_seen_date" 
                    type="date" 
                    value={formData.last_seen_date} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input 
                    id="contact_phone" 
                    name="contact_phone" 
                    type="tel" 
                    placeholder="Your contact number" 
                    value={formData.contact_phone} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input 
                    id="contact_email" 
                    name="contact_email" 
                    type="email" 
                    placeholder="Your contact email" 
                    value={formData.contact_email} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="image">Pet Image</Label>
                  <Input 
                    id="image" 
                    name="image" 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload a clear image of the pet to help with identification
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleCreatePost}>
                  Create Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* User's Reports section */}
        {userPosts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Your Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPosts.map(post => (
                <Card key={post.id} className="overflow-hidden">
                  {post.image_url && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={post.image_url} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                      <div className={`px-2 py-1 text-xs rounded-full border ${getStatusBadgeClass(post.status)}`}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </div>
                    </div>
                    <CardDescription>
                      {post.pet_type && post.pet_breed 
                        ? `${post.pet_type.charAt(0).toUpperCase() + post.pet_type.slice(1)} - ${post.pet_breed}`
                        : post.pet_type?.charAt(0).toUpperCase() + post.pet_type?.slice(1)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-3 mb-4">{post.description}</p>
                    
                    <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                      {post.last_seen_location && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-2" />
                          <span>{post.last_seen_location}</span>
                        </div>
                      )}
                      {post.last_seen_date && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-2" />
                          <span>{formatDate(post.last_seen_date)}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-2" />
                        <span>Posted: {formatDate(post.created_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2 border-t">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant={post.status === 'open' ? 'default' : 'outline'}
                        onClick={() => handleUpdatePostStatus(post.id, 'open')}
                      >
                        Open
                      </Button>
                      <Button 
                        size="sm" 
                        variant={post.status === 'resolved' ? 'default' : 'outline'}
                        onClick={() => handleUpdatePostStatus(post.id, 'resolved')}
                      >
                        Resolved
                      </Button>
                      <Button 
                        size="sm" 
                        variant={post.status === 'closed' ? 'default' : 'outline'}
                        onClick={() => handleUpdatePostStatus(post.id, 'closed')}
                      >
                        Close
                      </Button>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleDeletePost(post.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Community Reports section */}
        <h2 className="text-2xl font-bold mb-4">Community Reports</h2>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pet-primary"></div>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <Card key={post.id} className="overflow-hidden">
                {post.image_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <div className={`px-2 py-1 text-xs rounded-full border ${getStatusBadgeClass(post.status)}`}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </div>
                  </div>
                  <CardDescription>
                    {post.pet_type && post.pet_breed 
                      ? `${post.pet_type.charAt(0).toUpperCase() + post.pet_type.slice(1)} - ${post.pet_breed}`
                      : post.pet_type?.charAt(0).toUpperCase() + post.pet_type?.slice(1)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-3 mb-4">{post.description}</p>
                  
                  <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                    {post.last_seen_location && (
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-2" />
                        <span>{post.last_seen_location}</span>
                      </div>
                    )}
                    {post.last_seen_date && (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-2" />
                        <span>{formatDate(post.last_seen_date)}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-2" />
                      <span>Posted: {formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <div className="flex flex-col text-sm w-full">
                    {post.contact_phone && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-2" />
                        <span>{post.contact_phone}</span>
                      </div>
                    )}
                    {post.contact_email && (
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-2" />
                        <span>{post.contact_email}</span>
                      </div>
                    )}
                  </div>
                  {post.status === 'open' && (
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="secondary" 
                        className="flex-1"
                        onClick={() => {
                          setInteractionPostId(post.id);
                          setInteractionPostTitle(post.title);
                          setInteractionType('found');
                          setInteractionModalOpen(true);
                        }}
                      >
                        I Found This Pet
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="flex-1"
                        onClick={() => {
                          setInteractionPostId(post.id);
                          setInteractionPostTitle(post.title);
                          setInteractionType('know');
                          setInteractionModalOpen(true);
                        }}
                      >
                        I Know This Pet
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center">
            <p>No lost and found reports found. Be the first to report!</p>
            <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
              Create Report
            </Button>
          </Card>
        )}
      </div>

      <LostFoundInteractionModal
        isOpen={interactionModalOpen}
        onClose={() => {
          setInteractionModalOpen(false);
          setInteractionPostId(null);
          setInteractionPostTitle('');
        }}
        postId={interactionPostId || ''}
        postTitle={interactionPostTitle}
        interactionType={interactionType}
        onSuccess={() => {
          fetchPosts();
          fetchUserPosts();
        }}
      />
    </React.Fragment>
  );
};

export default LostFound;
