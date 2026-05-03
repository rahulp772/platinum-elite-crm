import { Property } from "./property";

export interface Builder {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    website?: string;
    foundedYear?: number;
    headquarters?: string;
    totalProjects: number;
    completedProjects: number;
    ongoingProjects: number;
    properties?: Property[];
    tenantId: string;
    createdAt: string;
    updatedAt: string;
}
