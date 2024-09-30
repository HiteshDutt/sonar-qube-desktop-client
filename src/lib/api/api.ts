import axios from "axios";
import { injectable } from "tsyringe";

@injectable()
export class Api {
    constructor() {
    }

    async get<T>(url: string, params?: any, headers?: any) : Promise<T> {
        const response = await axios.get<T>(url, { params: params, headers: headers});
        return response.data;
    }

    async post<T>(url: string, data?: any, headers?: any) : Promise<T> {
        const response = await axios.post<T>(url, data, { headers: headers});
        return response.data;
    }
}