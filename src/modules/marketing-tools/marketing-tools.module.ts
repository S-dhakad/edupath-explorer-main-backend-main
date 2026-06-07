import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketingTool, MarketingToolSchema } from './marketing-tool.schema';
import { MarketingToolsService } from './marketing-tools.service';
import { MarketingToolsController } from './marketing-tools.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: MarketingTool.name, schema: MarketingToolSchema }])],
  providers: [MarketingToolsService],
  controllers: [MarketingToolsController],
  exports: [MarketingToolsService],
})
export class MarketingToolsModule {}
