import { Injectable, Scope, Inject } from '@nestjs/common';
import {
  ClientProxy,
  CONTEXT,
  RequestContext,
  RmqRecord,
  RmqRecordBuilder,
  type RmqContext,
} from '@nestjs/microservices';
import { RMQ_BROKER } from './constants';
import { Observable } from 'rxjs';

@Injectable({ scope: Scope.REQUEST })
export class RmqClientProxy {
  constructor(
    @Inject(RMQ_BROKER) private readonly client: ClientProxy,
    @Inject(CONTEXT) private readonly ctx: RequestContext<unknown, RmqContext>,
  ) {}

  send<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
  ): Observable<TResult> {
    return this.client.send(pattern, this.setTraceId(data));
  }

  emit<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
  ): Observable<TResult> {
    return this.client.emit(pattern, this.setTraceId(data));
  }

  private setTraceId(dataOrRecord: any) {
    const headers = dataOrRecord?.headers ?? {};
    headers['traceId'] = this.ctx.getContext().getHeaders().get('traceId');

    if (dataOrRecord instanceof RmqRecord) {
      return new RmqRecordBuilder(dataOrRecord.data)
        .setOptions({ headers: headers })
        .build();
    }
    return new RmqRecordBuilder()
      .setData(dataOrRecord)
      .setOptions({ headers: headers })
      .build();
  }
}
