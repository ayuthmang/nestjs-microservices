import { Module } from '@nestjs/common';
import { NotificationsServiceController } from './notifications-service.controller';
import { TracingModule } from '@app/tracing';

@Module({
  imports: [TracingModule],
  controllers: [NotificationsServiceController],
  providers: [],
})
export class NotificationsServiceModule {}
