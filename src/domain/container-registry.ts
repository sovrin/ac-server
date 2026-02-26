import type { ContainerSnapshot } from '@contracts/container';

import { Container } from '@domain/container';

export class ContainerRegistry {
    private containers = new Map<string, Container>();

    replaceAll(containers: ContainerSnapshot[]): void {
        this.containers.clear();

        for (const container of containers) {
            this.containers.set(container.id, new Container(container));
        }
    }

    applyEvent(event: string, container: ContainerSnapshot): void {
        if (event === 'destroy') {
            this.containers.delete(container.id);

            return;
        }

        const existing = this.containers.get(container.id);
        if (existing) {
            existing.update(container);
        } else {
            this.containers.set(container.id, new Container(container));
        }
    }

    getAll(): ContainerSnapshot[] {
        return Array.from(this.containers.values()).map((c) => c.toSnapshot());
    }

    get size(): number {
        return this.containers.size;
    }
}
