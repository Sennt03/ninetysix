export declare function slugify(input: string): string;
export declare function uniqueSlug(base: string, exists: (candidate: string) => Promise<boolean>): Promise<string>;
