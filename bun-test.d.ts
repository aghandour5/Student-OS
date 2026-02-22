/**
 * Ambient type declarations for bun:test module.
 *
 * These are type-only stubs so TypeScript doesn't error on test files
 * that import from 'bun:test'. At runtime, Bun provides the real module.
 */
declare module "bun:test" {
    export function describe(name: string, fn: () => void): void;
    export function test(name: string, fn: () => void | Promise<void>): void;
    export function expect(value: any): any;
    interface MockFunction {
        (fn?: (...args: any[]) => any): any;
        module(path: string, factory: () => any): void;
    }
    export const mock: MockFunction;
    export function beforeEach(fn: () => void | Promise<void>): void;
    export function afterEach(fn: () => void | Promise<void>): void;
    export function beforeAll(fn: () => void | Promise<void>): void;
    export function afterAll(fn: () => void | Promise<void>): void;
}

