import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto, UpdateTeamDto } from './dto/create-team.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createTeamDto: CreateTeamDto, currentUser: User) {
    const { teamLeadId, memberIds, ...teamData } = createTeamDto;

    const team = this.teamRepository.create({
      ...teamData,
      tenantId: currentUser.tenantId,
    });

    if (teamLeadId) {
      const teamLead = await this.userRepository.findOne({
        where: { id: teamLeadId, tenantId: currentUser.tenantId },
      });
      if (!teamLead) {
        throw new NotFoundException(`User with ID ${teamLeadId} not found in your tenant`);
      }
      team.teamLead = teamLead;
    }

    const savedTeam = await this.teamRepository.save(team);

    if (memberIds && memberIds.length > 0) {
      const members = await this.userRepository.findBy({ 
        id: In(memberIds),
        tenantId: currentUser.tenantId 
      });
      savedTeam.members = members;
      await this.teamRepository.save(savedTeam);
    }

    return savedTeam;
  }

  async findAll(user: User) {
    const isGlobalAdmin = user.isSuperAdmin && !user.tenantId;

    if (isGlobalAdmin) {
      return this.teamRepository.find({
        relations: ['teamLead', 'members'],
      });
    }

    const currentLevel = user.role?.level || 0;
    const effectiveTenantId = user.tenantId;

    // Admins see all teams in their tenant
    if (currentLevel >= 100) {
      return this.teamRepository.find({
        where: { tenantId: effectiveTenantId },
        relations: ['teamLead', 'members'],
      });
    }

    // Others see only teams they are part of or lead
    return this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.teamLead', 'teamLead')
      .leftJoinAndSelect('team.members', 'members')
      .where('team.tenantId = :tenantId', { tenantId: effectiveTenantId })
      .andWhere('(team.teamLeadId = :userId OR members.id = :userId)', {
        userId: user.id,
      })
      .getMany();
  }

  async findOne(id: string, user: User) {
    const isGlobalAdmin = user.isSuperAdmin && !user.tenantId;
    const where = isGlobalAdmin ? { id } : { id, tenantId: user.tenantId };
    const team = await this.teamRepository.findOne({
      where,
      relations: ['teamLead', 'members'],
    });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto, user: User) {
    const team = await this.findOne(id, user);
    const { teamLeadId, memberIds, ...teamData } = updateTeamDto;

    if (teamLeadId) {
      const teamLead = await this.userRepository.findOne({
        where: { id: teamLeadId, tenantId: user.tenantId },
      });
      if (!teamLead) {
        throw new NotFoundException(`User with ID ${teamLeadId} not found in your tenant`);
      }
      team.teamLead = teamLead;
    }

    if (memberIds) {
      const members = await this.userRepository.findBy({ 
        id: In(memberIds),
        tenantId: user.tenantId
      });
      team.members = members;
    }

    Object.assign(team, teamData);
    return this.teamRepository.save(team);
  }

  async remove(id: string, user: User) {
    const team = await this.findOne(id, user);
    await this.teamRepository.remove(team);
    return { message: 'Team deleted successfully' };
  }

  async getTeamMembers(teamId: string, user: User) {
    const team = await this.findOne(teamId, user);
    return team.members;
  }

  async getUserTeam(userId: string, currentUser: User) {
    const where = currentUser.isSuperAdmin ? {} : { tenantId: currentUser.tenantId };
    return this.teamRepository.findOne({
      where: {
        ...where,
        members: { id: userId },
      },
      relations: ['teamLead', 'members'],
    });
  }

  async getTeamLeadMembers(user: User) {
    const where = user.isSuperAdmin ? {} : { tenantId: user.tenantId };
    const teams = await this.teamRepository.find({
      where: {
        ...where,
        teamLeadId: user.id,
      },
      relations: ['members'],
    });

    const memberIds = new Set<string>();
    teams.forEach(team => {
      team.members.forEach(member => memberIds.add(member.id));
    });

    return Array.from(memberIds);
  }
}