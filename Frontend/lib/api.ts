// Silea API Service Layer
// Base URL configuration - update this to match your backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Types
export interface Category {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  slug: string;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSizePrice {
  id?: number;
  size: ProductSizeCode;
  sizeCode: string;
  sizeDisplayName: string;
  price: number;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  price: number; // Base price for largest size (5L for oil, 1kg for honey)
  available: boolean;
  imageUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  featured: boolean;
  category: {
    id: number;
    name: string;
    nameAr?: string;
  };
  sizePrices?: ProductSizePrice[];
  images?: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

// Product size options
export type ProductSizeCode = 'OIL_5L' | 'OIL_2L' | 'OIL_1L' | 'HONEY_1KG' | 'HONEY_500G' | 'HONEY_250G';

export interface ProductSize {
  code: ProductSizeCode;
  displayName: string;
  priceMultiplier: number;
}

export const OIL_SIZES: ProductSize[] = [
  { code: 'OIL_5L', displayName: '5 Litres', priceMultiplier: 1.00 },
  { code: 'OIL_2L', displayName: '2 Litres', priceMultiplier: 0.42 },
  { code: 'OIL_1L', displayName: '1 Litre', priceMultiplier: 0.22 },
];

export const HONEY_SIZES: ProductSize[] = [
  { code: 'HONEY_1KG', displayName: '1 Kilogram', priceMultiplier: 1.00 },
  { code: 'HONEY_500G', displayName: '500 Grams', priceMultiplier: 0.52 },
  { code: 'HONEY_250G', displayName: '250 Grams', priceMultiplier: 0.28 },
];

export function getSizesForCategory(categoryName: string): ProductSize[] {
  const name = categoryName.toLowerCase();
  if (name.includes('oil') || name.includes('huile') || name.includes('زيت')) {
    return OIL_SIZES;
  }
  if (name.includes('honey') || name.includes('miel') || name.includes('عسل')) {
    return HONEY_SIZES;
  }
  return HONEY_SIZES; // Default to honey sizes
}

export function calculatePrice(basePrice: number, size: ProductSize): number {
  return Math.round(basePrice * size.priceMultiplier * 100) / 100;
}

// Get the smallest size price for a product (for "Starting from" display)
export function getSmallestPrice(product: Product): number {
  if (product.sizePrices && product.sizePrices.length > 0) {
    const prices = product.sizePrices.map(sp => sp.price);
    return Math.min(...prices);
  }
  // Fallback: calculate from base price using smallest multiplier
  const sizes = getSizesForCategory(product.category?.name || '');
  const smallestMultiplier = Math.min(...sizes.map(s => s.priceMultiplier));
  return Math.round(product.price * smallestMultiplier * 100) / 100;
}

// Get price range for a product (min - max)
export function getPriceRange(product: Product): { min: number; max: number } {
  if (product.sizePrices && product.sizePrices.length > 0) {
    const prices = product.sizePrices.map(sp => sp.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }
  // Fallback: calculate from base price
  const sizes = getSizesForCategory(product.category?.name || '');
  const multipliers = sizes.map(s => s.priceMultiplier);
  return {
    min: Math.round(product.price * Math.min(...multipliers) * 100) / 100,
    max: Math.round(product.price * Math.max(...multipliers) * 100) / 100
  };
}

// Get medium size price (for balanced display)
export function getMediumPrice(product: Product): number {
  if (product.sizePrices && product.sizePrices.length > 0) {
    const sortedPrices = [...product.sizePrices].sort((a, b) => a.price - b.price);
    const midIndex = Math.floor(sortedPrices.length / 2);
    return sortedPrices[midIndex].price;
  }
  // Fallback: calculate from base price using medium multiplier
  const sizes = getSizesForCategory(product.category?.name || '');
  const midIndex = Math.floor(sizes.length / 2);
  return Math.round(product.price * sizes[midIndex].priceMultiplier * 100) / 100;
}

// Get price from explicit sizePrices if available, otherwise fallback to multiplier calculation
export function getPriceForSize(product: Product, sizeCode: ProductSizeCode): number {
  // First check if product has explicit size prices
  if (product.sizePrices && product.sizePrices.length > 0) {
    const sizePrice = product.sizePrices.find(sp => sp.size === sizeCode || sp.sizeCode === sizeCode);
    if (sizePrice) {
      return sizePrice.price;
    }
  }
  // Fallback to multiplier-based calculation
  const sizes = getSizesForCategory(product.category?.name || 'honey');
  const size = sizes.find(s => s.code === sizeCode);
  if (size) {
    return calculatePrice(product.price, size);
  }
  return product.price;
}

// Map frontend ProductSizeCode to backend expected sizeCode strings
export function toBackendSizeCode(code: ProductSizeCode): string {
  switch (code) {
    case 'OIL_5L':
      return '5L'
    case 'OIL_2L':
      return '2L'
    case 'OIL_1L':
      return '1L'
    case 'HONEY_1KG':
      return '1kg'
    case 'HONEY_500G':
      return '500g'
    case 'HONEY_250G':
      return '250g'
    default:
      return code as string
  }
}

// Get the best image URL for a product (primary image or fallback to imageUrl)
export function getProductImageUrl(product: Product): string {
  // Check for images array with primary image
  if (product.images && product.images.length > 0) {
    const primaryImage = product.images.find(img => img.isPrimary);
    if (primaryImage) {
      return filesApi.getImageUrl(primaryImage.imageUrl);
    }
    // Fallback to first image if no primary
    return filesApi.getImageUrl(product.images[0].imageUrl);
  }
  // Fallback to legacy imageUrl field
  return product.imageUrl ? filesApi.getImageUrl(product.imageUrl) : "/placeholder.svg";
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'ACTIVE' | 'NEW' | 'VIP';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    nameAr?: string;
  };
  quantity: number;
  size: ProductSizeCode;
  unitPrice: number;
  totalPrice: number;
}

// Order Status Types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface OrderStatusInfo {
  code: OrderStatus;
  isCancellable: boolean;
  isFinal: boolean;
  isActive: boolean;
}

export interface Order {
  id: number;
  orderNumber: string;
  trackingCode?: string;
  customer: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  orderItems?: OrderItem[];
  items?: OrderItem[];
  shippingAddress: string;
  orderDate: string;
  estimatedDeliveryDate: string;
  status: OrderStatus;
  total: number;
  notes?: string;
  itemCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderDetailResponse {
  id: number;
  orderNumber: string;
  trackingCode?: string;
  status: OrderStatus;
  orderDate: string;
  estimatedDeliveryDate: string;
  shippingAddress: string;
  notes?: string;
  total: number;
  itemCount: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    productNameAr?: string;
    size: string;
    sizeCode: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  monthlyRevenue: number;
  todaysOrders: number;
  activeOrders: number;
  completionRate: number;
  cancellationRate: number;
}

// Tracking Status Types
export type TrackingStatus = 'ORDER_PLACED' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'DELIVERY_ATTEMPTED' | 'CANCELLED' | 'RETURNED';

export interface TrackingRecord {
  id: number;
  orderId?: number;
  status: TrackingStatus;
  location?: string;
  carrier?: string;
  notes?: string;
  statusDate: string;
  createdAt: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
  size: ProductSizeCode;
}

export interface DashboardStats {
  orders: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
  customers: {
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
  };
  products: {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    unavailableProducts: number;
  };
  tracking: {
    totalTrackings: number;
    inTransit: number;
    delivered: number;
    pending: number;
  };
}

export interface RecentOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  orderDate: string;
  itemCount: number;
}

export interface DeliveryPerformance {
  averageDeliveryTime: number;
  delayedOrdersCount: number;
}

export interface InventoryAlerts {
  unavailableProducts: number;
  totalProducts: number;
}

export interface DashboardAlerts {
  unavailableProductsCount: number;
  pendingOrdersCount: number;
  delayedDeliveriesCount: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('silea_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// API Error Handler
class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorDetails;
    try {
      const text = await response.text();
      // Try to parse as JSON, fallback to plain text
      if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
        errorDetails = JSON.parse(text);
      } else if (text.trim()) {
        errorDetails = { message: text };
      } else {
        errorDetails = { message: `HTTP Error ${response.status}: ${response.statusText}` };
      }
    } catch {
      errorDetails = { message: `HTTP Error ${response.status}: ${response.statusText}` };
    }
    
