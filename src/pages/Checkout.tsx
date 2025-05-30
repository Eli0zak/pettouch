
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Info, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, totalItems, clearCart } = useCart();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    notes: '',
  });
  
  const [loading, setLoading] = useState(false);
  
  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle checkout
  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some items to your cart before checking out.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // TODO: Implement payment gateway integration here
      
      // Create order in database
      const orderItems = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: Number((item.product.sale_price || item.product.price).toFixed(2)),
        product_name: item.product.name,
        selected_attributes: item.selected_attributes || {},
      }));
      
      const shippingAddress = {
        name: `${formData.firstName} ${formData.lastName}`,
        street: formData.address,
        street2: null,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode,
        country: formData.country,
        phone: formData.phone,
        is_default: false
      };
      
      // Check user authentication
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to complete your purchase",
          variant: "destructive"
        });
        navigate('/auth', { state: { returnUrl: '/checkout' } });
        return;
      }
      
      const { error } = await supabase.from('store_orders').insert({
        user_id: user.id,
        items: orderItems,
        shipping_address: shippingAddress,
        total_amount: Number(subtotal.toFixed(2)),
        subtotal: Number(subtotal.toFixed(2)),
        shipping_fee: 0,
        tax: 0,
        discount: 0,
        status: 'pending',
        payment_info: {
          method: 'credit_card',
          status: 'pending',
          transaction_id: null,
          paid_at: null
        },
        customer_email: formData.email,
        notes: formData.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      if (error) throw error;
      
      // Reset cart and redirect to success page
      clearCart();
      
      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!",
      });
      
      navigate('/dashboard/orders');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "There was an issue processing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Checkout</h1>
            <div className="text-sm text-muted-foreground mt-1">
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link to="/store" className="flex items-center">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Return to shopping
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Checkout Form */}
          <form onSubmit={handleCheckout}>
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>
                  Enter your details to complete your order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Order notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions for delivery"
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm flex items-start gap-2">
                  <Info className="text-muted-foreground h-4 w-4 mt-0.5" />
                  <span className="text-muted-foreground">
                    Your personal data will be used to process your order and for other purposes described in our privacy policy.
                  </span>
                </div>
              </CardFooter>
            </Card>
            
            <div className="mt-8 flex justify-end">
              <Button type="submit" className="w-full md:w-auto" disabled={loading || cartItems.length === 0}>
                {loading ? 'Processing...' : 'Place Order'}
              </Button>
            </div>
          </form>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-80">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" /> Order Summary
              </CardTitle>
              <CardDescription>{totalItems} item{totalItems !== 1 && 's'}</CardDescription>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 overflow-hidden rounded-md border bg-muted flex-shrink-0">
                        {item.product.thumbnail ? (
                          <img
                            src={item.product.thumbnail}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
                            <span className="text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm">
                          {formatPrice((item.product.sale_price || item.product.price) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Shipping</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tax</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
