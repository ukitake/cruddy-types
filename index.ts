const SQL_OPS = ['*in_', '*eq', '*neq', '*contains', '*icontains'] as const;

  // request params
export type BaseAuthRequestParams = {
  auth_token?: string;
}

export type SortParam<TModel> = {
  key: keyof TModel;
  desc: boolean;
};

export interface BaseRequestParams<TModel> extends BaseAuthRequestParams {
  page: number;
  limit: number;
  columns?: Array<keyof TModel>;
  sort?: SortParam<TModel>[];
  where?: Where<TModel>;
}

// utils
type UnionKeys<K> = K extends K ? keyof K : never;
type Expand<K> = K extends K ? { [key in keyof K]: K[key] } : never;
type OneOf<K extends unknown[]> = {
  [key in keyof K]: Expand<K[key] & Partial<Record<Exclude<UnionKeys<K[number]>, keyof K[key]>, never>>>;
}[number];

type AndGrouping<TModel> = {
  '*and': (Clause<TModel> | LogicalGrouping<TModel>)[];
}

type OrGrouping<TModel> = {
  '*or': (Clause<TModel> | LogicalGrouping<TModel>)[];
}

type NotGrouping<TModel> = {
  '*not': Clause<TModel> | LogicalGrouping<TModel>;
}

export type LogicalGrouping<TModel> = OneOf<[AndGrouping<TModel>, OrGrouping<TModel>, NotGrouping<TModel>]>;

type Value = string | number | null;

type SqlOps = typeof SQL_OPS[number];

type SqlOp<S extends SqlOps> = {
  [key in Exclude<SqlOps, Exclude<SqlOps, S>>]: Value | Value[];
};

export type Logic = OneOf<[SqlOp<'*in_'>, SqlOp<'*eq'>, SqlOp<'*neq'>, SqlOp<'*contains'>, SqlOp<'*icontains'>]>;

export type Clause<TModel> = {
  [key in keyof TModel]: Record<key, Logic> & Partial<Record<Exclude<keyof TModel, key>, never>> extends 
  infer O ? Expand<O> : never
}[keyof TModel];

export type Where<TModel> = (LogicalGrouping<TModel> | Clause<TModel>);
