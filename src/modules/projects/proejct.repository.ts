// src/modules/projects/project.repository.ts
import { prisma } from '#/config/database.js';
import { NotFoundError } from '#/utils/error.js';

export class ProjectRepository {
  async findAll({ skip, take }: { skip: number; take: number }) {
    const [data, total] = await Promise.all([
      prisma.project.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.project.count(),
    ]);

    return { data, total };
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
