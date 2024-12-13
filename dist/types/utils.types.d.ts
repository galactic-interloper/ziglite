export type PermitsEmptyArrays<T> = T | [];
export type NonEmptyArray<T> = [T, ...T[]];
export type BriefLocation = {
    host: string;
    pathname: string;
    search: string;
};
export type LocationAndQuery = {
    location: string;
    query: string;
};
