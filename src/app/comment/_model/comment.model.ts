import {DefaultResponse} from '../../_model/app.model';

export interface CommentSearchTerm {
    module: string;
    periodFrom: any;
    periodTo: any;
    title: string;
}

export interface CommentSearchItem {
    id: string;
    module: string;
    thumbnail: string;
    title: string;
}

export interface CommentDetailTerm extends DefaultResponse {
    data: {
        id: string;
    };
    dataList: Array<{
        id: string;
    }>;
    descending: boolean;
    module: string;
    orderBy: [string];
}

export interface CommentDetailList extends DefaultResponse {
    data: {
        id: string;
        module: string;
        thumbnail: string;
        title: string;
    };
    dataList: Array<{
        id: string;
        module: string;
        thumbnail: string;
        title: string;
    }>;
}
