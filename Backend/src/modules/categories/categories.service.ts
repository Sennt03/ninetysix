import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category, CategoryStatus, Prisma } from '@prisma/client';
import { ReorderItemDto } from '../../common/dto/reorder.dto';
import { uniqueSlug } from '../../common/utils/slug.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const MAX_DEPTH = 3;

type CategoryWithCount = Category & { _count: { products: number } };

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parentName?: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  sortOrder: number;
  status: CategoryStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  imageAssetId: string | null;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
  children: CategoryNode[];
}

export interface DeleteCategoryOptions {
  reassignChildrenTo?: string;
  reassignProductsTo?: string;
}

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
  ) {}

  /** Árbol completo ordenado por sortOrder. */
  async findTree(): Promise<CategoryNode[]> {
    const cats = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });

    const nodes = new Map<string, CategoryNode>();
    cats.forEach((c) => nodes.set(c.id, this.toNode(c)));

    const roots: CategoryNode[] = [];
    cats.forEach((c) => {
      const node = nodes.get(c.id)!;
      const parent = c.parentId ? nodes.get(c.parentId) : undefined;
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }

  /** Lista plana con nombre del padre y nº de productos. */
  async findFlat(params: {
    status?: CategoryStatus;
    parentId?: string;
    search?: string;
  }): Promise<CategoryNode[]> {
    const where: Prisma.CategoryWhereInput = {
      ...(params.status && { status: params.status }),
      ...(params.parentId && { parentId: params.parentId }),
      ...(params.search && { name: { contains: params.search } }),
    };
    const cats = await this.prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } }, parent: { select: { name: true } } },
    });
    return cats.map((c) => ({ ...this.toNode(c), parentName: c.parent?.name ?? null }));
  }

  async findOne(id: string): Promise<CategoryNode> {
    const c = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } }, parent: { select: { name: true } } },
    });
    if (!c) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return { ...this.toNode(c), parentName: c.parent?.name ?? null };
  }

  async create(dto: CreateCategoryDto): Promise<CategoryNode> {
    const slug = dto.slug
      ? await this.assertSlugFree(dto.slug)
      : await uniqueSlug(dto.name, (s) => this.slugExists(s));

    if (dto.parentId) {
      const { parentOf } = await this.loadGraph();
      if (!parentOf.has(dto.parentId)) {
        throw new NotFoundException('La categoría padre no existe');
      }
      if (this.depthOf(dto.parentId, parentOf) >= MAX_DEPTH) {
        throw new BadRequestException(`Máximo ${MAX_DEPTH} niveles de profundidad`);
      }
    }

    const imageUrl = await this.resolveImageUrl(dto.imageAssetId ?? null);

    const created = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description ?? null,
        parentId: dto.parentId ?? null,
        imageAssetId: dto.imageAssetId ?? null,
        imageUrl,
        imageAlt: dto.imageAlt ?? null,
        sortOrder: dto.sortOrder ?? 0,
        status: dto.status ?? CategoryStatus.active,
        metaTitle: dto.metaTitle ?? null,
        metaDescription: dto.metaDescription ?? null,
      },
      include: { _count: { select: { products: true } } },
    });
    return this.toNode(created);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryNode> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Categoría no encontrada');
    }
    if (dto.slug && dto.slug !== existing.slug) {
      await this.assertSlugFree(dto.slug, id);
    }
    if (dto.parentId !== undefined) {
      await this.validateParentChange(id, dto.parentId ?? null);
    }

    // Imagen: si cambia el asset, resolver la nueva URL y recordar el anterior.
    const changeImage = dto.imageAssetId !== undefined;
    const previousAssetId = existing.imageAssetId;
    const newImageUrl = changeImage ? await this.resolveImageUrl(dto.imageAssetId ?? null) : null;

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(changeImage && { imageAssetId: dto.imageAssetId ?? null, imageUrl: newImageUrl }),
        ...(dto.imageAlt !== undefined && { imageAlt: dto.imageAlt }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
        ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
      },
      include: { _count: { select: { products: true } } },
    });

    // Si se reemplazó/quitó la imagen, limpia del disco el asset anterior si quedó huérfano.
    if (changeImage && previousAssetId && previousAssetId !== dto.imageAssetId) {
      await this.media.cleanupOrphans([previousAssetId]);
    }
    return this.toNode(updated);
  }

  async remove(id: string, opts: DeleteCategoryOptions): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { children: true, products: true } } },
    });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    if (opts.reassignChildrenTo) {
      await this.ensureExists(opts.reassignChildrenTo);
    }
    if (opts.reassignProductsTo) {
      await this.ensureExists(opts.reassignProductsTo);
    }

    // Bloquear si algún producto quedaría sin ninguna categoría y no hay destino.
    if (category._count.products > 0 && !opts.reassignProductsTo) {
      const onlyHere = await this.prisma.product.count({
        where: {
          AND: [{ categories: { some: { id } } }, { categories: { every: { id } } }],
        },
      });
      if (onlyHere > 0) {
        throw new ConflictException(
          'Hay productos cuya única categoría es esta. Indica una categoría destino.',
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      if (opts.reassignProductsTo) {
        const products = await tx.product.findMany({
          where: { categories: { some: { id } } },
          select: { id: true },
        });
        for (const p of products) {
          await tx.product.update({
            where: { id: p.id },
            data: { categories: { connect: { id: opts.reassignProductsTo } } },
          });
        }
      }
      if (category._count.children > 0) {
        await tx.category.updateMany({
          where: { parentId: id },
          data: { parentId: opts.reassignChildrenTo ?? null },
        });
      }
      await tx.category.delete({ where: { id } });
    });

    // Limpia del disco la imagen de la categoría si quedó huérfana.
    if (category.imageAssetId) {
      await this.media.cleanupOrphans([category.imageAssetId]);
    }
  }

  /** Reordena hermanos: batch sortOrder. */
  async reorder(items: ReorderItemDto[]): Promise<void> {
    await this.prisma.$transaction(
      items.map((it) =>
        this.prisma.category.update({ where: { id: it.id }, data: { sortOrder: it.sortOrder } }),
      ),
    );
  }

  // ----------------------------- helpers -----------------------------

  /** Devuelve la URL pública del asset indicado (o null si no hay/ no existe). */
  private async resolveImageUrl(assetId: string | null): Promise<string | null> {
    if (!assetId) {
      return null;
    }
    const asset = await this.prisma.mediaAsset.findUnique({
      where: { id: assetId },
      select: { url: true },
    });
    if (!asset) {
      throw new NotFoundException('La imagen seleccionada no existe.');
    }
    return asset.url;
  }

  private toNode(c: CategoryWithCount): CategoryNode {
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      parentId: c.parentId,
      imageAssetId: c.imageAssetId,
      imageUrl: c.imageUrl,
      imageAlt: c.imageAlt,
      sortOrder: c.sortOrder,
      status: c.status,
      metaTitle: c.metaTitle,
      metaDescription: c.metaDescription,
      productCount: c._count.products,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      children: [],
    };
  }

  private async ensureExists(id: string): Promise<void> {
    const found = await this.prisma.category.findUnique({ where: { id }, select: { id: true } });
    if (!found) {
      throw new NotFoundException(`La categoría destino ${id} no existe`);
    }
  }

  private slugExists(slug: string, exceptId?: string): Promise<boolean> {
    return this.prisma.category
      .findFirst({
        where: { slug, ...(exceptId && { id: { not: exceptId } }) },
        select: { id: true },
      })
      .then((c) => c !== null);
  }

  private async assertSlugFree(slug: string, exceptId?: string): Promise<string> {
    if (await this.slugExists(slug, exceptId)) {
      const suggestion = await uniqueSlug(slug, (s) => this.slugExists(s, exceptId));
      throw new ConflictException(`Slug en uso. Sugerencia: ${suggestion}`);
    }
    return slug;
  }

  private async loadGraph(): Promise<{
    parentOf: Map<string, string | null>;
    childrenOf: Map<string, string[]>;
  }> {
    const all = await this.prisma.category.findMany({ select: { id: true, parentId: true } });
    const parentOf = new Map<string, string | null>();
    const childrenOf = new Map<string, string[]>();
    for (const c of all) {
      parentOf.set(c.id, c.parentId);
      if (c.parentId) {
        const siblings = childrenOf.get(c.parentId) ?? [];
        siblings.push(c.id);
        childrenOf.set(c.parentId, siblings);
      }
    }
    return { parentOf, childrenOf };
  }

  private depthOf(id: string, parentOf: Map<string, string | null>): number {
    let depth = 1;
    let current = parentOf.get(id) ?? null;
    let guard = 0;
    while (current && guard < MAX_DEPTH + 2) {
      depth += 1;
      current = parentOf.get(current) ?? null;
      guard += 1;
    }
    return depth;
  }

  private collectDescendants(id: string, childrenOf: Map<string, string[]>): Set<string> {
    const out = new Set<string>();
    const stack = [...(childrenOf.get(id) ?? [])];
    while (stack.length) {
      const node = stack.pop()!;
      if (!out.has(node)) {
        out.add(node);
        stack.push(...(childrenOf.get(node) ?? []));
      }
    }
    return out;
  }

  private subtreeHeight(id: string, childrenOf: Map<string, string[]>): number {
    const kids = childrenOf.get(id) ?? [];
    if (kids.length === 0) {
      return 1;
    }
    return 1 + Math.max(...kids.map((k) => this.subtreeHeight(k, childrenOf)));
  }

  private async validateParentChange(id: string, parentId: string | null): Promise<void> {
    if (parentId === null) {
      return; // pasa a raíz: siempre válido
    }
    if (parentId === id) {
      throw new BadRequestException('Una categoría no puede ser su propio padre');
    }
    const { parentOf, childrenOf } = await this.loadGraph();
    if (!parentOf.has(parentId)) {
      throw new NotFoundException('La categoría padre no existe');
    }
    if (this.collectDescendants(id, childrenOf).has(parentId)) {
      throw new BadRequestException(
        'No es posible asignar esta categoría como padre (crearía un ciclo)',
      );
    }
    if (this.depthOf(parentId, parentOf) + this.subtreeHeight(id, childrenOf) > MAX_DEPTH) {
      throw new BadRequestException(`El movimiento excede los ${MAX_DEPTH} niveles de profundidad`);
    }
  }
}
