import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Loader2, 
  Search, 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

const Orders = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }
        
        const { data, error } = await supabase
          .from('store_orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setOrders(data as Order[]);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your orders',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
    
    // Set up subscription for real-time updates
    const channel = supabase
      .channel('orders-channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'store_orders' 
      }, (payload) => {
        console.log('Order update:', payload);
        fetchOrders();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate, toast]);
  
  const getFilteredOrders = () => {
    let filtered = orders;
    
    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(order => order.status === activeTab);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.tracking_number?.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          {t('store.orderStatus.pending')}
        </Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">
          {t('store.orderStatus.processing')}
        </Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">
          {t('store.orderStatus.shipped')}
        </Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800">
          {t('store.orderStatus.delivered')}
        </Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">
          {t('store.orderStatus.cancelled')}
        </Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">
          {t('store.orderStatus.refunded')}
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ShoppingBag className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
      case 'refunded':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <ShoppingBag className="h-5 w-5" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };
  
  const filteredOrders = getFilteredOrders();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('store.myOrders')}</h1>
          <p className="text-muted-foreground">{t('store.trackYourOrders')}</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('store.searchOrders')}
              className="pl-10 w-full md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button onClick={() => navigate('/store')}>
            {t('store.continueShopping')}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">{t('store.allOrders')}</TabsTrigger>
          <TabsTrigger value="pending">{t('store.orderStatus.pending')}</TabsTrigger>
          <TabsTrigger value="processing">{t('store.orderStatus.processing')}</TabsTrigger>
          <TabsTrigger value="shipped">{t('store.orderStatus.shipped')}</TabsTrigger>
          <TabsTrigger value="delivered">{t('store.orderStatus.delivered')}</TabsTrigger>
          <TabsTrigger value="cancelled">{t('store.orderStatus.cancelled')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
                <p>{t('store.loadingOrders')}</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">{t('store.noOrdersFound')}</CardTitle>
                <p className="text-center text-muted-foreground mb-6">
                  {searchQuery || activeTab !== 'all' 
                    ? t('store.tryDifferentFilters')
                    : t('store.noOrdersYet')}
                </p>
                <Button onClick={() => navigate('/store')}>
                  {t('store.startShopping')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t('store.orderHistory')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('store.orderNumber')}</TableHead>
                      <TableHead>{t('store.date')}</TableHead>
                      <TableHead>{t('store.status')}</TableHead>
                      <TableHead>{t('store.total')}</TableHead>
                      <TableHead className="text-right">{t('store.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            {getStatusBadge(order.status)}
                          </div>
                        </TableCell>
                        <TableCell>${order.total_amount ? order.total_amount.toFixed(2) : '0.00'}</TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setSelectedOrder(order)}
                              >
                                {t('store.viewDetails')}
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  {t('store.orderDetails')} #{order.id.slice(0, 8)}
                                </DialogTitle>
                              </DialogHeader>
                              
                              {selectedOrder && (
                                <div className="space-y-6 py-4">
                                  {/* Order Status */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(selectedOrder.status)}
                                      <span className="font-medium">{t(`store.orderStatus.${selectedOrder.status}`)}</span>
                                    </div>
                                    {getStatusBadge(selectedOrder.status)}
                                  </div>
                                  
                                  {/* Order Info */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <h3 className="font-medium mb-2">{t('store.orderInformation')}</h3>
                                      <div className="space-y-1 text-sm">
                                        <p>
                                          <span className="text-muted-foreground">{t('store.orderNumber')}: </span>
                                          {selectedOrder.id}
                                        </p>
                                        <p>
                                          <span className="text-muted-foreground">{t('store.orderDate')}: </span>
                                          {formatDate(selectedOrder.created_at)}
                                        </p>
                                        <p>
                                          <span className="text-muted-foreground">{t('store.paymentMethod')}: </span>
                                          {selectedOrder.payment_info?.method === 'cash_on_delivery' 
                                            ? t('store.cashOnDelivery') 
                                            : selectedOrder.payment_info?.method}
                                        </p>
                                        {selectedOrder.tracking_number && (
                                          <p>
                                            <span className="text-muted-foreground">{t('store.trackingNumber')}: </span>
                                            {selectedOrder.tracking_number}
                                            <Button 
                                              variant="link" 
                                              className="p-0 h-auto text-primary ml-2"
                                              onClick={() => window.open(`https://track.aftership.com/trackings?tracking_numbers=${selectedOrder.tracking_number}`, '_blank')}
                                            >
                                              <ExternalLink className="h-3 w-3 inline ml-1" />
                                            </Button>
                                          </p>
                                        )}
                                        {selectedOrder.estimated_delivery && (
                                          <p>
                                            <span className="text-muted-foreground">{t('store.estimatedDelivery')}: </span>
                                            {formatDate(selectedOrder.estimated_delivery)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h3 className="font-medium mb-2">{t('store.shippingAddress')}</h3>
                                      <div className="space-y-1 text-sm">
                                        <p>{selectedOrder.shipping_address.name}</p>
                                        <p>{selectedOrder.shipping_address.street}</p>
                                        {selectedOrder.shipping_address.street2 && (
                                          <p>{selectedOrder.shipping_address.street2}</p>
                                        )}
                                        <p>
                                          {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}
                                        </p>
                                        <p>{selectedOrder.shipping_address.country}</p>
                                        <p>{selectedOrder.shipping_address.phone}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Order Items */}
                                  <div>
                                    <h3 className="font-medium mb-3">{t('store.orderItems')}</h3>
                                    <div className="border rounded-md overflow-hidden">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>{t('store.product')}</TableHead>
                                            <TableHead>{t('store.price')}</TableHead>
                                            <TableHead>{t('store.quantity')}</TableHead>
                                            <TableHead className="text-right">{t('store.total')}</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {selectedOrder.items.map((item, index) => (
                                            <TableRow key={index}>
                                              <TableCell>
                                                <div className="flex items-center gap-3">
                                                  {item.image_url && (
                                                    <div className="h-12 w-12 rounded-md overflow-hidden">
                                                      <img 
                                                        src={item.image_url} 
                                                        alt={item.product_name} 
                                                        className="h-full w-full object-cover"
                                                      />
                                                    </div>
                                                  )}
                                                  <div>
                                                    <p className="font-medium">{item.product_name}</p>
                                                    {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                                                      <p className="text-xs text-muted-foreground">
                                                        {Object.entries(item.selected_attributes).map(([key, value]) => (
                                                          <span key={key} className="mr-2">
                                                            {key}: {value}
                                                          </span>
                                                        ))}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              </TableCell>
                                              <TableCell>${item.price ? item.price.toFixed(2) : '0.00'}</TableCell>
                                              <TableCell>{item.quantity}</TableCell>
                                              <TableCell className="text-right">${item.price && item.quantity ? (item.price * item.quantity).toFixed(2) : '0.00'}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                  
                                  {/* Order Summary */}
                                  <div className="flex justify-end">
                                    <div className="w-full md:w-1/2 space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('store.subtotal')}</span>
                                        <span>${selectedOrder.subtotal ? selectedOrder.subtotal.toFixed(2) : '0.00'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('store.shipping')}</span>
                                        <span>${selectedOrder.shipping_fee ? selectedOrder.shipping_fee.toFixed(2) : '0.00'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('store.tax')}</span>
                                        <span>${selectedOrder.tax ? selectedOrder.tax.toFixed(2) : '0.00'}</span>
                                      </div>
                                      {selectedOrder.discount && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">{t('store.discount')}</span>
                                          <span>-${selectedOrder.discount.toFixed(2)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between font-medium text-lg border-t pt-2 mt-2">
                                        <span>{t('store.total')}</span>
                                        <span>${selectedOrder.total_amount ? selectedOrder.total_amount.toFixed(2) : '0.00'}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Order Notes */}
                                  {selectedOrder.notes && (
                                    <div>
                                      <h3 className="font-medium mb-2">{t('store.orderNotes')}</h3>
                                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                        {selectedOrder.notes}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Action Buttons */}
                                  <div className="flex justify-end gap-3 pt-4">
                                    {selectedOrder.status === 'pending' && (
                                      <Button variant="destructive">
                                        {t('store.cancelOrder')}
                                      </Button>
                                    )}
                                    <Button>
                                      {t('store.contactSupport')}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Orders; 