export interface IJwtPayload {
    id: number;
    /**
     *  tokn expiration time in time stamp
     */
    exp: number;
    /**
     * issued at ( time at which token was issued) in timestamp
     */
    iat: number;
}
