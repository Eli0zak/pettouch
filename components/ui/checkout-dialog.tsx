import { useState, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from '@/integrations/supabase/types';

interface ShippingAddress {
  name: string;
  street: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    discount?: number;
  };
  quantity: number;
}

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  cartTotal: number;
  onSuccess: () => void;
}

export function CheckoutDialog({ open, onOpenChange, cart, cartTotal, onSuccess }: CheckoutDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    street: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please log in to complete your purchase",
          variant: "destructive"
        });
        return;
      }

      // Convert cart items to a format compatible with Json type
      const cartItems = cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        discount: item.product.discount,
        quantity: item.quantity
      }));

      // Create the order with proper type casting
      const { error } = await supabase
        .from('store_orders')
        .insert({
          user_id: user.id,
          items: cartItems as unknown as Json,
          total_amount: cartTotal,
          shipping_address: JSON.parse(JSON.stringify(shippingAddress)) as Json,
          payment_info: {
            method: "Cash on Delivery",
            status: "pending"
          } as unknown as Json,
          status: "pending"
        });

      if (error) throw error;

      toast({
        title: "Order Placed Successfully!",
        description: "Thank you for your order. You'll pay when your order is delivered."
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: error.message || "There was an error processing your order",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Complete Your Order</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Please provide your shipping details. You'll pay when your order is delivered.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base">Contact Information</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name*</Label>
                  <Input
                    id="name"
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    required
                    placeholder="John Doe"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number*</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    required
                    placeholder="+1 (555) 123-4567"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base">Shipping Address</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address*</Label>
                  <Input
                    id="street"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    required
                    placeholder="123 Main St"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street2">Apartment, suite, etc. (optional)</Label>
                  <Input
                    id="street2"
                    value={shippingAddress.street2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street2: e.target.value })}
                    placeholder="Apt 4B"
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City*</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      required
                      placeholder="New York"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State*</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      required
                      placeholder="NY"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code*</Label>
                    <Input
                      id="zip"
                      value={shippingAddress.zip}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                      required
                      placeholder="10001"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country*</Label>
                    <Input
                      id="country"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      required
                      placeholder="United States"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base">Order Summary</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Items:</span>
                  <span>{cart.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Payment Method:</span>
                  <span>Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? "Processing..." : "Place Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}