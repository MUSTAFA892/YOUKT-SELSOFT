import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PipelineDocument = HydratedDocument<Pipeline>;

export enum PipelineStage {
  APPLIED = 'Applied',
  ASSESSED = 'Assessed',
  INTERVIEWED = 'Interviewed',
  OFFER = 'Offer',
  REJECTED = 'Rejected',
}

@Schema({ timestamps: true })
export class Pipeline {
  @Prop({ required: true, unique: true, index: true })
  candidateId: string;

  @Prop({ required: true })
  candidateName: string;

  @Prop({
    type: String,
    enum: Object.values(PipelineStage),
    default: PipelineStage.APPLIED,
  })
  stage: PipelineStage;

  @Prop()
  recruiterId: string;
}

export const PipelineSchema = SchemaFactory.createForClass(Pipeline);
