import { Request, Response } from 'express';
import { DocumentStatus, DocumentType } from '@prisma/client';
import { z } from 'zod';
import * as documentService from '../services/document.service';

const uploadUrlSchema = z.object({
  type: z.nativeEnum(DocumentType),
});

const createDocumentSchema = z.object({
  type: z.nativeEnum(DocumentType),
  fileUrl: z.string().url(),
});

const listDocumentsQuerySchema = z.object({
  status: z.nativeEnum(DocumentStatus).optional(),
});

const rejectDocumentSchema = z.object({
  notes: z.string().min(5).max(500),
});

const overrideKycSchema = z.object({
  userId: z.string(),
  verified: z.boolean(),
});

export const requestUploadUrl = async (req: Request, res: Response) => {
  try {
    const parsed = uploadUrlSchema.parse(req.body);
    const { id: userId } = req.user as { id: string };
    const payload = await documentService.createUploadUrl(userId, parsed.type);
    return res.status(200).json(payload);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    return res.status(500).json({ message: 'Failed to create upload url', error: error.message });
  }
};

export const createDocument = async (req: Request, res: Response) => {
  try {
    const parsed = createDocumentSchema.parse(req.body);
    const { id: userId } = req.user as { id: string };
    const document = await documentService.createDocumentRecord(userId, parsed.type, parsed.fileUrl);
    return res.status(201).json({ message: 'Document submitted', document });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    return res.status(500).json({ message: 'Failed to submit document', error: error.message });
  }
};

export const listMyDocuments = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user as { id: string };
    const documents = await documentService.listUserDocuments(userId);
    return res.status(200).json({ documents });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to load documents', error: error.message });
  }
};

export const adminListDocuments = async (req: Request, res: Response) => {
  try {
    const parsed = listDocumentsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid parameters', errors: parsed.error.issues });
    }
    const documents = await documentService.listDocumentsByStatus(parsed.data.status);
    return res.status(200).json({ documents });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to load documents', error: error.message });
  }
};

export const adminApproveDocument = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user as { id: string };
    const { id: documentId } = req.params;
    const document = await documentService.approveDocument(documentId, userId);
    return res.status(200).json({ message: 'Document approved', document });
  } catch (error: any) {
    if (error.message === 'Document not found') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to approve document', error: error.message });
  }
};

export const adminRejectDocument = async (req: Request, res: Response) => {
  try {
    const parsed = rejectDocumentSchema.parse(req.body);
    const { id: userId } = req.user as { id: string };
    const { id: documentId } = req.params;
    const document = await documentService.rejectDocument(documentId, parsed.notes, userId);
    return res.status(200).json({ message: 'Document rejected', document });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    if (error.message === 'Document not found') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to reject document', error: error.message });
  }
};

export const adminOverrideKyc = async (req: Request, res: Response) => {
  try {
    const parsed = overrideKycSchema.parse(req.body);
    const contractor = await documentService.overrideKycStatus(parsed.userId, parsed.verified);
    return res.status(200).json({ message: 'KYC status updated', contractor });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    if (error.message === 'Contractor not found') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to update KYC', error: error.message });
  }
};
