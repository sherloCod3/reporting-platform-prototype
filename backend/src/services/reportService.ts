import { ReportRepository } from '../repositories/ReportRepository.js';
import type {
  CreateReportDto,
  UpdateReportDto
} from '../validators/report.schema.js';

export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async createReport(data: CreateReportDto) {
    return this.reportRepository.create(data);
  }

  async getReportById(id: number) {
    const report = await this.reportRepository.findById(id);
    if (!report) {
      throw new Error(`Report with ID ${id} not found`);
    }
    return report;
  }

  async updateReport(id: number, data: UpdateReportDto) {
    const report = await this.reportRepository.update(id, data);
    if (!report) {
      throw new Error(`Report with ID ${id} not found`);
    }
    return report;
  }
}
