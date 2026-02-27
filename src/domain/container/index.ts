import type { ContainerSnapshot } from '@domain/container/types';

export class Container {
    readonly id: string;
    private _data: ContainerSnapshot;

    constructor(data: ContainerSnapshot) {
        this.id = data.id;
        this._data = data;
    }

    get name(): string {
        return this._data.name;
    }

    update(data: ContainerSnapshot): void {
        if (data.id !== this.id) {
            throw new Error(
                `Container ID mismatch: expected "${this.id}", got "${data.id}"`,
            );
        }

        this._data = data;
    }

    toSnapshot(): ContainerSnapshot {
        return { ...this._data };
    }
}
