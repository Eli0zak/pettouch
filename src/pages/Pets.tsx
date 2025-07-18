import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Pencil, Trash2, Tag, ChevronDown, RefreshCw, Heart, Calendar, Sparkles, ShoppingBag /* Assuming for future use */ } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// PetTouch Color Palette (ensure these are in tailwind.config.js and match branding guide)
// 'pet-primary': '#6B4EFF' [cite: 28]
// 'pet-secondary': '#5038CC' (Darker purple, or consider using 'pet-accent' for some secondary actions)
// 'pet-accent': '#FF9900' (Accent Orange for CTAs) [cite: 30]
// 'dark-neutral': '#2D2D2D' (For dark backgrounds, light mode text) [cite: 28]
// 'dark-card': '#3A3A3A' (Slightly lighter for cards in dark mode)
// 'light-grey': '#F5F5F5' (For dark mode text, light mode backgrounds) [cite: 30]
// 'muted-foreground': (Should map to a suitable gray for light/dark, e.g., text-gray-500 dark:text-gray-400)

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  image_url: string | null;
  birthday: string | null;
  created_at: string;
  nfc_tags: { id: string; tag_code: string }[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] // Bezier curve for smooth spring-like animation
    }
  }
};

const Pets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchPets();
  }, []);

  const handleRefresh = () => {
    fetchPets(true);
  };

  const fetchPets = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('pets')
        .select(`
          id,
          name,
          type,
          breed,
          image_url,
          birthday,
          created_at,
          nfc_tags (
            id,
            tag_code
          )
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
      
      if (isRefresh) {
        toast({
          title: "Pets refreshed",
          description: "Your pet list has been updated.",
          className: "bg-green-500 text-white dark:bg-green-600" // Example success toast
        });
      }
    } catch (error: any) {
      toast({
        title: "Error fetching pets",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeletePet = async (petId: string) => {
    // Confirmation Dialog (Recommended for destructive actions)
    // Example: if (!confirm("Are you sure you want to remove this pet?")) return;

    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);

      if (error) throw error;

      setPets(pets.filter(pet => pet.id !== petId));
      toast({
        title: "Pet removed",
        description: "The pet has been successfully removed from your family.",
         className: "bg-pet-accent text-white dark:text-dark-neutral" // Accent color for delete
      });
    } catch (error: any) {
      toast({
        title: "Error deleting pet",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredPets = pets.filter(pet => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = pet.name.toLowerCase().includes(searchLower) ||
                          (pet.breed && pet.breed.toLowerCase().includes(searchLower));
    const matchesFilter = !filterType || pet.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const petTypes = Array.from(new Set(pets.map(pet => pet.type.toLowerCase()))).map(type => 
    type.charAt(0).toUpperCase() + type.slice(1) // Capitalize for display
  );


  const getAge = (birthday: string | null) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--;
        months = (months + 12) % 12;
    }
    
    if (years === 0 && months === 0) return "Newborn";
    if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
    if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} yr${years !== 1 ? 's' : ''}, ${months} mo${months !== 1 ? 's' : ''}`;
  };

  const getPetEmoji = (type: string) => {
    const emojiMap: { [key: string]: string } = {
      'dog': '🐕',
      'cat': '🐈',
      'bird': '🦜',
      'rabbit': '🐰',
      'hamster': '🐹',
      'fish': '🐠',
      // Add more as needed
      'other': '🐾'
    };
    return emojiMap[type.toLowerCase()] || '🐾';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-light-grey dark:bg-dark-neutral">
          <LoadingSpinner size="lg" text="Loading your furry friends..." textClassName="text-dark-neutral dark:text-light-grey" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Ensure Layout applies bg-light-grey dark:bg-dark-neutral to body or its root */}
      <div className="min-h-screen bg-gradient-to-br from-pet-primary/5 via-transparent to-pet-accent/5 dark:from-pet-primary/10 dark:via-dark-neutral dark:to-pet-accent/10">
        <motion.div
          className={cn(
            "container mx-auto px-3 sm:px-4", // Slightly reduced padding on very small screens
            isMobile ? "py-4" : "py-6 md:py-8"
          )}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-6 md:mb-8"
            variants={itemVariants}
          >
            <h1 className={cn(
              "font-bold bg-gradient-to-r from-pet-primary to-pet-accent bg-clip-text text-transparent", // Use primary and accent for gradient
              isMobile ? "text-4xl mb-2" : "text-5xl md:text-6xl mb-3" // Slightly larger text
            )}>
              Your Pet Family
            </h1>
            <p className={cn(
              "text-gray-600 dark:text-gray-400",
              isMobile ? "text-base" : "text-lg md:text-xl" // Slightly larger text
            )}>
              {pets.length === 0 
                ? "Start building your pet family today!" 
                : `${pets.length} adorable companion${pets.length !== 1 ? 's' : ''} in your care`
              }
            </p>
          </motion.div>

          {/* Action Bar */}
          <motion.div 
            className={cn(
              "sticky top-2 z-10 backdrop-blur-lg bg-white/80 dark:bg-dark-card/80 rounded-xl md:rounded-2xl shadow-lg border dark:border-gray-700 mb-6 md:mb-8", // Sticky for better UX on scroll
              isMobile ? "p-3" : "p-4 md:p-6"
            )}
            variants={itemVariants}
          >
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="flex items-center justify-between gap-2">
                <Button
                  onClick={() => navigate('/pets/new')}
                  size={isMobile ? "default" : "lg"}
                  className="bg-pet-accent hover:bg-pet-accent/90 text-white dark:text-dark-neutral shadow-md dark:shadow-sm dark:shadow-black" // Accent Orange for main CTA [cite: 34]
                >
                  <Plus className={cn("mr-1.5 md:mr-2", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  Add Pet
                </Button>
                
                <div className="flex items-center gap-1 md:gap-2">
                   {!isMobile && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="border-2 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-dark-neutral"
                    >
                      <RefreshCw className={cn("mr-2 h-4 w-4 md:h-5 md:w-5", refreshing && "animate-spin")} />
                      Refresh
                    </Button>
                  )}
                  {isMobile && (
                     <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="text-gray-700 dark:text-gray-300"
                    >
                      <RefreshCw className={cn("h-5 w-5", refreshing && "animate-spin")} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSearch(!showSearch)}
                    className={cn("md:hidden text-gray-700 dark:text-gray-300", showSearch && "bg-pet-primary/10 dark:bg-pet-primary/20" )}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {(!isMobile || showSearch) && (
                  <motion.div
                    initial={isMobile ? { height: 0, opacity: 0, marginTop: 0 } : { opacity: 1 }}
                    animate={isMobile ? { height: "auto", opacity: 1, marginTop: '0.75rem' } : { opacity: 1 }}
                    exit={isMobile ? { height: 0, opacity: 0, marginTop: 0 } : { opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="flex flex-col md:flex-row gap-2 md:gap-3 overflow-hidden"
                  >
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400 dark:text-gray-500" />
                      <Input
                        type="text"
                        placeholder="Search by name or breed..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                          "pl-9 md:pl-10 bg-white/70 dark:bg-dark-neutral border-2 dark:border-gray-600 focus:border-pet-primary dark:focus:border-pet-primary",
                          isMobile ? "h-10 text-sm" : "h-11 md:h-12 text-base"
                        )}
                      />
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size={isMobile ? "default" : "lg"} // Changed size from lg to default on mobile for consistency
                          className={cn(
                            "border-2 min-w-[130px] md:min-w-[150px] justify-between text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-dark-neutral",
                            isMobile ? "h-10 text-sm" : "h-11 md:h-12 text-base",
                            filterType && "border-pet-primary dark:border-pet-primary bg-pet-primary/10 dark:bg-pet-primary/20 text-pet-primary dark:text-pet-primary"
                          )}
                        >
                          <div className="flex items-center">
                            <Filter className="mr-1.5 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
                            {filterType || "All Types"}
                          </div>
                          <ChevronDown className="h-4 w-4 ml-1.5 md:ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isMobile ? "center" : "end"} className="w-48 md:w-56 bg-white dark:bg-dark-card dark:border-gray-700">
                        {filterType && (
                          <DropdownMenuItem 
                            onClick={() => setFilterType(null)}
                            className="font-semibold text-pet-primary dark:text-pet-primary focus:bg-pet-primary/10 dark:focus:bg-pet-primary/20"
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Show All Types
                          </DropdownMenuItem>
                        )}
                        {petTypes.map(type => (
                          <DropdownMenuItem 
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={cn(
                                "focus:bg-gray-100 dark:focus:bg-dark-neutral/80",
                                filterType === type ? "bg-pet-primary/10 dark:bg-pet-primary/20 text-pet-primary dark:text-pet-primary" : "dark:text-light-grey"
                            )}
                          >
                            <span className="mr-2 text-lg">{getPetEmoji(type)}</span>
                            {type}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Pet Grid */}
          <motion.div 
            className={cn(
              "grid gap-3 sm:gap-4 md:gap-6", // Consistent gap
              isMobile 
                ? "grid-cols-1" // Single column on mobile
                : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" // Responsive columns for larger screens
            )}
            variants={containerVariants}
          >
            <AnimatePresence mode="popLayout">
              {filteredPets.length === 0 ? (
                <motion.div 
                  className="col-span-full" // Ensure it spans all columns
                  variants={itemVariants}
                >
                  <Card className="p-8 md:p-12 text-center bg-white/80 dark:bg-dark-card/80 border-2 border-dashed dark:border-gray-700 min-h-[300px] flex flex-col justify-center items-center">
                    <div className="max-w-md mx-auto">
                       {/* Peto Mascot Placeholder */}
                       <img src="src\assets\peto.svg" alt="Peto - No pets found" className="h-28 w-28 md:h-32 md:w-32 mx-auto mb-4 opacity-75" />
                      <h3 className="text-xl md:text-2xl font-semibold mb-2 text-dark-neutral dark:text-light-grey">No Pets Found</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {searchQuery || filterType 
                          ? "Try adjusting your search or filter to find your furry friends." 
                          : "It looks a bit empty here. Time to add your first companion!"
                        }
                      </p>
                      <Button
                        onClick={() => navigate('/pets/new')}
                        size="lg"
                        className="bg-pet-accent hover:bg-pet-accent/90 text-white dark:text-dark-neutral" // Using Accent Orange [cite: 34]
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Add Your First Pet
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                filteredPets.map((pet) => (
                  <motion.div
                    key={pet.id}
                    layoutId={pet.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }} // Enhanced hover effect
                    className="group rounded-xl overflow-hidden" // Apply rounded on the motion.div for consistent shadow
                  >
                    <Card className="h-full flex flex-col backdrop-blur-sm bg-white/90 dark:bg-dark-card/90 border-2 dark:border-gray-700 hover:border-pet-primary/60 dark:hover:border-pet-primary transition-all duration-300 shadow-md hover:shadow-xl dark:shadow-black/20">
                      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-pet-primary/10 to-pet-accent/10 dark:from-pet-primary/20 dark:to-pet-accent/20">
                        {pet.image_url ? (
                          <img
                            src={pet.image_url}
                            alt={pet.name}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-400 ease-in-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-5xl md:text-6xl mb-2 opacity-40 dark:opacity-50">{getPetEmoji(pet.type)}</div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">No photo yet</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <div className="flex justify-between items-end">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigate(`/pets/${pet.id}`)}
                              className="backdrop-blur-sm bg-white/80 hover:bg-white text-dark-neutral text-xs px-3 py-1.5 h-auto" // Dark mode compatible
                            >
                              View Profile
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="backdrop-blur-sm bg-white/80 hover:bg-white text-dark-neutral h-8 w-8" // Dark mode compatible
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white dark:bg-dark-card dark:border-gray-700">
                                <DropdownMenuItem onClick={() => navigate(`/pets/${pet.id}/edit`)} className="dark:text-light-grey dark:focus:bg-dark-neutral">
                                  <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/pets/${pet.id}/tags`)} className="dark:text-light-grey dark:focus:bg-dark-neutral">
                                  <Tag className="mr-2 h-4 w-4 text-green-500" />
                                  Manage Tags
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePet(pet.id)}
                                  className="text-red-500 focus:text-red-500 focus:bg-red-500/10 dark:focus:bg-red-500/20"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove Pet
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="absolute top-2 left-2 md:top-3 md:left-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/80 dark:bg-dark-neutral/80 backdrop-blur-sm text-dark-neutral dark:text-light-grey shadow-sm">
                            <span className="text-sm">{getPetEmoji(pet.type)}</span>
                            {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-grow flex flex-col justify-between"> {/* Use flex-grow for consistent card height */}
                        <div>
                          <div className="flex items-start justify-between mb-1.5">
                            <h3 className="font-bold text-lg md:text-xl text-dark-neutral dark:text-light-grey leading-tight">{pet.name}</h3>
                            <Heart className="h-5 w-5 text-red-500/70 opacity-0 group-hover:opacity-100 transition-opacity delay-100" />
                          </div>
                          {pet.breed && (
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">{pet.breed}</p>
                          )}
                        </div>

                        <div className="space-y-1.5 mt-auto pt-2"> {/* mt-auto pushes this section to bottom */}
                          {pet.birthday && (
                            <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              <span>{getAge(pet.birthday)} old</span>
                            </div>
                          )}
                          
                          {pet.nfc_tags && pet.nfc_tags.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Tag className="h-3.5 w-3.5 md:h-4 md:w-4 text-pet-primary" />
                              <span className="text-xs md:text-sm font-medium text-pet-primary">
                                {pet.nfc_tags.length} tag{pet.nfc_tags.length !== 1 ? 's' : ''} connected
                              </span>
                            </div>
                          )}
                           {(!pet.birthday && (!pet.nfc_tags || pet.nfc_tags.length === 0)) && (
                              <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-400 dark:text-gray-500">
                                <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                <span>Ready for adventures!</span>
                              </div>
                           )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Pets;