import * as _ from 'lodash';
import { Iterators, KV } from 'fabric-shim';

export class Transform {

    public static serialize(value: any) {
        if (_.isDate(value) || _.isString(value)) {

            return Buffer.from(this.normalizePayload(value).toString());
        }

        return Buffer.from(JSON.stringify(this.normalizePayload(value)));
    };

    public static toObject(buffer: Buffer): object | undefined {
        if (buffer == null) {
            return;
        }

        const bufferString = buffer.toString();
        if (bufferString.length <= 0) {
            return;
        }

        return JSON.parse(bufferString);
    };

    public static bufferToDate(buffer: Buffer): Date | undefined {
        if (buffer == null) {

            return;
        }

        const bufferString = buffer.toString();
        if (bufferString.length <= 0) {

            return;
        }

        if (/\d+/g.test(bufferString)) {

            return new Date(parseInt(bufferString, 10));
        }

        return;
    };

    public static bufferToString(buffer: Buffer): string | undefined {
        if (buffer == null) {
            return null;
        }

        return buffer.toString();
    };

    /**
     * Transform iterator to array of objects
     *
     * @param {'fabric-shim'.Iterators.Iterator} iterator
     * @returns {Promise<Array>}
     */
    public static async iteratorToList(iterator: Iterators.Iterator) {
        const allResults = [];
        let res;
        while (res == null || !res.done) {
            res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                let parsedItem: any;

                try {
                    parsedItem = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    parsedItem = res.value.value.toString('utf8');
                }
                allResults.push(parsedItem);
            }
        }

        await iterator.close();

        return allResults;
    };

    /**
     * Transform iterator to array of objects
     *
     * @param {'fabric-shim'.Iterators.Iterator} iterator
     * @returns {Promise<Array>}
     */
    public static async iteratorToKVList(iterator: Iterators.Iterator): Promise<KV[]> {
        const allResults = [];
        let res;
        while (res == null || !res.done) {
            res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                let parsedItem: { key: string, value: any } = { key: '', value: {} };

                parsedItem.key = res.value.key;

                try {
                    parsedItem.value = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    parsedItem.value = res.value.value.toString('utf8');
                }
                allResults.push(parsedItem);
            }
        }

        await iterator.close();

        return allResults;
    };

    public static normalizePayload(value: any): any {

        if (_.isDate(value)) {
            return value.getTime();
        } else if (_.isString(value)) {
            return value;
        } else if (_.isArray(value)) {
            return _.map(value, (v: object) => {
                return this.normalizePayload(v);
            });
        } else if (_.isObject(value)) {
            return _.mapValues(value, (v: any) => {
                return this.normalizePayload(v);
            });
        }

        return value;
    };


}

