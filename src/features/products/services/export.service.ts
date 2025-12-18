/**
 * Export Service - CORRIGIDO FINAL
 */

import type { Product } from '@/shared/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getDaysUntilExpiry, groupProductsBySession } from '@/shared/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export class ExportService {
    static async exportCSV(products: Product[]): Promise<void> {
        const headers = ['Sessão', 'Produto', 'Código de Barras', 'Validade', 'Dias Restantes', 'Quantidade', 'Status'];
        const rows = products.map(p => [
            p.product_brand,
            p.product_name,
            p.barcode || '-',
            format(new Date(p.expiry_date), 'dd/MM/yyyy'),
            getDaysUntilExpiry(p.expiry_date).toString(),
            p.quantity.toString(),
            this.getStatusLabel(p.status)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `validades-${format(new Date(), 'dd-MM-yyyy')}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    static async exportPDF(products: Product[]): Promise<void> {
        const doc = new jsPDF();
        const grouped = groupProductsBySession(products);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Controle de Validades', 14, 12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR }), 196, 12, { align: 'right' });
        doc.line(14, 14, 196, 14);

        let y = 22;

        Object.entries(grouped).forEach(([session, sessionProducts]) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(session.toUpperCase(), 14, y);
            y += 5;

            const tableData = sessionProducts.map(p => {
                const days = getDaysUntilExpiry(p.expiry_date);
                return [
                    p.barcode || '—',
                    p.product_name,
                    format(new Date(p.expiry_date), 'dd/MM'),
                    days < 0 ? 'X' : days.toString(),
                    p.quantity.toString(),
                    '______',
                    '______',
                    '______'
                ];
            });

            autoTable(doc, {
                startY: y,
                head: [['Cód.', 'Produto', 'Val.', 'Dias', 'Qtd', 'Preço', 'Ação', 'Resp.']],
                body: tableData,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak', cellWidth: 'wrap' },
                headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 7 },
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 60 },
                    2: { cellWidth: 16 },
                    3: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
                    4: { cellWidth: 12, halign: 'center' },
                    5: { cellWidth: 18 },
                    6: { cellWidth: 18 },
                    7: { cellWidth: 18 },
                }
            });

            y = (doc as any).lastAutoTable.finalY + 5;
        });

        if (y > 260) {
            doc.addPage();
            y = 20;
        }

        y += 5;
        doc.line(14, y, 196, y);
        y += 5;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total: ${products.length} produtos`, 14, y);
        doc.text('Fiscal: ____________', 70, y);
        doc.text('Supervisor: ____________', 120, y);
        doc.text('___/___/___', 175, y);

        doc.save(`validades-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    }

    private static getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            normal: 'Normal',
            primeira_rebaixa: 'Rebaixa 1',
            segunda_rebaixa: 'Rebaixa 2'
        };
        return labels[status] || status;
    }

    static prepareForPrint(products: Product[]): void {
        window.print();
    }
}
