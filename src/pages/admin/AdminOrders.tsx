import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ShoppingBag, Package, Search } from 'lucide-react';
import type { OrderStatus, Order, OrderItem, ShippingAddress, PaymentInfo } from '@/types';

// Raw types for database responses
interface RawOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
  selected_attributes?: Record<string, any>;
}

interface RawShippingAddress {
  name: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  is_default?: boolean;
}

interface RawPaymentInfo {
  method: string;
  status: string;
  transaction_id?: string;
  paid_at?: string;
}

interface DatabaseOrder {
  id: string;
  user_id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: string | any[];
  shipping_address: string | any;
  payment_info: string | any | null;
  tracking_number: string | null;
  subtotal?: number;
  shipping_fee?: number;
  tax?: number;
  discount?: number;
  notes?: string;
  estimated_delivery?: string;
  customer_email?: string;
  billing_address?: string | any;
  updated_at?: string;
  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

// Utility function to safely convert values to strings
const safeStringify = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return value.toString();
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return '[Object]';
    }
  }
  return String(value);
};

// Utility function to safely format numbers with toFixed
const safeToFixed = (value: any, digits: number = 2): string => {
  if (value === null || value === undefined) return '0.00';
  if (typeof value !== 'number') {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return '0.00';
    return parsed.toFixed(digits);
  }
  return value.toFixed(digits);
};

// Utility to safely parse numeric fields from database
const safeParseNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// Utility to safely parse JSON
const safeParseJson = <T,>(value: string | any): T | null => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return null;
    }
  }
  return value as T;
};

