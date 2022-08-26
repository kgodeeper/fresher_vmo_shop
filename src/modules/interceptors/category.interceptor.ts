import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class CategoryInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((item) => {
        if (item.categories) {
          item.categories = item.categories.reduce((hideActives, category) => {
            delete category.status;
            hideActives.push(category);
            return hideActives;
          }, []);
        }
        return item;
      }),
    );
  }
}
