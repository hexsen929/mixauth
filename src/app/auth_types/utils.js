import {AutoFetcher} from "@/app/utils/objects/AutoFetcher";
import config from "@/config";

export class QrFetcher extends AutoFetcher {
    constructor(func) {
        const {qrCache} = config
        const {size, interval, expire} = qrCache
        super(func, interval, size, expire);
    }
}