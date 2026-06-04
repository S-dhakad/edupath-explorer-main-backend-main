import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LandingHero, LandingHeroSchema } from './schemas/landing-hero.schema';
import { LandingPricing, LandingPricingSchema } from './schemas/landing-pricing.schema';
import { Course, CourseSchema } from '../courses/course.schema';
import { Category, CategorySchema } from '../categories/category.schema';
import { PublicService } from './public.service';
import { PublicController, LandingAdminController } from './public.controller';
import { AuthModule } from '../auth/auth.module';
import { PlansModule } from '../plans/plans.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LandingHero.name, schema: LandingHeroSchema },
      { name: LandingPricing.name, schema: LandingPricingSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    AuthModule,
    PlansModule,
    UsersModule,
  ],
  controllers: [PublicController, LandingAdminController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}