const AdminOrders: React.FC = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchQuery]);

  const parseOrderItems = (rawItems: string | any[]): OrderItem[] => {
    const parsedItems = safeParseJson<RawOrderItem[]>(rawItems);
    if (!Array.isArray(parsedItems)) return [];
    
    return parsedItems.map(item => ({
      product_id: item.product_id?.toString() || '',
      product_name: item.product_name?.toString() || '',
      quantity: safeParseNumber(item.quantity),
      price: safeParseNumber(item.price),
      image_url: item.image_url?.toString(),
      selected_attributes: item.selected_attributes || {}
    }));
  };

  const parseShippingAddress = (rawAddress: string | any): ShippingAddress => {
    const defaultAddress: ShippingAddress = {
      name: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      phone: '',
    };

    const parsed = safeParseJson<RawShippingAddress>(rawAddress);
    if (!parsed) return defaultAddress;

    return {
      name: parsed.name || '',
      street: parsed.street || '',
      street2: parsed.street2,
      city: parsed.city || '',
      state: parsed.state || '',
      zip: parsed.zip || '',
      country: parsed.country || '',
      phone: parsed.phone || '',
      is_default: !!parsed.is_default
    };
  };

  const parsePaymentInfo = (rawInfo: string | any | null): PaymentInfo | null => {
    if (!rawInfo) return null;

    const parsed = safeParseJson<RawPaymentInfo>(rawInfo);
    if (!parsed) return null;

    return {
      method: parsed.method || '',
      status: parsed.status || '',
      transaction_id: parsed.transaction_id,
      paid_at: parsed.paid_at
    };
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('store_orders')
        .select(`
          *,
          user:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (searchQuery) {
        query = query.or(`id.ilike.%${searchQuery}%,tracking_number.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Parse JSON fields and construct properly typed Order objects
      const parsedOrders = (data as DatabaseOrder[]).map(order => {
        // First, handle all the non-JSON fields with proper typing
        const typedOrder: Order = {
          id: order.id,
          user_id: order.user_id,
          created_at: order.created_at || new Date().toISOString(),
          status: (order.status as OrderStatus) || 'pending',
          total_amount: safeParseNumber(order.total_amount),
          subtotal: order.subtotal !== undefined ? safeParseNumber(order.subtotal) : undefined,
          shipping_fee: order.shipping_fee !== undefined ? safeParseNumber(order.shipping_fee) : undefined,
          tax: order.tax !== undefined ? safeParseNumber(order.tax) : undefined,
          discount: order.discount !== undefined ? safeParseNumber(order.discount) : undefined,
          tracking_number: order.tracking_number,
          items: parseOrderItems(order.items),
          shipping_address: parseShippingAddress(order.shipping_address),
          payment_info: parsePaymentInfo(order.payment_info),
          notes: order.notes,
          estimated_delivery: order.estimated_delivery,
          customer_email: order.customer_email,
          billing_address: order.billing_address ? parseShippingAddress(order.billing_address) : undefined,
          updated_at: order.updated_at,
          user: order.user ? {
            first_name: order.user.first_name,
            last_name: order.user.last_name,
            email: order.user.email,
          } : null
        };

        return typedOrder;
      });
      
      setOrders(parsedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('store_orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }

      // Update local state
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prevOrder => prevOrder ? { ...prevOrder, status: newStatus } : null);
      }

      toast({
        title: 'Status Updated',
        description: `Order status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">Manage and track customer orders</p>
        </div>
        <Button onClick={fetchOrders} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                {orders.length} total orders
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  className="pl-10 w-full sm:w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(value: OrderStatus | 'all') => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        {order.user ? (
                          <span>
                            {safeStringify(order.user.first_name)} {safeStringify(order.user.last_name)}
                          </span>
                        ) : (
                          "Unknown"
                        )}
                      </TableCell>
                      <TableCell>${safeToFixed(order.total_amount)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {order.payment_info ? safeStringify(order.payment_info.method) : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order ID: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Order Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.created_at)}</p>
                    <p>
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Tracking Number:</span> {selectedOrder.tracking_number || 'Not assigned'}</p>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Customer</h3>
                    <div className="space-y-1 text-sm">
                      {selectedOrder.user ? (
                        <>
                          <p><span className="font-medium">Name:</span> {safeStringify(selectedOrder.user.first_name)} {safeStringify(selectedOrder.user.last_name)}</p>
                          <p><span className="font-medium">Email:</span> {safeStringify(selectedOrder.user.email)}</p>
                        </>
                      ) : (
                        <p>Customer information not available</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <div className="space-y-1 text-sm">
                    {selectedOrder.shipping_address ? (
                      <>
                        <p>{safeStringify(selectedOrder.shipping_address.name)}</p>
                        <p>{safeStringify(selectedOrder.shipping_address.street)}</p>
                        {selectedOrder.shipping_address.street2 && (
                          <p>{safeStringify(selectedOrder.shipping_address.street2)}</p>
                        )}
                        <p>
                          {safeStringify(selectedOrder.shipping_address.city)}, {safeStringify(selectedOrder.shipping_address.state)} {safeStringify(selectedOrder.shipping_address.zip)}
                        </p>
                        <p>{safeStringify(selectedOrder.shipping_address.country)}</p>
                        <p><span className="font-medium">Phone:</span> {safeStringify(selectedOrder.shipping_address.phone)}</p>
                      </>
                    ) : (
                      <p>Shipping address not available</p>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Payment Information</h3>
                    <div className="space-y-1 text-sm">
                      {selectedOrder.payment_info ? (
                        <>
                          <p><span className="font-medium">Method:</span> {safeStringify(selectedOrder.payment_info.method)}</p>
                          <p><span className="font-medium">Status:</span> {safeStringify(selectedOrder.payment_info.status)}</p>
                          {selectedOrder.payment_info.transaction_id && (
                            <p><span className="font-medium">Transaction ID:</span> {safeStringify(selectedOrder.payment_info.transaction_id)}</p>
                          )}
                          {selectedOrder.payment_info.paid_at && (
                            <p><span className="font-medium">Paid on:</span> {formatDate(selectedOrder.payment_info.paid_at)}</p>
                          )}
                        </>
                      ) : (
                        <p>Payment information not available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {item.image_url && (
                                <img 
                                  src={item.image_url} 
                                  alt={item.product_name} 
                                  className="h-10 w-10 object-cover rounded-md"
                                />
                              )}
                              <div>
                                <p className="font-medium">{safeStringify(item.product_name)}</p>
                                {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    {Object.entries(item.selected_attributes).map(([key, value], i) => (
                                      <span key={key}>
                                        {key}: {safeStringify(value)}
                                        {i < Object.keys(item.selected_attributes || {}).length - 1 ? ', ' : ''}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>${safeToFixed(item.price)}</TableCell>
                          <TableCell>{item.quantity || 0}</TableCell>
                          <TableCell className="text-right">
                            ${safeToFixed((item.price || 0) * (item.quantity || 0))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <Select 
                    value={selectedOrder.status} 
                    onValueChange={(value: OrderStatus) => updateOrderStatus(selectedOrder.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1 text-right">
                  <div className="text-sm">
                    <span className="font-medium">Subtotal:</span> ${safeToFixed(selectedOrder.subtotal)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Shipping:</span> ${safeToFixed(selectedOrder.shipping_fee)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Tax:</span> ${safeToFixed(selectedOrder.tax)}
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="text-sm text-green-600">
                      <span className="font-medium">Discount:</span> -${safeToFixed(selectedOrder.discount)}
                    </div>
                  )}
                  <div className="text-base font-bold">
                    <span>Total:</span> ${safeToFixed(selectedOrder.total_amount)}
                  </div>
                </div>
              </div>
              
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-sm">{safeStringify(selectedOrder.notes)}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
