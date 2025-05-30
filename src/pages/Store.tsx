import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
	StarIcon, 
	Search, 
	ShoppingBag, 
	Filter, 
	ChevronDown, 
	SlidersHorizontal, 
	X, 
	Heart,
	Loader2
} from 'lucide-react';
import { 
	Select, 
	SelectContent, 
	SelectItem, 
	SelectTrigger, 
	SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CartDrawer } from '@/components/ui/cart-drawer';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory } from '@/types';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/utils/logger';

const Store = () => {
	const { t } = useLanguage();
	const { addToCart, setIsCartOpen } = useCart();
	const { toast } = useToast();
	const navigate = useNavigate();
	
	// State for products and loading
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<ProductCategory[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [wishlist, setWishlist] = useState<string[]>([]);
	
	// State for filtering and pagination
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
	const [sortBy, setSortBy] = useState<string>('featured');
	const [inStockOnly, setInStockOnly] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const productsPerPage = 9;
	
	// Fetch products from database
	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setIsLoading(true);
				
				// Build the query
				let query = supabase
					.from('store_products')
					.select('*');
				
				// Apply category filter
				if (selectedCategory !== 'all') {
					query = query.eq('category_id', selectedCategory);
				}
				
				// Apply search filter
				if (searchQuery) {
					query = query.ilike('name', `%${searchQuery}%`);
				}
				
				// Apply price filter
				query = query
					.gte('price', priceRange[0])
					.lte('price', priceRange[1]);
					
				// Apply in-stock filter
				if (inStockOnly) {
					query = query.gt('stock', 0);
				}
				
				// Apply sorting
				switch (sortBy) {
					case 'price-low':
						query = query.order('price', { ascending: true });
						break;
					case 'price-high':
						query = query.order('price', { ascending: false });
						break;
					case 'newest':
						query = query.order('created_at', { ascending: false });
						break;
					case 'rating':
						query = query.order('rating', { ascending: false });
						break;
					default: // featured
						query = query.order('featured', { ascending: false });
						break;
				}
				
				// Get total count for pagination
				const countQuery = supabase
					.from('store_products')
					.select('*', { count: 'exact', head: true });
				
				// Apply the same filters to count query
				if (selectedCategory !== 'all') {
					countQuery.eq('category_id', selectedCategory);
				}
				
				if (searchQuery) {
					countQuery.ilike('name', `%${searchQuery}%`);
				}
				
				countQuery
					.gte('price', priceRange[0])
					.lte('price', priceRange[1]);
					
				if (inStockOnly) {
					countQuery.gt('stock', 0);
				}
				
				const { count, error: countError } = await countQuery;
				
				if (countError) {
					throw countError;
				}
				
				// Calculate total pages
				const pages = Math.ceil((count || 0) / productsPerPage);
				setTotalPages(pages || 1);
				
				// Apply pagination
				const from = (currentPage - 1) * productsPerPage;
				const to = from + productsPerPage - 1;
				
				query = query.range(from, to);
				
				// Execute the query
				const { data, error } = await query;
				
				if (error) {
					throw error;
				}
				
				setProducts(data as Product[]);
			} catch (error) {
				logger.error('Error fetching products', { error });
				toast({
					title: 'Error',
					description: 'Failed to load products',
					variant: 'destructive',
				});
			} finally {
				setIsLoading(false);
			}
		};
		
		const fetchCategories = async () => {
			try {
				const { data, error } = await supabase
					.from('store_categories')
					.select('*')
					.order('name');
				
				if (error) {
					throw error;
				}
				
				setCategories(data as ProductCategory[]);
			} catch (error) {
				logger.error('Error fetching categories', { error });
			}
		};
		
		const fetchWishlist = async () => {
			try {
				const { data: { user } } = await supabase.auth.getUser();
				
				if (user) {
					const { data, error } = await supabase
						.from('store_wishlist')
						.select('product_id')
						.eq('user_id', user.id);
					
					if (error) {
						throw error;
					}
					
					setWishlist(data.map(item => item.product_id));
				}
			} catch (error) {
				logger.error('Error fetching wishlist', { error });
			}
		};
		
		fetchProducts();
		fetchCategories();
		fetchWishlist();
	}, [selectedCategory, searchQuery, priceRange, sortBy, inStockOnly, currentPage, toast]);
	
	// Handle wishlist toggle
	const toggleWishlist = async (productId: string) => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			
			if (!user) {
				toast({
					title: 'Login Required',
					description: 'Please log in to add items to your wishlist',
					variant: 'destructive',
				});
				return;
			}
			
			const isInWishlist = wishlist.includes(productId);
			
			if (isInWishlist) {
				// Remove from wishlist
				await supabase
					.from('store_wishlist')
					.delete()
					.eq('user_id', user.id)
					.eq('product_id', productId);
				
				setWishlist(wishlist.filter(id => id !== productId));
				
				toast({
					title: 'Removed from Wishlist',
					description: 'Item has been removed from your wishlist',
				});
			} else {
				// Add to wishlist
				await supabase
					.from('store_wishlist')
					.insert({
						user_id: user.id,
						product_id: productId,
					});
				
				setWishlist([...wishlist, productId]);
				
				toast({
					title: 'Added to Wishlist',
					description: 'Item has been added to your wishlist',
				});
			}
		} catch (error) {
			logger.error('Error updating wishlist', { error });
			toast({
				title: 'Error',
				description: 'Failed to update wishlist',
				variant: 'destructive',
			});
		}
	};
	
	// Reset filters
	const resetFilters = () => {
		setSelectedCategory('all');
		setSearchQuery('');
		setPriceRange([0, 200]);
		setSortBy('featured');
		setInStockOnly(false);
		setCurrentPage(1);
	};
	
	// Handle add to cart
	const handleAddToCart = (product: Product) => {
		addToCart(product, 1);
	};
	
	// Handle product click
	const handleProductClick = (productId: string) => {
		navigate(`/store/product/${productId}`);
	};
	
	// Render star rating
	const renderStarRating = (rating: number) => {
		return (
			<div className="flex items-center">
				{[1, 2, 3, 4, 5].map((star) => (
					<StarIcon
						key={star}
						className={`w-4 h-4 ${
							star <= Math.round(rating)
								? 'text-yellow-400 fill-yellow-400'
								: 'text-gray-300'
						}`}
					/>
				))}
				<span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
			</div>
		);
	};

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="text-center mb-10">
				<h1 className="text-4xl font-bold mb-4">{t('store.title')}</h1>
				<p className="text-muted-foreground max-w-2xl mx-auto">
					{t('store.description')}
				</p>
			</div>

			{/* Top Bar with Search, Sort, and Filter */}
			<div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
				<div className="relative w-full md:w-auto md:min-w-[300px]">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						placeholder={t('store.searchProducts')}
						className="pl-10"
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							setCurrentPage(1);
						}}
					/>
				</div>
				
				<div className="flex items-center gap-2 w-full md:w-auto">
					<Select value={sortBy} onValueChange={(value) => {
						setSortBy(value);
						setCurrentPage(1);
					}}>
						<SelectTrigger className="w-full md:w-[180px]">
							<SelectValue placeholder={t('store.sort')} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="featured">{t('store.sortFeatured')}</SelectItem>
							<SelectItem value="price-low">{t('store.sortPriceLow')}</SelectItem>
							<SelectItem value="price-high">{t('store.sortPriceHigh')}</SelectItem>
							<SelectItem value="newest">{t('store.sortNewest')}</SelectItem>
							<SelectItem value="rating">{t('store.sortRating')}</SelectItem>
						</SelectContent>
					</Select>
					
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="icon" className="md:hidden">
								<Filter className="h-4 w-4" />
							</Button>
						</SheetTrigger>
						<SheetContent side="left">
							<SheetHeader>
								<SheetTitle>{t('store.filters')}</SheetTitle>
							</SheetHeader>
							<div className="py-4">
								<div className="space-y-6">
									{/* Mobile Filters */}
									<div>
										<h3 className="font-medium mb-3">{t('store.categories')}</h3>
										<div className="space-y-2">
											<div className="flex items-center">
												<Checkbox
													id="all-mobile"
													checked={selectedCategory === 'all'}
													onCheckedChange={() => {
														setSelectedCategory('all');
														setCurrentPage(1);
													}}
												/>
												<label htmlFor="all-mobile" className="ml-2 text-sm">{t('store.allCategories')}</label>
											</div>
											{categories.map((category) => (
												<div key={category.id} className="flex items-center">
													<Checkbox
														id={`category-${category.id}-mobile`}
														checked={selectedCategory === category.id}
														onCheckedChange={() => {
															setSelectedCategory(category.id);
															setCurrentPage(1);
														}}
													/>
													<label htmlFor={`category-${category.id}-mobile`} className="ml-2 text-sm">{category.name}</label>
												</div>
											))}
										</div>
									</div>
									
									<div>
										<h3 className="font-medium mb-3">{t('store.priceRange')}</h3>
										<div className="px-2">
											<Slider
												defaultValue={priceRange}
												min={0}
												max={200}
												step={1}
												onValueChange={(value) => {
													setPriceRange(value as [number, number]);
													setCurrentPage(1);
												}}
											/>
											<div className="flex justify-between mt-2 text-sm">
												<span>${priceRange[0]}</span>
												<span>${priceRange[1]}</span>
											</div>
										</div>
									</div>
									
									<div>
										<div className="flex items-center">
											<Checkbox
												id="in-stock-mobile"
												checked={inStockOnly}
												onCheckedChange={(checked) => {
													setInStockOnly(!!checked);
													setCurrentPage(1);
												}}
											/>
											<label htmlFor="in-stock-mobile" className="ml-2">{t('store.inStockOnly')}</label>
										</div>
									</div>
									
									<Button variant="outline" className="w-full" onClick={resetFilters}>
										{t('store.resetFilters')}
									</Button>
								</div>
							</div>
						</SheetContent>
					</Sheet>
					
					<Button
						variant="outline"
						size="icon"
						onClick={() => setIsCartOpen(true)}
					>
						<ShoppingBag className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-12 gap-8">
				{/* Desktop Sidebar Filters */}
				<div className="hidden md:block col-span-3 space-y-8">
					<div>
						<div className="flex items-center justify-between mb-4">
							<h3 className="font-medium">{t('store.filters')}</h3>
							<Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs">
								{t('store.resetFilters')}
							</Button>
						</div>
						
						<div className="space-y-6">
							<div>
								<h4 className="text-sm font-medium mb-3">{t('store.categories')}</h4>
								<div className="space-y-2">
									<div className="flex items-center">
										<Checkbox
											id="all"
											checked={selectedCategory === 'all'}
											onCheckedChange={() => {
												setSelectedCategory('all');
												setCurrentPage(1);
											}}
										/>
										<label htmlFor="all" className="ml-2 text-sm">{t('store.allCategories')}</label>
									</div>
									{categories.map((category) => (
										<div key={category.id} className="flex items-center">
											<Checkbox
												id={`category-${category.id}`}
												checked={selectedCategory === category.id}
												onCheckedChange={() => {
													setSelectedCategory(category.id);
													setCurrentPage(1);
												}}
											/>
											<label htmlFor={`category-${category.id}`} className="ml-2 text-sm">{category.name}</label>
										</div>
									))}
								</div>
							</div>
							
							<div>
								<h4 className="text-sm font-medium mb-3">{t('store.priceRange')}</h4>
								<div className="px-2">
									<Slider
										defaultValue={priceRange}
										min={0}
										max={200}
										step={1}
										onValueChange={(value) => {
											setPriceRange(value as [number, number]);
											setCurrentPage(1);
										}}
									/>
									<div className="flex justify-between mt-2 text-sm">
										<span>${priceRange[0]}</span>
										<span>${priceRange[1]}</span>
									</div>
								</div>
							</div>
							
							<div>
								<div className="flex items-center">
									<Checkbox
										id="in-stock"
										checked={inStockOnly}
										onCheckedChange={(checked) => {
											setInStockOnly(!!checked);
											setCurrentPage(1);
										}}
									/>
									<label htmlFor="in-stock" className="ml-2 text-sm">{t('store.inStockOnly')}</label>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Product Grid */}
				<div className="col-span-12 md:col-span-9">
					{isLoading ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<Card key={i} className="overflow-hidden">
									<div className="h-48 bg-gray-100 animate-pulse" />
									<CardHeader>
										<div className="h-6 w-3/4 bg-gray-100 animate-pulse mb-2" />
										<div className="h-4 w-1/2 bg-gray-100 animate-pulse" />
									</CardHeader>
									<CardContent>
										<div className="h-5 w-1/4 bg-gray-100 animate-pulse" />
									</CardContent>
									<CardFooter>
										<div className="h-9 w-full bg-gray-100 animate-pulse" />
									</CardFooter>
								</Card>
							))}
						</div>
					) : products.length === 0 ? (
						<div className="text-center py-16">
							<h3 className="text-xl font-medium mb-2">{t('store.noProductsFound')}</h3>
							<p className="text-muted-foreground mb-6">{t('store.tryDifferentFilters')}</p>
							<Button onClick={resetFilters}>{t('store.resetFilters')}</Button>
						</div>
					) : (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
								{products.map((product) => (
									<Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
										<div 
											className="relative h-64 cursor-pointer" 
											onClick={() => handleProductClick(product.id)}
										>
											<img
												src={product.thumbnail}
												alt={product.name}
												className="object-cover w-full h-full"
											/>
											
											<button
												onClick={(e) => {
													e.stopPropagation();
													toggleWishlist(product.id);
												}}
												className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100"
												aria-label={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
											>
												{wishlist.includes(product.id) ? (
													<Heart className="h-4 w-4 text-red-500" />
												) : (
													<Heart className="h-4 w-4" />
												)}
											</button>
											
											{product.is_new && (
												<Badge variant="secondary" className="absolute top-2 left-2">
													{t('store.newProduct')}
												</Badge>
											)}
											
											{product.is_bestseller && (
												<Badge variant="default" className="absolute top-2 left-2">
													{t('store.bestSeller')}
												</Badge>
											)}
											
											{product.sale_price && (
												<Badge variant="destructive" className="absolute top-2 left-2">
													-{Math.round((1 - product.sale_price / product.price) * 100)}%
												</Badge>
											)}
										</div>

										<CardHeader className="cursor-pointer" onClick={() => handleProductClick(product.id)}>
											<div className="flex justify-between">
												<CardTitle className="text-lg line-clamp-1">
													{product.name}
												</CardTitle>
											</div>
											<CardDescription className="line-clamp-2">
												{product.description}
											</CardDescription>
										</CardHeader>

										<CardContent className="cursor-pointer" onClick={() => handleProductClick(product.id)}>
											<div className="flex justify-between items-center">
												<div>
													{product.sale_price ? (
														<div className="flex items-center gap-2">
															<span className="text-lg font-bold">${product.sale_price.toFixed(2)}</span>
															<span className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</span>
														</div>
													) : (
														<span className="text-lg font-bold">${product.price.toFixed(2)}</span>
													)}
												</div>
												
												{product.rating && (
													<div className="flex items-center">
														{renderStarRating(product.rating)}
													</div>
												)}
											</div>
											
											<Badge variant="outline" className="mt-2">
												{product.stock > 0 ? `${product.stock} ${t('store.inStock')}` : t('store.outOfStock')}
											</Badge>
										</CardContent>

										<CardFooter>
											<Button 
												className="w-full" 
												disabled={product.stock === 0}
												onClick={(e) => {
													e.stopPropagation();
													handleAddToCart(product);
												}}
											>
												{t('store.addToCart')}
											</Button>
										</CardFooter>
									</Card>
								))}
							</div>
							
							{/* Pagination */}
							{totalPages > 1 && (
								<Pagination className="mt-8">
									<PaginationContent>
										<PaginationItem>
											<PaginationPrevious 
												onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
												disabled={currentPage === 1}
											/>
										</PaginationItem>
										
										{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
											// Show first page, last page, current page, and pages around current
											let pageToShow: number | null = null;
											
											if (totalPages <= 5) {
												// If 5 or fewer pages, show all
												pageToShow = i + 1;
											} else if (i === 0) {
												// First button is always page 1
												pageToShow = 1;
											} else if (i === 4) {
												// Last button is always the last page
												pageToShow = totalPages;
											} else if (currentPage <= 2) {
												// Near the start
												pageToShow = i + 1;
											} else if (currentPage >= totalPages - 1) {
												// Near the end
												pageToShow = totalPages - 4 + i;
											} else {
												// In the middle
												pageToShow = currentPage - 1 + i;
											}
											
											// Show ellipsis instead of page number in certain cases
											if (totalPages > 5) {
												if ((i === 1 && currentPage > 3) || (i === 3 && currentPage < totalPages - 2)) {
													return (
														<PaginationItem key={i}>
															<PaginationEllipsis />
														</PaginationItem>
													);
												}
											}
											
											if (pageToShow !== null) {
												return (
													<PaginationItem key={i}>
														<PaginationLink
															isActive={currentPage === pageToShow}
															onClick={() => setCurrentPage(pageToShow as number)}
														>
															{pageToShow}
														</PaginationLink>
													</PaginationItem>
												);
											}
											
											return null;
										})}
										
										<PaginationItem>
											<PaginationNext 
												onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
												disabled={currentPage === totalPages}
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							)}
						</>
					)}
				</div>
			</div>
			
			{/* FAQ and Information Tabs */}
			<div className="mt-16">
				<Tabs defaultValue="faq">
					<TabsList className="justify-center">
						<TabsTrigger value="faq">{t('store.faq')}</TabsTrigger>
						<TabsTrigger value="shipping">{t('store.shipping')}</TabsTrigger>
						<TabsTrigger value="returns">{t('store.returns')}</TabsTrigger>
					</TabsList>
					
					<TabsContent value="faq" className="mt-6">
						<div className="max-w-3xl mx-auto">
							<Accordion type="single" collapsible className="w-full">
								<AccordionItem value="faq-1">
									<AccordionTrigger>{t('store.faq.q1')}</AccordionTrigger>
									<AccordionContent>{t('store.faq.a1')}</AccordionContent>
								</AccordionItem>
								<AccordionItem value="faq-2">
									<AccordionTrigger>{t('store.faq.q2')}</AccordionTrigger>
									<AccordionContent>{t('store.faq.a2')}</AccordionContent>
								</AccordionItem>
								<AccordionItem value="faq-3">
									<AccordionTrigger>{t('store.faq.q3')}</AccordionTrigger>
									<AccordionContent>{t('store.faq.a3')}</AccordionContent>
								</AccordionItem>
								<AccordionItem value="faq-4">
									<AccordionTrigger>{t('store.faq.q4')}</AccordionTrigger>
									<AccordionContent>{t('store.faq.a4')}</AccordionContent>
								</AccordionItem>
							</Accordion>
						</div>
					</TabsContent>
					
					<TabsContent value="shipping" className="mt-6">
						<div className="max-w-3xl mx-auto prose">
							<h3>{t('store.shipping.title')}</h3>
							<p>{t('store.shipping.description')}</p>
							<ul>
								<li>{t('store.shipping.point1')}</li>
								<li>{t('store.shipping.point2')}</li>
								<li>{t('store.shipping.point3')}</li>
							</ul>
						</div>
					</TabsContent>
					
					<TabsContent value="returns" className="mt-6">
						<div className="max-w-3xl mx-auto prose">
							<h3>{t('store.returns.title')}</h3>
							<p>{t('store.returns.description')}</p>
							<ul>
								<li>{t('store.returns.point1')}</li>
								<li>{t('store.returns.point2')}</li>
								<li>{t('store.returns.point3')}</li>
							</ul>
						</div>
					</TabsContent>
				</Tabs>
			</div>
			
			{/* Cart Drawer */}
			<CartDrawer />
		</div>
	);
};

export default Store;
