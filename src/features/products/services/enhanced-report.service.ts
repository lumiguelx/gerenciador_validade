/**
 * Enhanced Report Service - CORRIGIDO FINAL
 */
/**
 * Enhanced Report Service - CORRIGIDO FINAL
 */

import type { Product } from '@/shared/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getDaysUntilExpiry } from '@/shared/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProductWithPriority extends Product {
    daysRemaining: number;
    priority: 'critical' | 'warning' | 'ok';
    priorityLabel: string;
}

export class EnhancedReportService {
    static classifyProducts(products: Product[]): ProductWithPriority[] {
        return products.map(p => {
            const days = getDaysUntilExpiry(p.expiry_date);
            let priority: 'critical' | 'warning' | 'ok' = 'ok';
            let priorityLabel = '🟢 OK';

            if (days < 0) {
                priority = 'critical';
                priorityLabel = '🔴 VENCIDO';
            } else if (days <= 7) {
                priority = 'critical';
                priorityLabel = '🔴 CRÍTICO';
            } else if (days <= 15) {
                priority = 'warning';
                priorityLabel = '🟡 ATENÇÃO';
            }

            return { ...p, daysRemaining: days, priority, priorityLabel };
        });
    }

    static groupByPriority(products: ProductWithPriority[]) {
        return {
            critical: products.filter(p => p.priority === 'critical').sort((a, b) => a.daysRemaining - b.daysRemaining),
            warning: products.filter(p => p.priority === 'warning').sort((a, b) => a.daysRemaining - b.daysRemaining),
            ok: products.filter(p => p.priority === 'ok').sort((a, b) => a.daysRemaining - b.daysRemaining),
        };
    }

    static async exportEnhancedPDF(products: Product[]): Promise<void> {
        const doc = new jsPDF();
        const classified = this.classifyProducts(products);
        const grouped = this.groupByPriority(classified);
        let y = 15;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('RELATÓRIO DE VALIDADES - PRIORITÁRIO', 105, y, { align: 'center' });
        y += 5;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Emitido em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 105, y, { align: 'center' });
        y += 10;
        doc.line(15, y, 195, y);
        y += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('📊 RESUMO EXECUTIVO', 15, y);
        y += 7;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(248, 248, 248);
        doc.rect(15, y - 5, 180, 25, 'FD');
        doc.text(`Total de Produtos: ${products.length}`, 20, y);
        y += 6;
        doc.setTextColor(220, 38, 38);
        doc.text(`🔴 CRÍTICO (0-7 dias): ${grouped.critical.length}`, 20, y);
        doc.setTextColor(0, 0, 0);
        y += 6;
        doc.setTextColor(245, 158, 11);
        doc.text(`🟡 ATENÇÃO (8-15 dias): ${grouped.warning.length}`, 20, y);
        doc.setTextColor(0, 0, 0);
        y += 6;
        doc.setTextColor(34, 197, 94);
        doc.text(`🟢 OK (+15 dias): ${grouped.ok.length}`, 20, y);
        doc.setTextColor(0, 0, 0);
        y += 12;

        const addSection = (title: string, prods: ProductWithPriority[], withAction: boolean) => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 15, y);

            const headers = ['Cód.', 'Produto', 'Sessão', 'Val.', 'Dias', 'Qtd'];
            if (withAction) headers.push('Ação', 'Resp.');

            const data = prods.map(p => {
                const row = [
                    p.barcode || '—',
                    p.product_name,
                    p.product_brand,
                    format(new Date(p.expiry_date), 'dd/MM'),
                    p.daysRemaining < 0 ? 'X' : p.daysRemaining.toString(),
                    p.quantity.toString(),
                ];
                if (withAction) row.push('☐ ___', '___');
                return row;
            });

            autoTable(doc, {
                startY: y + 5,
                head: [headers],
                body: data,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak', cellWidth: 'wrap' },
                headStyles: { fillColor: withAction ? [220, 38, 38] : [100, 100, 100], textColor: 255, fontStyle: 'bold' },
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: withAction ? 55 : 75 },
                    2: { cellWidth: withAction ? 22 : 28 },
                    3: { cellWidth: 14 },
                    4: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
                    5: { cellWidth: 10, halign: 'center' },
                },
            });

            y = (doc as any).lastAutoTable.finalY + 15;
        };

        if (grouped.critical.length > 0) addSection('🔴 CRÍTICO - AÇÃO IMEDIATA', grouped.critical, true);
        if (grouped.warning.length > 0) {
            if (y > 240) { doc.addPage(); y = 20; }
            addSection('🟡 ATENÇÃO - MONITORAR', grouped.warning, false);
        }
        if (grouped.ok.length > 0) {
            if (y > 240) { doc.addPage(); y = 20; }
            addSection('🟢 OK - ESTOQUE NORMAL', grouped.ok, false);
        }

        if (y > 200) { doc.addPage(); y = 20; }
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('✍️ AÇÕES TOMADAS (preencher e devolver)', 15, y);
        y += 8;
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.rect(15, y, 180, 60);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        y += 6;
        doc.text('☐ Rebaixa aplicada', 20, y);
        doc.text('Data: ___/___/___', 80, y);
        y += 7;
        doc.text('☐ Produto retirado', 20, y);
        doc.text('Resp: _______________', 80, y);
        y += 7;
        doc.text('☐ Transferido filial', 20, y);
        doc.text('Local: _______________', 80, y);
        y += 7;
        doc.text('☐ Doação realizada', 20, y);
        y += 7;
        doc.text('☐ Descarte', 20, y);
        y += 10;
        doc.setFont('helvetica', 'italic');
        doc.text('Observações:', 20, y);
        y += 5;
        doc.line(20, y, 190, y);
        y += 5;
        doc.line(20, y, 190, y);
        y += 15;
        doc.line(15, y, 195, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.text('Conferido por: ____________________', 20, y);
        doc.text('Data: ___/___/___', 100, y);
        y += 8;
        doc.text('Supervisor: ____________________', 20, y);
        doc.text('Fiscal: ____________________', 110, y);

        doc.save(`relatorio-validades-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    }
}