    const errorMessage = errorDetails.message || errorDetails.error || `Request failed with status ${response.status}`;
    
    // Handle 403 Forbidden - authentication/authorization issue
    if (response.status === 403) {
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('silea_token');
        localStorage.removeItem('silea_user');
        // Redirect to login page
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin') {
          window.location.href = '/admin';
        }
      }
      throw new ApiError(response.status, 'Access denied. Please log in again.', errorDetails);
    }
    
    // Only log non-404 and non-403 errors to console to reduce noise
    // 404 and 403 errors are handled gracefully in the UI
    if (response.status !== 404 && response.status !== 403) {
      console.error(`API Error [${response.status}]:`, errorMessage, errorDetails);
    }
    
    throw new ApiError(response.status, errorMessage, errorDetails);
  }
  
  try {
    return await response.json();
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    throw new ApiError(500, 'Invalid JSON response from server');
  }
}

// ============================================
// AUTHENTICATION
// ============================================

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(response);
  },

  checkEmail: async (email: string): Promise<{ exists: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/check-email?email=${encodeURIComponent(email)}`);
    return handleResponse<{ exists: boolean }>(response);
  },

  getProfile: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/profile?userId=${userId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// CATEGORIES
// ============================================

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories`);
    return handleResponse<Category[]>(response);
  },

  getActive: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories/active`);
    return handleResponse<Category[]>(response);
  },

  getById: async (id: number): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`);
    return handleResponse<Category>(response);
  },

  create: async (data: { name: string; nameArabic: string; description: string; slug?: string; imageUrl?: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: number, data: { name: string; nameArabic: string; description: string; slug?: string; imageUrl?: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateStatus: async (id: number, active: boolean) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ active }),
    });
    return handleResponse(response);
  },

  updateImage: async (id: number, imageUrl: string) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories/${id}/image`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ imageUrl }),
    });
    return handleResponse(response);
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// PUBLIC CATEGORIES API (for frontend browsing)
// ============================================

export const publicCategoriesApi = {
  // Get all active categories
  getAll: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    return handleResponse<Category[]>(response);
  },

  // Alias for getAll (public API always returns active categories)
  getActive: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    return handleResponse<Category[]>(response);
  },

  // Get category by slug
  getBySlug: async (slug: string): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/api/categories/slug/${slug}`);
    return handleResponse<Category>(response);
  },

  // Get category by ID
  getById: async (id: number): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`);
    return handleResponse<Category>(response);
  },
};

// ============================================
// FILE UPLOADS
// ============================================

export const filesApi = {
  // Upload a file using FormData
  uploadFile: async (file: File): Promise<{ success: boolean; filename: string; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('silea_token') : null;
    const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    return handleResponse(response);
  },

  // Upload a base64 image
  uploadBase64: async (imageData: string, mimeType?: string): Promise<{ success: boolean; filename: string; url: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/files/upload-base64`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ imageData, mimeType }),
    });
    return handleResponse(response);
  },

  // Get full image URL from relative path
  getImageUrl: (path: string): string => {
    if (!path) return '';
    // If already a full URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
      return path;
    }
    // If it's a relative API path, prepend base URL
    if (path.startsWith('/api/')) {
      return `${API_BASE_URL}${path}`;
    }
    // If it's a local file path (starting with /), return as-is (for static files)
    if (path.startsWith('/')) {
      return path;
    }
    // Otherwise assume it's a filename and construct the URL
    return `${API_BASE_URL}/api/files/images/${path}`;
  },

  // Delete an uploaded image
  deleteImage: async (filename: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/files/images/${filename}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// PRODUCTS
// ============================================

export const productsApi = {
  getAll: async (page = 0, size = 12): Promise<{ products: Product[]; totalElements: number; totalPages: number; currentPage: number }> => {
    const response = await fetch(`${API_BASE_URL}/api/products?page=${page}&size=${size}`);
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
    return handleResponse<Product>(response);
  },

  search: async (query: string): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/api/products/search?query=${encodeURIComponent(query)}`);
    return handleResponse<Product[]>(response);
  },

  getByCategory: async (categoryId: number): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/api/products/category/${categoryId}`);
    return handleResponse<Product[]>(response);
  },

  getFeatured: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/api/products/featured`);
    return handleResponse<Product[]>(response);
  },

  // Admin endpoints
  create: async (data: {
    name: string;
    nameArabic: string;
    description: string;
    price: number;
    available: boolean;
    categoryId: number;
    imageUrl: string;
    sizePrices?: { sizeCode: string; price: number }[];
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/products/admin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: number, data: {
    name: string;
    nameArabic: string;
    description: string;
    price: number;
    available: boolean;
    imageUrl: string;
    sizePrices?: { sizeCode: string; price: number }[];
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/products/admin/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE') => {
    const response = await fetch(`${API_BASE_URL}/api/products/admin/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  updateFeatured: async (id: number, featured: boolean) => {
    const response = await fetch(`${API_BASE_URL}/api/products/admin/${id}/featured`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ featured }),
    });
    return handleResponse(response);
  },

  updateAvailable: async (id: number, available: boolean) => {
    const response = await fetch(`${API_BASE_URL}/api/products/admin/${id}/available`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ available }),
    });
    return handleResponse(response);
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/products/admin/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Image management
  getImages: async (productId: number): Promise<ProductImage[]> => {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}/images`);
    return handleResponse<ProductImage[]>(response);
  },

  addImages: async (productId: number, imageUrls: string[]) => {
    const response = await fetch(`${API_BASE_URL}/api/products/admin/${productId}/images`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ imageUrls }),
    });
    return handleResponse(response);
  },

  deleteImage: async (productId: number, imageId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/products/admin/${productId}/images/${imageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  setPrimaryImage: async (productId: number, imageId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/products/admin/${productId}/images/${imageId}/primary`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  reorderImages: async (productId: number, imageIds: number[]) => {
    const response = await fetch(`${API_BASE_URL}/api/products/admin/${productId}/images/reorder`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ imageIds }),
    });
    return handleResponse(response);
  },
};

