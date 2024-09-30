export interface ISonarCommonResponse {
    total: number;
    p: number;
    ps: number;

    paging: ISonarPaging;
}

interface ISonarPaging {
    pageIndex: number;
    pageSize: number;
    total: number;
}