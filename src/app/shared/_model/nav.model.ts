import { DefaultResponse } from '../../_model/app.model';

export interface NavigationList extends DefaultResponse {
  dataList: Array<SingleNav | ParentNav>;
}

export interface SingleNav {
  id: string;
  name: string;
  functionId: string;
  functionName: string;
  accessType: string;
  order: number;
  functionEnabled: boolean;
  parentId: string;
}

export interface ParentNav {
  id: string;
  name: string;
  accessType: string;
  order: number;
  functionEnabled: boolean;
  children: SingleNav[];
}
