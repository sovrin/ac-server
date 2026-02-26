import type { AgentUpdateMessage, ClientUpdateMessage } from '@app/messages';

import { publishClientUpdate } from '@app/client-updates';
import { ContainerRegistry } from '@domain/container-registry';

export class ContainerService {
    private registries = new Map<string, ContainerRegistry>();

    handleAgentMessage(agentId: string, message: AgentUpdateMessage): void {
        const registry = this.getOrCreateRegistry(agentId);

        switch (message.type) {
            case 'full_state': {
                registry.replaceAll(message.containers);

                const outbound: ClientUpdateMessage = {
                    agentId,
                    containers: registry.getAll(),
                    timestamp: message.timestamp,
                    type: 'full_state',
                };

                console.log(
                    `[service] Agent "${agentId} full state: ${registry.size} containers"`,
                );

                publishClientUpdate(outbound);

                break;
            }

            case 'container_event': {
                registry.applyEvent(message.event, message.container);

                const outbound: ClientUpdateMessage = {
                    agentId,
                    container: message.container,
                    event: message.event,
                    timestamp: message.timestamp,
                    type: 'container_event',
                };

                console.log(
                    `[service] Agent "${agentId}" event: ${message.event} -> ${message.container.name}`,
                );

                publishClientUpdate(outbound);

                break;
            }
        }
    }

    getFullStateForAllAgents(): ClientUpdateMessage[] {
        const messages: ClientUpdateMessage[] = [];

        for (const [agentId, registry] of this.registries) {
            messages.push({
                agentId,
                containers: registry.getAll(),
                timestamp: Date.now(),
                type: 'full_state',
            });
        }

        return messages;
    }

    removeAgent(agentId: string): void {
        this.registries.delete(agentId);
        console.log(`[service] Agent "${agentId}" removed.`);
    }

    private getOrCreateRegistry(agentId: string): ContainerRegistry {
        let registry = this.registries.get(agentId);
        if (!registry) {
            registry = new ContainerRegistry();

            this.registries.set(agentId, registry);
        }

        return registry;
    }
}
