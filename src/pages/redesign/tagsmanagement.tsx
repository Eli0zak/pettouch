import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/redesign/Card';
import { Button } from '@/components/ui/redesign/Button';
import { Input } from '@/components/ui/redesign/Input';
import { useTheme } from '@/contexts/ThemeContext';
import { logger } from '@/utils/logger';

// Sample data for demonstration
const sampleTags = [
  {
    id: 'tag-1',
    tag_code: 'NFC001',
    pet_id: 'pet-1',
    pet_name: 'Max',
    pet_image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZG9nfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    status: 'active',
    activated_at: '2023-05-15T10:30:00Z',
    last_scanned: '2023-07-01T14:30:00Z',
    scan_count: 42,
  },
  {
    id: 'tag-2',
    tag_code: 'NFC002',
    pet_id: 'pet-2',
    pet_name: 'Luna',
    pet_image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2F0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    status: 'active',
    activated_at: '2023-06-10T09:15:00Z',
    last_scanned: '2023-06-28T11:45:00Z',
    scan_count: 18,
  },
  {
    id: 'tag-3',
    tag_code: 'NFC003',
    pet_id: null,
    pet_name: null,
    pet_image: null,
    status: 'inactive',
    activated_at: null,
    last_scanned: null,
    scan_count: 0,
  },
  {
    id: 'tag-4',
    tag_code: 'NFC004',
    pet_id: null,
    pet_name: null,
    pet_image: null,
    status: 'inactive',
    activated_at: null,
    last_scanned: null,
    scan_count: 0,
  },
];

const samplePets = [
  { id: 'pet-1', name: 'Max' },
  { id: 'pet-2', name: 'Luna' },
  { id: 'pet-3', name: 'Buddy' },
  { id: 'pet-4', name: 'Whiskers' },
];

const TagsManagement: React.FC = () => {
  const { isDark } = useTheme();
  const [designStyle, setDesignStyle] = useState<'neumorphic' | 'glass' | 'flat'>('neumorphic');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [newTagCode, setNewTagCode] = useState('');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  // Filter tags based on search term
  const filteredTags = sampleTags.filter(tag => 
    tag.tag_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tag.pet_name && tag.pet_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Handle link tag to pet
  const handleLinkTag = () => {
    // In a real app, this would make an API call
    logger.userAction('Linking tag to pet', { 
      tagCode: selectedTag?.tag_code, 
      petId: selectedPetId 
    });
    setShowLinkDialog(false);
    setSelectedTag(null);
    setSelectedPetId('');
  };

  // Handle add new tag
  const handleAddTag = () => {
    // In a real app, this would make an API call
    logger.userAction('Adding new tag', { tagCode: newTagCode });
    setShowAddDialog(false);
    setNewTagCode('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Design Style Switcher */}
      <div className="flex justify-center mb-8">
        <div className={`inline-flex rounded-lg p-1 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
          <Button 
            variant={designStyle === 'neumorphic' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setDesignStyle('neumorphic')}
            className="rounded-md"
          >
            Neumorphic
          </Button>
          <Button 
            variant={designStyle === 'glass' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setDesignStyle('glass')}
            className="rounded-md"
          >
            Glass
          </Button>
          <Button 
            variant={designStyle === 'flat' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setDesignStyle('flat')}
            className="rounded-md"
          >
            Flat
          </Button>
        </div>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <Card 
            design={designStyle}
            variant="primary"
            className="overflow-hidden"
          >
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">NFC Tags Management</h1>
                  <p className="text-muted-foreground">Manage your pet's NFC tags and track their usage.</p>
                </div>
                <Button 
                  design={designStyle}
                  variant="secondary"
                  className="mt-4 md:mt-0"
                  onClick={() => setShowAddDialog(true)}
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Add New Tag
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Search and Filters */}
        <motion.div variants={itemVariants}>
          <Card design={designStyle}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  design={designStyle}
                  placeholder="Search by tag code or pet name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  }
                />
                <div className="flex gap-2">
                  <Button 
                    design={designStyle}
                    variant="outline"
                    size="sm"
                  >
                    All Tags
                  </Button>
                  <Button 
                    design={designStyle}
                    variant="outline"
                    size="sm"
                  >
                    Active
                  </Button>
                  <Button 
                    design={designStyle}
                    variant="outline"
                    size="sm"
                  >
                    Inactive
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Tags List */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTags.map((tag) => (
              <Card 
                key={tag.id}
                design={designStyle}
                hoverable
                className="overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Tag Header */}
                  <div className={`p-4 ${tag.status === 'active' ? 'bg-primary/10' : 'bg-muted/30'}`}>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold">{tag.tag_code}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tag.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'}`}>
                        {tag.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Tag Content */}
                  <div className="p-4">
                    {tag.pet_id ? (
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                          <img 
                            src={tag.pet_image || '/images/pet-placeholder.png'} 
                            alt={tag.pet_name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{tag.pet_name}</p>
                          <p className="text-xs text-muted-foreground">Linked Pet</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center mb-4 p-3 rounded-md bg-muted/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-muted-foreground">No pet linked to this tag</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Activated</p>
                        <p className="text-sm">{formatDate(tag.activated_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Last Scanned</p>
                        <p className="text-sm">{formatDate(tag.last_scanned)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Scan Count</p>
                        <p className="text-sm">{tag.scan_count}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {tag.pet_id ? (
                        <Button 
                          design={designStyle}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          leftIcon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          }
                        >
                          View Pet
                        </Button>
                      ) : (
                        <Button 
                          design={designStyle}
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedTag(tag);
                            setShowLinkDialog(true);
                          }}
                          leftIcon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                            </svg>
                          }
                        >
                          Link to Pet
                        </Button>
                      )}
                      <Button 
                        design={designStyle}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        leftIcon={
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM13 12a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 00-1-1h-3zm1 2v1h1v-1h-1z" clipRule="evenodd" />
                          </svg>
                        }
                      >
                        QR Code
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </motion.div>
      
      {/* Link Tag Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card 
            design={designStyle}
            className="w-full max-w-md mx-4"
          >
            <CardHeader>
              <CardTitle>Link Tag to Pet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">Select a pet to link with tag <strong>{selectedTag?.tag_code}</strong></p>
              
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-1">
                {samplePets.map(pet => (
                  <div 
                    key={pet.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${selectedPetId === pet.id ? 'bg-primary/20' : 'hover:bg-muted/20'}`}
                    onClick={() => setSelectedPetId(pet.id)}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${selectedPetId === pet.id ? 'bg-primary' : 'border border-muted-foreground'}`}></div>
                      <span>{pet.name}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  design={designStyle}
                  variant="outline"
                  onClick={() => {
                    setShowLinkDialog(false);
                    setSelectedTag(null);
                    setSelectedPetId('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  design={designStyle}
                  variant="primary"
                  disabled={!selectedPetId}
                  onClick={handleLinkTag}
                >
                  Link Tag
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Add Tag Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card 
            design={designStyle}
            className="w-full max-w-md mx-4"
          >
            <CardHeader>
              <CardTitle>Add New NFC Tag</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">Enter the unique code of your new NFC tag</p>
              
              <Input
                design={designStyle}
                label="Tag Code"
                placeholder="e.g. NFC12345"
                value={newTagCode}
                onChange={(e) => setNewTagCode(e.target.value)}
                fullWidth
              />
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  design={designStyle}
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    setNewTagCode('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  design={designStyle}
                  variant="primary"
                  disabled={!newTagCode.trim()}
                  onClick={handleAddTag}
                >
                  Add Tag
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TagsManagement;