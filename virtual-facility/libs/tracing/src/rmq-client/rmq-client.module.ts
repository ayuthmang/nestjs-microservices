import { Module } from '@nestjs/common';
import { RmqClientProxy } from './rmq-client.proxy';
import { RMQ_BROKER } from './constants';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: RMQ_BROKER,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
        },
      },
    ]),
  ],
  providers: [],
  exports: [RmqClientProxy],
})
export class RmqClientModule {}
