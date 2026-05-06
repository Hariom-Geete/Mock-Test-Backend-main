import mongoose, {
    Schema,
    Document,
} from "mongoose";

export interface IInstitute
    extends Document {

    name: string;

    email: string;

    phone?: string;

    address?: string;

    logo?: string;

    ownerId: mongoose.Types.ObjectId;

    registrationNumber?: string;
}

const instituteSchema =
    new Schema<IInstitute>(
        {
            name: {
                type: String,
                required: true,
                trim: true,
            },

            email: {
                type: String,
                required: true,
                lowercase: true,
            },

            address: {
                type: String,
                default: "",
            },

            logo: {
                type: String,
                default: "",
            },

            ownerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            registrationNumber: {
                type: String,
                default: "",
                trim: true,
                required: false,
            },
        },

        {
            timestamps: true,
        }
    );

const Institute =
    mongoose.model<IInstitute>(
        "Institute",
        instituteSchema
    );

export default Institute;