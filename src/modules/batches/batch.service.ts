import Batch from "./batch.model.js";
import { AppError } from "../../shared/utils/AppError.js";

interface CreateBatchInput {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: "active" | "inactive";
}

export const createBatch = async (
  data: CreateBatchInput,
  instituteId: string
) => {
  try {
    const batch = await Batch.create({
      ...data,
      instituteId,
    });

    return batch;
  } catch (err: any) {
    if (err.code === 11000) {
      throw new AppError(
        "Batch already exists",
        400
      );
    }

    throw err;
  }
};

export const getBatchesByInstitute =
  async (instituteId: string) => {
    return await Batch.find({
      instituteId,
    }).sort({
      createdAt: -1,
    });
  };