// ============================================
// CUSTOMERS (Admin)
// ============================================

export const customersApi = {
  getAll: async (page = 0, size = 10): Promise<{ customers: Customer[]; totalElements: number; totalPages: number; currentPage: number }> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Customer>(response);
  },

  create: async (data: { name: string; email: string; phone: string; address: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: number, data: { name: string; email: string; phone: string; address: string }) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateStatus: async (id: number, status: 'ACTIVE' | 'NEW' | 'VIP') => {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  search: async (query: string): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/search?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Customer[]>(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getVip: async (threshold = 1000): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/vip?threshold=${threshold}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Customer[]>(response);
  },

  // Get customers with at least one order (for retargeting)
  getWithOrders: async (): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/with-orders`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Customer[]>(response);
  },

  // Get at-risk customers (haven't ordered recently)
  getAtRisk: async (daysSinceLastOrder = 60): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/at-risk?daysSinceLastOrder=${daysSinceLastOrder}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Customer[]>(response);
  },

  // Get repeat customers
  getRepeat: async (minOrders = 3): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/repeat?minOrders=${minOrders}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Customer[]>(response);
  },

  // Get new customers
  getNew: async (daysAgo = 30): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/new?daysAgo=${daysAgo}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Customer[]>(response);
  },

  // Get customer segments
  getSegments: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/segments`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Filter customers by criteria
  filter: async (params: {
    status?: 'ACTIVE' | 'NEW' | 'VIP';
    minSpent?: number;
    maxSpent?: number;
    minOrders?: number;
    maxOrders?: number;
    fromDate?: string; // ISO date string yyyy-mm-dd
    toDate?: string; // ISO date string yyyy-mm-dd
  }): Promise<Customer[]> => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.minSpent !== undefined) queryParams.append('minSpent', params.minSpent.toString());
    if (params.maxSpent !== undefined) queryParams.append('maxSpent', params.maxSpent.toString());
    if (params.minOrders !== undefined) queryParams.append('minOrders', params.minOrders.toString());
    if (params.maxOrders !== undefined) queryParams.append('maxOrders', params.maxOrders.toString());
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);

    const response = await fetch(`${API_BASE_URL}/api/admin/customers/filter?${queryParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Customer[]>(response);
  },
};

// ============================================
// ORDERS
// ============================================

export const ordersApi = {
  // ---- Public Customer Endpoints ----
  
  create: async (data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    notes?: string;
    estimatedDeliveryDate?: string;
    items: CartItem[];
  }): Promise<{
    success: boolean;
    message: string;
    order?: OrderDetailResponse;
  }> => {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`);
    return handleResponse<Order>(response);
  },

  trackByNumber: async (orderNumber: string): Promise<OrderDetailResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/track/${encodeURIComponent(orderNumber)}`);
    return handleResponse<OrderDetailResponse>(response);
  },

  trackByCode: async (trackingCode: string): Promise<OrderDetailResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/track/code/${encodeURIComponent(trackingCode)}`);
    return handleResponse<OrderDetailResponse>(response);
  },

  getByEmail: async (email: string): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/customer/${encodeURIComponent(email)}`);
    return handleResponse<Order[]>(response);
  },

  cancelOrder: async (id: number, reason?: string): Promise<{ success: boolean; message: string; order: OrderDetailResponse }> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason || 'Customer request' }),
    });
    return handleResponse(response);
  },

  getSizes: async (): Promise<{ oil: ProductSize[]; honey: ProductSize[] }> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/sizes`);
    return handleResponse(response);
  },

  getStatuses: async (): Promise<OrderStatusInfo[]> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/statuses`);
    return handleResponse(response);
  },

  // ---- Admin Endpoints ----
  
  getAll: async (page = 0, size = 10): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Order[]>(response);
  },

  getDetails: async (id: number): Promise<OrderDetailResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin/${id}/details`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<OrderDetailResponse>(response);
  },

  updateStatus: async (id: number, status: OrderStatus): Promise<{ success: boolean; message: string; order: Order }> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  confirmOrder: async (id: number): Promise<{ success: boolean; message: string; order: OrderDetailResponse }> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin/${id}/confirm`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  cancelOrderAdmin: async (id: number, reason?: string): Promise<{ success: boolean; message: string; order: OrderDetailResponse }> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason: reason || 'Cancelled by admin' }),
    });
    return handleResponse(response);
  },

  updateAddress: async (id: number, shippingAddress: string): Promise<{ success: boolean; message: string; order: OrderDetailResponse }> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin/${id}/address`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ shippingAddress }),
    });
    return handleResponse(response);
  },

  updateNotes: async (id: number, notes: string): Promise<{ success: boolean; message: string; order: OrderDetailResponse }> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin/${id}/notes`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes }),
    });
    return handleResponse(response);
  },

  getRecent: async (limit = 10): Promise<OrderDetailResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin/recent?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getByStatus: async (status: string): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin/status/${status}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Order[]>(response);
  },

  search: async (query: string): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin/search?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Order[]>(response);
  },

  getDeliveryToday: async (): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin/delivery-today`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Order[]>(response);
  },

  getOverdue: async (): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin/overdue`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Order[]>(response);
  },

  getHighValue: async (threshold = 500): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin/high-value?threshold=${threshold}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Order[]>(response);
  },

  getStats: async (): Promise<OrderStatistics> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<OrderStatistics>(response);
  },

  getRevenue: async (startDate: string, endDate: string): Promise<{ revenue: number; startDate: string; endDate: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/admin/revenue?startDate=${startDate}&endDate=${endDate}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// TRACKING
// ============================================

export const trackingApi = {
  // ---- Public Endpoints ----
  
  getByOrderId: async (orderId: number): Promise<TrackingRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/api/tracking/order/${orderId}`);
    return handleResponse<TrackingRecord[]>(response);
  },

  getLatest: async (orderId: number): Promise<TrackingRecord> => {
    const response = await fetch(`${API_BASE_URL}/api/tracking/order/${orderId}/latest`);
    return handleResponse<TrackingRecord>(response);
  },

  trackByOrderNumber: async (orderNumber: string): Promise<{ order: Order; trackingHistory: TrackingRecord[] }> => {
    const response = await fetch(`${API_BASE_URL}/api/tracking/track/${encodeURIComponent(orderNumber)}`);
    return handleResponse(response);
  },

  // ---- Admin Endpoints ----
  
  addUpdate: async (data: {
    orderId: number;
    status: TrackingStatus;
    location?: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string; tracking: TrackingRecord }> => {
    const response = await fetch(`${API_BASE_URL}/api/tracking/admin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getByStatus: async (status: string): Promise<TrackingRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/api/tracking/admin/status/${status}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<TrackingRecord[]>(response);
  },

  getRecent: async (hours = 24): Promise<TrackingRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/api/tracking/admin/recent?hours=${hours}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<TrackingRecord[]>(response);
  },

  getPendingDeliveries: async (): Promise<TrackingRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/api/tracking/admin/pending-deliveries`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<TrackingRecord[]>(response);
  },

  getStats: async (): Promise<{
    statusStats: Array<[TrackingStatus, number]>;
    totalTrackingRecords: number;
    recordsWithLocation: number;
  }> => {
    const response = await fetch(`${API_BASE_URL}/api/tracking/admin/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getDelayedOrders: async (hoursThreshold = 48): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/api/tracking/admin/delayed?hoursThreshold=${hoursThreshold}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Order[]>(response);
  },

  getAverageDeliveryTime: async (): Promise<{ averageDeliveryTimeHours: number }> => {
    const response = await fetch(`${API_BASE_URL}/api/tracking/admin/average-delivery-time`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// CART
// ============================================

export const cartApi = {
  calculate: async (items: CartItem[]): Promise<{ total: number; itemCount: number }> => {
    const response = await fetch(`${API_BASE_URL}/api/cart/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    return handleResponse(response);
  },

  validate: async (items: CartItem[]): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> => {
    const response = await fetch(`${API_BASE_URL}/api/cart/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    return handleResponse(response);
  },

  getSummary: async (items: CartItem[]): Promise<{
    subtotal: number;
    totalItems: number;
    items: Array<{
      productId: number;
      productName: string;
      quantity: number;
      unitPrice: number;
      itemTotal: number;
    }>;
  }> => {
    const response = await fetch(`${API_BASE_URL}/api/cart/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    return handleResponse(response);
  },

  checkMinimum: async (minimumValue: number, items: CartItem[]): Promise<{ hasMinimum: boolean; minimumValue: number }> => {
    const response = await fetch(`${API_BASE_URL}/api/cart/check-minimum`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minimumValue, items }),
    });
    return handleResponse(response);
  },

  reserveStock: async (items: CartItem[]): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/cart/reserve-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    return handleResponse(response);
  },

  getShipping: async (items: CartItem[]): Promise<{ subtotal: number; shipping: number; freeShippingThreshold: number }> => {
    const response = await fetch(`${API_BASE_URL}/api/cart/shipping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    return handleResponse(response);
  },
};

// ============================================
// DASHBOARD (Admin)
// ============================================

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DashboardStats>(response);
  },

  getRecentOrders: async (limit = 10): Promise<{ orders: RecentOrder[]; count: number }> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/recent-orders?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getDeliveryPerformance: async (): Promise<DeliveryPerformance> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/delivery-performance`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getInventoryAlerts: async (): Promise<InventoryAlerts> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/inventory-alerts`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAlerts: async (): Promise<DashboardAlerts> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/alerts`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

