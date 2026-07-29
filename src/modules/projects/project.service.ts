// src/modules/projects/project.service.ts
import { UserRepository } from '../users/user.repository.js';
import { ProjectRepository } from './project.repository.js';
import { logger } from '#/config/logger.js';
import { NotFoundError } from '#/utils/error.js';

export class ProjectService {
  private projectRepository: ProjectRepository;
  private userRepository: UserRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Get all projects with pagination
   */
  async getAllProjects({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit;

    const { data, total } = await this.projectRepository.findAll({
      skip,
      take: limit,
    });

    // Calculate if there are more items available
    const hasMore = skip + limit < total;

    return {
      data,
      meta: {
        total,
        hasMore, // ✅ Now matches ApiResponse meta interface
      },
    };
  }

  /**
   * Get a single project by ID
   */
  async getProjectById({ id }: { id: string }) {
    const project = await this.projectRepository.findById({ id });

    if (!project) {
      throw new NotFoundError(`Project with ID ${id} not found`);
    }

    return project;
  }

  /**
   * Create a new project
   */
  async createProject({
    name,
    description,
    ownerId,
  }: {
    name: string;
    description?: string;
    ownerId: string;
  }) {
    // Verify the owner exists
    const owner = await this.userRepository.findById(ownerId);

    if (!owner) {
      throw new NotFoundError(`Owner with ID ${ownerId} not found`);
    }

    // Create the project
    const project = await this.projectRepository.create({
      name,
      description,
      ownerId,
    });

    logger.info({ projectId: project.id, ownerId }, 'Project created successfully');

    return project;
  }

  /**
   * Update an existing project
   */
  async updateProject({ id, data }: { id: string; data: { name?: string; description?: string } }) {
    // Verify the project exists
    await this.getProjectById({ id });

    // If no data to update, return the existing project (short-circuit)
    if (!data.name && !data.description) {
      logger.debug({ projectId: id }, 'Update called with no data, returning existing project');
      return await this.getProjectById({ id });
    }

    // Update the project
    const updatedProject = await this.projectRepository.update({
      id,
      data,
    });

    logger.info({ projectId: id, updates: data }, 'Project updated successfully');

    return updatedProject;
  }

  /**
   * Delete a project
   */
  async deleteProject({ id }: { id: string }) {
    // Verify the project exists (will throw NotFoundError if it doesn't)
    await this.getProjectById({ id });

    // Note: If you need to warn about associated tasks,
    // you should add a method like `countTasksByProjectId` to your repository.

    // Delete the project
    await this.projectRepository.delete({ id });

    logger.info({ projectId: id }, 'Project deleted successfully');
  }
}
