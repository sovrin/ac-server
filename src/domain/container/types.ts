export type PortBinding = {
    containerPort: number;
    protocol: string;
    hostIp?: string;
    hostPort?: number;
};

export type ContainerSnapshot = {
    id: string;
    name: string;
    state: string;
    status: string;
    createdAt: number;
    startedAt?: string;
    finishedAt?: string;
    restartCount: number;
    labels: Record<string, string>;
    ports: PortBinding[];
    healthStatus?: string;
};
