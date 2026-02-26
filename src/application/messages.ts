import type { ContainerSnapshot } from '@contracts/container';

export type AgentUpdateMessage =
    | {
          type: 'container_event';
          event: string;
          container: ContainerSnapshot;
          timestamp: number;
      }
    | {
          type: 'full_state';
          containers: ContainerSnapshot[];
          timestamp: number;
      };

export type ClientUpdateMessage =
    | {
          type: 'container_event';
          agentId: string;
          event: string;
          container: ContainerSnapshot;
          timestamp: number;
      }
    | {
          type: 'full_state';
          agentId: string;
          containers: ContainerSnapshot[];
          timestamp: number;
      };
