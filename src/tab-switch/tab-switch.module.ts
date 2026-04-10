import { Module } from '@nestjs/common';
import { TabSwitchService } from './tab-switch.service';
import { TabSwitchController } from './tab-switch.controller';

@Module({
  controllers: [TabSwitchController],
  providers: [TabSwitchService],
  exports: [TabSwitchService],
})
export class TabSwitchModule {}
