import { supabase } from '../lib/supabase';
import { ShopProduct } from '../types/shop';
import { OFFICIAL_SHOP_PRODUCTS } from '../constants/shopCatalog';

const SHOP_STORAGE_KEY = 'yara_shop_products_catalog';
const SETTING_KEY = 'shop_catalog';

/**
 * Fetch all shop products from Supabase system_settings or localStorage.
 * Returns empty array by default if no products have been uploaded yet.
 */
export async function getShopProducts(): Promise<ShopProduct[]> {
  try {
    // 1. Try fetching from Supabase system_settings
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', SETTING_KEY)
      .maybeSingle();

    if (!error && data?.value && Array.isArray(data.value.products)) {
      const dbProducts: ShopProduct[] = data.value.products;
      // Sync to local cache
      try {
        localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(dbProducts));
      } catch {}
      return dbProducts;
    }
  } catch (e) {
    console.warn('[ShopService] Error fetching products from Supabase:', e);
  }

  // 2. Fall back to localStorage cache
  try {
    const cached = localStorage.getItem(SHOP_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  // 3. Fall back to OFFICIAL_SHOP_PRODUCTS (which is empty by default)
  return OFFICIAL_SHOP_PRODUCTS || [];
}

/**
 * Save complete shop product list to Supabase system_settings and localStorage.
 */
export async function saveShopProducts(products: ShopProduct[]): Promise<boolean> {
  // Save to localStorage immediately
  try {
    localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(products));
  } catch {}

  // Upsert to Supabase system_settings
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: SETTING_KEY,
        value: { products, updated_at: new Date().toISOString() },
        description: 'Official YARA Hardware Shop product catalog and pricing'
      }, { onConflict: 'key' });

    if (error) {
      console.warn('[ShopService] Supabase upsert error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[ShopService] Error saving products to Supabase:', e);
    return false;
  }
}

/**
 * Add a new product to the shop.
 */
export async function addShopProduct(item: Omit<ShopProduct, 'id'>): Promise<ShopProduct> {
  const current = await getShopProducts();
  const newProduct: ShopProduct = {
    ...item,
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  };
  const updated = [newProduct, ...current];
  await saveShopProducts(updated);
  return newProduct;
}

/**
 * Update an existing product.
 */
export async function updateShopProduct(id: string, updates: Partial<ShopProduct>): Promise<boolean> {
  const current = await getShopProducts();
  const index = current.findIndex(p => p.id === id);
  if (index === -1) return false;

  current[index] = { ...current[index], ...updates };
  return await saveShopProducts(current);
}

/**
 * Delete a product from the shop.
 */
export async function deleteShopProduct(id: string): Promise<boolean> {
  const current = await getShopProducts();
  const filtered = current.filter(p => p.id !== id);
  return await saveShopProducts(filtered);
}
