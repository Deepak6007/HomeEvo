"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { clientNavItems } from "@/lib/nav-config"
import { useAuth } from "@/hooks/useAuth"
import {
  useMaterials,
  useCart,
  useAddToCart,
  useCheckout,
} from "@/hooks/useMaterials"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatCurrency } from "@/lib/utils/format"
import { loadRazorpay, initializePayment } from "@/lib/razorpay"
import { toast } from "sonner"
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  MapPin,
  CreditCard,
  CheckCircle,
  ShoppingBagIcon,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"

export default function MaterialsStorePage() {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = React.useState("Cement")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [cartOpen, setCartOpen] = React.useState(false)

  // Checkout checkout wizard states
  const [checkoutStep, setCheckoutStep] = React.useState(1) // 1: Cart, 2: Address Form, 3: Success
  const [deliveryAddress, setDeliveryAddress] = React.useState("")
  const [isProcessingCheckout, setIsProcessingCheckout] = React.useState(false)

  // React Query APIs
  const { data: materialsRes, isLoading } = useMaterials({
    category: activeCategory,
    search: searchTerm || undefined,
  })
  const { data: cart } = useCart()
  const addToCartMutation = useAddToCart()
  const checkoutMutation = useCheckout()

  const products = materialsRes?.data || []
  const cartItems = cart?.items || []
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const cartTotal = cart?.totalAmount || 0

  const shellUser = React.useMemo(() => {
    return {
      name: user?.name || "Client User",
      email: user?.email || "",
      avatarInitials: user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "CU",
    }
  }, [user])

  const categories = [
    "Cement",
    "Steel",
    "Tiles",
    "Plumbing",
    "Electrical",
    "Paints",
    "Fittings",
  ]

  // Add item helper
  const handleAddToCart = async (productId: string) => {
    try {
      await addToCartMutation.mutateAsync({ productId, quantity: 1 })
      toast.success("Added to cart!")
    } catch (e) {
      toast.error("Failed to add item to cart")
    }
  }

  // Adjust item quantity
  const handleAdjustQuantity = async (productId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta
    try {
      await addToCartMutation.mutateAsync({ productId, quantity: newQty })
    } catch (e) {
      toast.error("Quantity adjustment failed")
    }
  }

  // Checkout Razorpay submission
  const handleCheckoutSubmit = async () => {
    if (!deliveryAddress) {
      toast.error("Please provide a delivery address.")
      return
    }

    try {
      setIsProcessingCheckout(true)
      toast.info("Initializing payment checkout...")

      // 1. Load Razorpay script
      const sdkLoaded = await loadRazorpay()
      if (!sdkLoaded) {
        throw new Error("Razorpay script failed to load.")
      }

      // 2. Open dummy order modal
      // In materials, we create a mock order to pay for
      const mockOrder = {
        id: "order_mat_" + Math.random().toString(36).slice(2, 9),
        amount: cartTotal * 100, // paisa
        currency: "INR",
      }

      const paymentResult = await initializePayment(mockOrder, {
        name: user?.name,
        email: user?.email,
        contact: user?.phone,
      })

      toast.info("Recording order shipment address...")

      // 3. Confirm checkout in database
      const itemsPayload = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
      await checkoutMutation.mutateAsync({
        items: itemsPayload,
        deliveryAddress,
      })

      toast.success("Order placed and payment captured! 🚚")
      setCheckoutStep(3)
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || "Payment checkout cancelled.")
    } finally {
      setIsProcessingCheckout(false)
    }
  }

  return (
    <DashboardShell role="client" navItems={clientNavItems} user={shellUser}>
      <div className="space-y-6 relative pb-16">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#3D2B1F]">Materials Store</h2>
            <p className="text-xs text-[#6F5B4B] font-medium tracking-wide">
              Direct-to-site delivery of standard builder supplies and hardware in Andhra Pradesh.
            </p>
          </div>
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white border border-[#E85D04]/10 p-3 rounded-xl shadow-2xs">
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => {
              const active = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat)
                    setSearchTerm("")
                  }}
                  className={`text-2xs font-semibold px-4 py-2 rounded-lg transition-all ${
                    active
                      ? "bg-[#E85D04] text-white shadow-xs"
                      : "text-[#6F5B4B] hover:bg-[#FDF8F2] hover:text-[#3D2B1F]"
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search in ${activeCategory}...`}
              className="pl-9 h-9 text-xs bg-card/40 border-border/80 text-[#3D2B1F]"
            />
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((k) => (
              <div
                key={k}
                className="h-[280px] rounded-xl border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-[#E85D04]/10 rounded-xl p-12 shadow-2xs">
            <EmptyState
              icon={<ShoppingBagIcon className="h-8 w-8 text-[#E85D04]" />}
              title="No Materials Found"
              description="No products found in this category matching your search."
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-[#E85D04]/10 rounded-xl p-4 flex flex-col justify-between h-[300px] hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5"
              >
                <div>
                  {/* Image Placeholder */}
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-[#FDF8F2] border mb-4 flex items-center justify-center text-muted-foreground">
                    <ShoppingBag className="h-8 w-8 text-[#E85D04]/40" />
                  </div>
                  <h4 className="text-xs font-bold text-[#3D2B1F] line-clamp-2 leading-snug">
                    {prod.name}
                  </h4>
                  <p className="text-3xs text-muted-foreground mt-0.5">
                    Category: {prod.category}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                  <div className="leading-tight">
                    <span className="text-sm font-bold text-[#3D2B1F] block">
                      {formatCurrency(prod.price)}
                    </span>
                    <span className="text-4xs text-muted-foreground block font-medium">
                      per {prod.unit}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(prod.id)}
                    className="bg-[#E85D04] text-white hover:bg-[#D45203] text-4xs font-semibold py-1 px-3 h-8 active:scale-95 transition-all shadow-2xs"
                  >
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Cart Button */}
        <Sheet open={cartOpen} onOpenChange={(open) => {
          setCartOpen(open)
          if (open) setCheckoutStep(1) // Reset step
        }}>
          <SheetTrigger
            render={
              <button className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#3D2B1F] text-white hover:bg-[#2C1F16] flex items-center justify-center shadow-lg active:scale-95 transition-transform z-40 group cursor-pointer border border-[#E85D04]/20">
                <ShoppingBag className="h-6 w-6 group-hover:scale-105 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-6 w-6 bg-[#E85D04] text-white text-3xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {cartItemCount}
                  </span>
                )}
              </button>
            }
          />
          
          <SheetContent className="bg-white text-[#3D2B1F] w-full max-w-md border-l border-border p-6 flex flex-col justify-between h-full">
            <SheetHeader className="border-b pb-4">
              <SheetTitle className="font-serif text-lg font-bold text-[#3D2B1F] flex items-center gap-2">
                <ShoppingBag className="text-[#E85D04]" /> Materials Cart
              </SheetTitle>
              <SheetDescription className="text-2xs text-[#6F5B4B]">
                Review items and finalize delivery directions.
              </SheetDescription>
            </SheetHeader>

            {/* Step 1: Cart Items */}
            {checkoutStep === 1 && (
              <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground">
                    Your cart is empty. Browse materials to add items.
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between border-b pb-3 gap-3 border-border/40"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h5 className="text-xs font-semibold text-[#3D2B1F] truncate leading-tight">
                          {item.product.name}
                        </h5>
                        <span className="text-3xs text-muted-foreground block font-medium">
                          {formatCurrency(item.product.price)} / {item.product.unit}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Adjust quantities */}
                        <Button
                          size="icon-xs"
                          variant="outline"
                          onClick={() => handleAdjustQuantity(item.productId, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-bold text-[#3D2B1F] min-w-4 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon-xs"
                          variant="outline"
                          onClick={() => handleAdjustQuantity(item.productId, item.quantity, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>

                        {/* Remove item */}
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => handleAdjustQuantity(item.productId, item.quantity, -item.quantity)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Step 2: Address Checkout Form */}
            {checkoutStep === 2 && (
              <div className="flex-1 my-4 space-y-4 overflow-y-auto pr-1">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[#3D2B1F] uppercase tracking-wide">
                    Delivery Address (Andhra Pradesh)
                  </h4>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter full physical address (Plot/Door No, Street Name, City, AP Pin Code)..."
                    rows={4}
                    className="w-full text-xs p-3 rounded-lg border outline-none bg-card/40 focus:border-[#E85D04]/40"
                  />
                </div>

                <div className="space-y-3 bg-[#FDF8F2] border border-[#E85D04]/10 rounded-xl p-4 text-xs">
                  <h5 className="font-semibold text-[#3D2B1F] border-b pb-1.5 mb-2">Order Summary</h5>
                  <div className="flex justify-between">
                    <span>Items Count</span>
                    <span>{cartItemCount} units</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#3D2B1F] pt-2 border-t border-border/40">
                    <span>Total Amount</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Success Confirmation */}
            {checkoutStep === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                <CheckCircle className="h-14 w-14 text-green-600 animate-bounce" />
                <h4 className="font-serif text-base font-bold text-[#3D2B1F]">
                  Order Placed Successfully!
                </h4>
                <p className="text-xs text-[#6F5B4B] max-w-xs leading-relaxed">
                  Your payment has been secure-locked. Our supplier fleet will transport materials to your site address.
                </p>
                <SheetClose
                  render={
                    <Button className="bg-[#3D2B1F] text-white hover:bg-[#2C1F16] text-xs font-semibold px-6">
                      Continue Shopping
                    </Button>
                  }
                />
              </div>
            )}

            {/* CartSheet Footer Buttons */}
            {checkoutStep !== 3 && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between font-bold text-sm text-[#3D2B1F]">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>

                {checkoutStep === 1 ? (
                  <Button
                    disabled={cartItems.length === 0}
                    onClick={() => setCheckoutStep(2)}
                    className="w-full bg-[#E85D04] text-white hover:bg-[#D45203] font-semibold text-xs py-2 shadow-sm flex items-center justify-center gap-1.5"
                  >
                    Proceed to Checkout <ChevronRight className="h-4.5 w-4.5" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setCheckoutStep(1)}
                      disabled={isProcessingCheckout}
                      className="text-[#6F5B4B] text-xs font-semibold"
                    >
                      <ChevronLeft className="mr-1 h-4.5 w-4.5" /> Cart
                    </Button>
                    <Button
                      onClick={handleCheckoutSubmit}
                      disabled={isProcessingCheckout}
                      className="flex-1 bg-[#E85D04] text-white hover:bg-[#D45203] font-semibold text-xs py-2 shadow-sm flex items-center justify-center gap-1.5"
                    >
                      {isProcessingCheckout ? (
                        <>
                          <Loader2 className="h-4.5 w-4.5 animate-spin" /> Verifying...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4.5 w-4.5" /> Confirm & Pay
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardShell>
  )
}
