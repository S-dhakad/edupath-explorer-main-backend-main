import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactPage, ContactPageSchema } from './contact-page.schema';
import { ContactInquiry, ContactInquirySchema } from './contact-inquiry.schema';
import { ContactPageService } from './contact-page.service';
import { ContactPageController } from './contact-page.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactPage.name, schema: ContactPageSchema },
      { name: ContactInquiry.name, schema: ContactInquirySchema },
    ]),
  ],
  providers: [ContactPageService],
  controllers: [ContactPageController],
  exports: [ContactPageService],
})
export class ContactPageModule {}
