import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WatchingService } from './watching.service';
import { WatchingController } from './watching.controller';
import { Watching, WatchingSchema } from './watching.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Watching.name, schema: WatchingSchema }])],
  controllers: [WatchingController],
  providers: [WatchingService],
  exports: [WatchingService],
})
export class WatchingModule {}