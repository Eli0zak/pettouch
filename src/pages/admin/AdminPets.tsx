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
import { Search, Eye, Tag, RefreshCw, User, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import AdminLayout from './AdminLayout';
import { Pet } from '@/types';
import { PetAvatar } from '@/components/ui/pet-avatar';
import { Json } from '@/integrations/supabase/types';

interface MedicalInfo {
  blood_type?: string;
  conditions?: string[];
  allergies?: string[];
  medications?: string[];
  vaccinations?: Array<{
    name: string;
    date: string;
    next_due: string;
  }>;
  last_checkup?: string;
  next_checkup?: string;
  medical_notes?: string;
  veterinarian?: {
    name: string;
    phone: string;
    email: string;
    address?: string;
    clinic?: string;
    specialization?: string;
    license_number?: string;
  };
}

interface DbPetResponse {
  id: string;
  owner_id: string;
  name: string;
  type: string;
  breed: string | null;
  gender: string | null;
  color: string | null;
  profile_image_url: string | null;
  is_active: boolean;
  microchip_id: string | null;
  birthday: string | null;
  weight_kg: number | null;
  medical_info: MedicalInfo | null;
  emergency_contact: Json | null;
  veterinarian: Json | null;
  notes: string | null;
  created_at: string;
  qr_code_url: string | null;
  scan_count?: number;
  last_scanned_at?: string | null;
  owner?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

const AdminPets = () => {
  const { toast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pets')
        .select(`
          *,
          owner:owner_id(
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
        const petsWithDefaults = data.map((pet: DbPetResponse) => ({
          ...pet,
          scan_count: pet.scan_count || 0,
          last_scanned_at: pet.last_scanned_at || null,
          medical_info: pet.medical_info || null,
        })) as unknown as Pet[];
        setPets(petsWithDefaults);
      }
    } catch (error: any) {
      console.error('Error fetching pets:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch pets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewPet = (pet: Pet) => {
    setSelectedPet(pet);
    setIsViewDialogOpen(true);
  };

  const handleViewOwnerProfile = (ownerId: string) => {
    window.open(`/admin/users/${ownerId}`, '_blank');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const filteredPets = pets.filter(pet => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      pet.name.toLowerCase().includes(searchLower) ||
      (pet.breed && pet.breed.toLowerCase().includes(searchLower)) ||
      (pet.owner?.email && pet.owner.email.toLowerCase().includes(searchLower)) ||
      (pet.owner?.first_name && pet.owner.first_name.toLowerCase().includes(searchLower)) ||
      (pet.owner?.last_name && pet.owner.last_name.toLowerCase().includes(searchLower));
    
    const matchesType = !typeFilter || pet.type === typeFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && pet.is_active) || 
      (statusFilter === 'inactive' && !pet.is_active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pets Management</h1>
        <Button onClick={fetchPets}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by pet name, breed, or owner info..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? null : value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Pet Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="dog">Dogs</SelectItem>
              <SelectItem value="cat">Cats</SelectItem>
              <SelectItem value="bird">Birds</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Pets Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pet-primary"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Type/Breed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scans</TableHead>
                <TableHead>Last Scan</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No pets found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredPets.map((pet) => (
                  <TableRow key={pet.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <PetAvatar
                          src={pet.profile_image_url}
                          fallback={pet.name.charAt(0)}
                          size="md"
                          petType={pet.type}
                        />
                        <div>
                          <p className="font-medium">{pet.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {pet.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {pet.owner ? (
                        <div>
                          <p className="font-medium">
                            {pet.owner.first_name || pet.owner.last_name 
                              ? `${pet.owner.first_name || ''} ${pet.owner.last_name || ''}`.trim()
                              : 'Unnamed Owner'
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">{pet.owner.email}</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No owner data</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge>
                          {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}
                        </Badge>
                        {pet.breed && (
                          <p className="text-xs text-muted-foreground mt-1">{pet.breed}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={pet.is_active ? "default" : "secondary"}
                        className={pet.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {pet.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{pet.scan_count || 0}</span>
                    </TableCell>
                    <TableCell>
                      {formatDate(pet.last_scanned_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewPet(pet)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleViewOwnerProfile(pet.owner_id)}>
                          <User className="h-4 w-4" />
                          <span className="sr-only">View Owner</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
      
      {/* View Pet Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pet Details</DialogTitle>
            <DialogDescription>
              Detailed information about this pet.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPet && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <PetAvatar
                  src={selectedPet.profile_image_url}
                  fallback={selectedPet.name.charAt(0)}
                  size="xl"
                  petType={selectedPet.type}
                  className="h-32 w-32"
                />
              </div>
              
              <div>
                <h3 className="text-xl font-bold">{selectedPet.name}</h3>
                <p className="text-sm text-muted-foreground">ID: {selectedPet.id}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p>{selectedPet.type.charAt(0).toUpperCase() + selectedPet.type.slice(1)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Breed</p>
                  <p>{selectedPet.breed || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <p>{selectedPet.gender ? (selectedPet.gender.charAt(0).toUpperCase() + selectedPet.gender.slice(1)) : 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Color</p>
                  <p>{selectedPet.color || 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge 
                  variant={selectedPet.is_active ? "default" : "secondary"}
                  className={selectedPet.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                >
                  {selectedPet.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
                  <p className="text-xl font-bold">{selectedPet.scan_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Scan</p>
                  <p>{formatDate(selectedPet.last_scanned_at)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Owner</p>
                {selectedPet.owner ? (
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 mr-2" />
                    <div>
                      <p>
                        {selectedPet.owner.first_name || selectedPet.owner.last_name 
                          ? `${selectedPet.owner.first_name || ''} ${selectedPet.owner.last_name || ''}`.trim()
                          : 'Unnamed Owner'
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">{selectedPet.owner.email}</p>
                    </div>
                  </div>
                ) : (
                  <p>No owner data available</p>
                )}
              </div>

              {selectedPet.medical_info && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medical Info</p>
                  <div className="mt-2 space-y-2">
                    {(selectedPet.medical_info as MedicalInfo).conditions?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Conditions:</p>
                        <div className="flex flex-wrap gap-1">
                          {(selectedPet.medical_info as MedicalInfo).conditions?.map((condition, index) => (
                            <Badge key={index} variant="outline">{condition}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {(selectedPet.medical_info as MedicalInfo).vaccinations?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Latest Vaccination:</p>
                        <p className="text-sm">
                          {(selectedPet.medical_info as MedicalInfo).vaccinations?.[
                            (selectedPet.medical_info as MedicalInfo).vaccinations!.length - 1
                          ].name}
                          {' '}
                          ({formatDate((selectedPet.medical_info as MedicalInfo).vaccinations?.[
                            (selectedPet.medical_info as MedicalInfo).vaccinations!.length - 1
                          ].date)})
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            {selectedPet && selectedPet.owner && (
              <Button variant="outline" onClick={() => handleViewOwnerProfile(selectedPet.owner_id)}>
                View Owner
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPets;
