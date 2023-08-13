import { apiService } from "@/constants";

export async function fetchWithUserId(path: string, options?: RequestInit): Promise<Response> {
    const userId = localStorage.getItem("userid");
    if (!userId) throw new Error("no userId");

    const headers = {
        ...options?.headers,
        "user-id": userId,
    };

    const updatedOptions: RequestInit = {
        ...options,
        headers,
    };

    return await fetch(apiService + path, updatedOptions);
}
