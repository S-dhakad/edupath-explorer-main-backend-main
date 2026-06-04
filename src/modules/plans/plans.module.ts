import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { Plan, PlanSchema } from './plan.schema';
import { Course, CourseSchema } from '../courses/course.schema';
import { LandingPricing, LandingPricingSchema } from '../public/schemas/landing-pricing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Plan.name, schema: PlanSchema },
      { name: Course.name, schema: CourseSchema },
      { name: LandingPricing.name, schema: LandingPricingSchema },
    ]),
  ],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}