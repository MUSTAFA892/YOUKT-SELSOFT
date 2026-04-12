import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { HelpCenterService, HelpMessage } from './help-center.service';

@Controller('help-center')
export class HelpCenterController {
  constructor(private readonly helpCenterService: HelpCenterService) {}

  @Get('conversation/:candidateId/:interviewId')
  getConversation(
    @Param('candidateId') candidateId: string,
    @Param('interviewId') interviewId: string
  ) {
    return this.helpCenterService.getConversation(candidateId, interviewId);
  }

  @Post('message')
  async sendMessage(@Body() body: {
    candidateId: string;
    interviewId: string;
    message: Omit<HelpMessage, 'id' | 'timestamp'>
  }) {
    return this.helpCenterService.addMessage(body.candidateId, body.interviewId, body.message);
  }

  @Post('ai-assist')
  async getAiAssist(@Body() body: {
    query: string;
    questionContext: any;
    candidateId: string;
    interviewId: string;
    candidateName: string;
  }) {
    const aiResponse = await this.helpCenterService.getAiResponse(body.query, body.questionContext);
    
    // Save the user message
    await this.helpCenterService.addMessage(body.candidateId, body.interviewId, {
      senderId: body.candidateId,
      senderName: body.candidateName,
      senderType: 'candidate',
      content: body.query
    });

    if (aiResponse === 'TRANSFORM_TO_RECRUITER_MODE') {
      return { status: 'switching_to_recruiter' };
    }

    // Save the AI message
    const botMsg = await this.helpCenterService.addMessage(body.candidateId, body.interviewId, {
      senderId: 'ai_bot',
      senderName: 'AI Assistant',
      senderType: 'ai',
      content: aiResponse
    });

    return { status: 'success', data: botMsg };
  }

  @Get('all-conversations')
  getAllConversations() {
    return this.helpCenterService.getAllConversations();
  }
}
