import { StorefrontService } from './storefront.service';
export declare class StorefrontController {
    private readonly storefront;
    constructor(storefront: StorefrontService);
    home(): Promise<import("./storefront.service").StoreHomePayload>;
    catalog(): Promise<import("./storefront.service").StoreCatalogPayload>;
    products(category?: string): Promise<import("./storefront.service").StoreProductCard[]>;
    featured(): Promise<import("./storefront.service").StoreProductCard[]>;
    sitemap(): Promise<import("./storefront.service").StoreSitemap>;
    category(slug: string): Promise<import("./storefront.service").StoreCategoryDetail>;
    product(slug: string): Promise<import("./storefront.service").StoreProductDetail>;
}
