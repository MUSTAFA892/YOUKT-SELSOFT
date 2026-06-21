import { HydratedDocument } from 'mongoose';
export type PipelineDocument = HydratedDocument<Pipeline>;
export declare enum PipelineStage {
    APPLIED = "Applied",
    ASSESSED = "Assessed",
    INTERVIEWED = "Interviewed",
    OFFER = "Offer",
    REJECTED = "Rejected"
}
export declare class Pipeline {
    candidateId: string;
    candidateName: string;
    stage: PipelineStage;
    recruiterId: string;
}
export declare const PipelineSchema: import("mongoose").Schema<Pipeline, import("mongoose").Model<Pipeline, any, any, any, any, any, Pipeline>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Pipeline, import("mongoose").Document<unknown, {}, Pipeline, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Pipeline & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    candidateId?: import("mongoose").SchemaDefinitionProperty<string, Pipeline, import("mongoose").Document<unknown, {}, Pipeline, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Pipeline & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    candidateName?: import("mongoose").SchemaDefinitionProperty<string, Pipeline, import("mongoose").Document<unknown, {}, Pipeline, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Pipeline & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    stage?: import("mongoose").SchemaDefinitionProperty<PipelineStage, Pipeline, import("mongoose").Document<unknown, {}, Pipeline, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Pipeline & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    recruiterId?: import("mongoose").SchemaDefinitionProperty<string, Pipeline, import("mongoose").Document<unknown, {}, Pipeline, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Pipeline & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, Pipeline>;
