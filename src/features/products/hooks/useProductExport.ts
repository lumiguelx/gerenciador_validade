/**
 * useProductExport Hook - ATUALIZADO
 * Hook para exportação com relatório aprimorado
 */

import { useState } from 'react';
import { toast } from 'sonner';
import type { Product } from '@/shared/types';
import { ExportService } from '../services/export.service';
import { EnhancedReportService } from '../services/enhanced-report.service';

export function useProductExport() {
    const [exporting, setExporting] = useState(false);
    const [exportType, setExportType] = useState<'pdf' | 'csv' | 'enhanced' | null>(null);

    /**
     * Exporta para PDF APRIMORADO
     */
    const exportEnhancedPDF = async (products: Product[]) => {
        try {
            setExporting(true);
            setExportType('enhanced');
            await EnhancedReportService.exportEnhancedPDF(products);
            toast.success('Relatório aprimorado gerado com sucesso!');
        } catch (error) {
            console.error('Export Enhanced PDF error:', error);
            toast.error('Erro ao gerar relatório aprimorado');
        } finally {
            setExporting(false);
            setExportType(null);
        }
    };

    /**
     * Exporta para PDF (antigo)
     */
    const exportPDF = async (products: Product[]) => {
        try {
            setExporting(true);
            setExportType('pdf');
            await ExportService.exportPDF(products);
            toast.success('PDF gerado com sucesso!');
        } catch (error) {
            console.error('Export PDF error:', error);
            toast.error('Erro ao gerar PDF');
        } finally {
            setExporting(false);
            setExportType(null);
        }
    };

    /**
     * Exporta para CSV
     */
    const exportCSV = async (products: Product[]) => {
        try {
            setExporting(true);
            setExportType('csv');
            await ExportService.exportCSV(products);
            toast.success('CSV exportado com sucesso!');
        } catch (error) {
            console.error('Export CSV error:', error);
            toast.error('Erro ao exportar CSV');
        } finally {
            setExporting(false);
            setExportType(null);
        }
    };

    /**
     * Prepara para impressão
     */
    const print = (products: Product[]) => {
        try {
            ExportService.prepareForPrint(products);
        } catch (error) {
            console.error('Print error:', error);
            toast.error('Erro ao preparar impressão');
        }
    };

    return {
        exportPDF,
        exportEnhancedPDF, // NOVO!
        exportCSV,
        print,
        exporting,
        exportType,
        isExportingPDF: exporting && exportType === 'pdf',
        isExportingEnhanced: exporting && exportType === 'enhanced',
        isExportingCSV: exporting && exportType === 'csv',
    };
}
