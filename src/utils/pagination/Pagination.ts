import { Pageable } from "./Pageable";

export class Pagination<T> extends Pageable {
  [x: string]: unknown;
  
  data: T[];

  totalCount: number = 0;

  constructor({ data, totalCount, pageable }: Partial<Pagination<T>> & { pageable: Pageable }) {
    super(pageable);
    data && (this.data = data);
    totalCount && (this.totalCount = totalCount);
  }
}
