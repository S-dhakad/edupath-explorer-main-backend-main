import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Training, TrainingSchema } from './training.schema';
import { TrainingsService } from './trainings.service';
import { TrainingsController } from './trainings.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Training.name, schema: TrainingSchema }])],
  providers: [TrainingsService],
  controllers: [TrainingsController],
  exports: [TrainingsService],
})
export class TrainingsModule {}
