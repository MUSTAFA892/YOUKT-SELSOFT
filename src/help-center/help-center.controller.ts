import { Controller, Get, Post, Body, Param } from '@nestjs/common';
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
    message: Omit<HelpMessage, 'id' | 'timestamp'>;
  }) {
    return this.helpCenterService.addMessage(
      body.candidateId,
      body.interviewId,
      body.message
    );
  }

  // 🦙 AI endpoint — powered by local Ollama (llama3)
  @Post('ai-assist')
  async getAiAssist(@Body() body: {
    query: string;
    questionContext?: any;   // Full question object from the frontend
    questionId?: string;
    candidateId: string;
    interviewId: string;
    candidateName: string;
  }) {
    // Get AI response from Ollama, passing name + full question context
    const aiResponse = await this.helpCenterService.getAiResponse(
      body.query,
      body.candidateName,
      body.questionContext,
    );

    // Save user message to conversation history
    await this.helpCenterService.addMessage(body.candidateId, body.interviewId, {
      senderId: body.candidateId,
      senderName: body.candidateName,
      senderType: 'candidate',
      content: body.query,
    });

    // Save AI response to conversation history
    const botMsg = await this.helpCenterService.addMessage(
      body.candidateId,
      body.interviewId,
      {
        senderId: 'ollama_ai',
        senderName: 'YOUKT AI (Llama3)',
        senderType: 'ai',
        content: aiResponse,
      }
    );

    return { status: 'success', data: botMsg };
  }

  @Get('all-conversations')
  getAllConversations() {
    return this.helpCenterService.getAllConversations();
  }

  @Post('ping')
  async ping(@Body() body: { candidateId: string }) {
    await this.helpCenterService.pingCandidate(body.candidateId);
    return { success: true };
  }

  @Get('active-candidates')
  getActiveCandidates() {
    return this.helpCenterService.getActiveCandidateIds();
  }
}