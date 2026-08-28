import type { Certificate } from '@/lib/types';

export const certificatesFixture: Certificate[] = [
  {
    id: 'c-accueil',
    fileName: 'certificat-accueil-securite.pdf',
    trainingId: 't-accueil',
    trainingName: 'Accueil sécurité site',
    uploadedAt: '2026-05-02',
    status: 'approved',
    validUntil: '2029-05-02',
  },
  {
    id: 'c-cyber-2026-08-12',
    fileName: 'scan-certif.jpg',
    trainingId: 't-cyber',
    trainingName: 'Cybersécurité au poste de travail',
    uploadedAt: '2026-08-12',
    status: 'invalidated',
    rejectionReason: 'document illisible',
  },
];
