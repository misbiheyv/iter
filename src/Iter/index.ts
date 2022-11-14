import type {

    Optional,
    Modes,
    Collection,

} from './interface';

import {

    intoAsyncIterator,
    intoIterator,
    isAsyncIterable,
    isSyncIterable,

} from '../helpers';

import {

    take,
    fromRange,
    mapSync,
    mapAsync,
    filterSync,
    filterAsync,
    flattenSync,
    flattenAsync,
    flatMapSync,
    flatMapAsync,
    forEachSync,
    forEachAsync,
    chunkedForEach

} from './modifiers';


import {

    toArray,
    collect,

} from './collectors';


import {

    sum,
    avg,
    max,
    min,

} from './aggregators';

export default class Iter<T> {

    protected mode: Modes;

    protected asyncIter: Optional<AsyncIterableIterator<T>>;

    protected iter: Optional<IterableIterator<T>>;

    public get isSync(): boolean {
        return this.mode === 'sync';
    }

    constructor(iterable: Iterable<T> | AsyncIterable<T>, mode?: Modes) {
        if (isAsyncIterable(iterable)) {
            this.mode = mode ?? 'async';
            this.asyncIter = intoAsyncIterator(iterable);
            return;
        }

        if (isSyncIterable(iterable)) {
            this.mode = mode ?? 'sync';
            this.iter = intoIterator(iterable);
            return;
        }

        throw new Error('Value is not iterable.')
    }

    public map<R>(
        cb: (el: T, index?: number, iter?: typeof this.iter | typeof this.asyncIter) => R,
    ): Iter<R> {
        return this.isSync
            ? mapSync(this.iter, cb)
            : mapAsync(this.asyncIter, cb);
    }

    public filter(
        cb: (el: T, index?: number, iter?: typeof this.iter | typeof this.asyncIter) => boolean,
    ): Iter<T> {
        return this.isSync
            ? filterSync(this.iter, cb)
            : filterAsync(this.asyncIter, cb);
    }

    public flatMap<R>(
        cb: (el: T, index?: number, iter?: typeof this.iter | typeof this.asyncIter) => R,
    ): Iter<R> {
        return this.isSync
            ? flatMapSync(this.iter, cb)
            : flatMapAsync(this.asyncIter, cb);
    }

    public forEach(
        cb: (el: T, index?: number, iter?: IterableIterator<T> | AsyncIterableIterator<T>) => void
    ): Promise<void> | void {
        return this.isSync
            ? forEachSync(this.iter, cb)
            : forEachAsync(this.asyncIter, cb);
    }

    public forEachChunked(
        cb: (el: T, index?: number, iter?: IterableIterator<T> | AsyncIterableIterator<T>) => void
    ): Promise<void> {
        return chunkedForEach(this.iter ?? this.asyncIter, cb);
    }

    public flatten<T>(depth: number): Iter<T> {
        return this.isSync
            ? flattenSync(this.iter, depth)
            : flattenAsync(this.asyncIter, depth);
    }

    public take(count: number): Iter<T> {
        return take(this.iter ?? this.asyncIter, count)
    }

    public fromRange(start: number, end?: number): Iter<T> {
        return fromRange(this.iter ?? this.asyncIter, start, end);
    }

    public toArray(): Promise<Array<T>> {
        return toArray(this.iter ?? this.asyncIter);
    }

    public collect(collection: Collection<T> | Array<T>): Promise<Array<T> | Collection<T>> {
        return collect(this.iter ?? this.asyncIter, collection);
    }

    public sum(fn?: (el: T) => number): Promise<number> {
        return sum(this.iter ?? this.asyncIter, fn);
    }

    public avg(fn?: (el: T) => number): Promise<number> {
        return avg(this.iter ?? this.asyncIter, fn);
    }

    public max(fn?: (el: T) => number): Promise<number> {
        return max(this.iter ?? this.asyncIter, fn);

    }

    public min(fn?: (el: T) => number): Promise<number> {
        return min(this.iter ?? this.asyncIter, fn);
    }


    [Symbol.iterator](): IterableIterator<T> {
        return this.values();
    }

    [Symbol.asyncIterator](): AsyncIterableIterator<T> {
        return this.asyncValues();
    }

    values() {
        if (!this.isSync)
            throw  new Error('Sync iterator is not defined.');

        return intoIterator(this.iter);
    }

    asyncValues(): AsyncIterableIterator<T> {
        if (this.isSync)
            throw  new Error('Async iterator is not defined.');

        return intoAsyncIterator(this.asyncIter);
    }

}