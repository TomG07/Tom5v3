export default interface PaginatorOptions<T> {
    data: Array<T>,
    perPage: number,
    page?: number
}