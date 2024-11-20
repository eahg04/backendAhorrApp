
export interface authResponse {

    id: string;
    email: string;
    isActive: boolean;
    roles?: string[];
    token?: string;

}