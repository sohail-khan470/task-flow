// src/modules/projects/project.repository.ts
import { prisma } from '#/config/database.js';
import { Prisma } from '#/generated/prisma/client.js';
import { AppError, NotFoundError } from '#/utils/error.js';

export class ProjectRepository {
  // async findAll({ skip, take }: { skip: number; take: number }) {
  //   const [data, total] = await Promise.all([
  //     prisma.project.findMany({
  //       skip,
  //       take,
  //       orderBy: { createdAt: 'desc' },
  //       include: {
  //         owner: {
  //           select: {
  //             id: true,
  //             name: true,
  //             email: true,
  //           },
  //         },
  //       },
  //     }),
  //     prisma.project.count(),
  //   ]);

  //   return { data, total };
  // }

  async findAll({ cursor, limit }: { cursor: Record<string, unknown> | null; limit: number }) {
    try {
      const items = await prisma.project.findMany({
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor.id as string } : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      const hasMore = items.length > limit;
      const data = hasMore ? items.slice(0, -1) : items;

      return { data, hasMore };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // ✅ Fixed: Pass message and statusCode
        throw new AppError('The pagination cursor is no longer valid.', 400);
      }
      throw error;
    }
  }

  async findById({ id }: { id: string }) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async create({
    name,
    description,
    ownerId,
  }: {
    name: string;
    description?: string;
    ownerId: string;
  }) {
    return prisma.project.create({
      data: {
        name,
        description,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update({ id, data }: { id: string; data: { name?: string; description?: string } }) {
    try {
      return await prisma.project.update({
        where: { id },
        data,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError(`Project with ID ${id} not found`);
      }
      throw error;
    }
  }

  async delete({ id }: { id: string }) {
    try {
      await prisma.project.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError(`Project with ID ${id} not found`);
      }
      throw error;
    }
  }
}
