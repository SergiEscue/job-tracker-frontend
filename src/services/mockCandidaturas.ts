// src/services/mockCandidaturas.ts

import type { Candidatura } from "../types/candidatura";

// "mockCandidaturas" es un array con datos de ejemplo.
// Lo ponemos en /services porque más adelante este archivo podría convertirse en:
// - llamadas a API (fetch/axios)
// - o un servicio que usa localStorage
export const mockCandidaturas: Candidatura[] = [
  {
    id: "1",
    empresa: "TechNova",
    puesto: "Desarrollador Junior Full Stack",
    fechaAplicacion: "2026-02-01",
    fuente: "LinkedIn",
    enlaceOferta: "https://example.com/oferta-1",

    requisitos: "- React + TypeScript\n- API REST\n- SQL\n- Buenas prácticas y Git",
    ofrecian: "- Híbrido 3/2\n- Formación\n- Jornada intensiva en verano",

    tecnologiasTags: ["React", "TypeScript", ".NET", "SQL"],
    tecnologiasNotas: "Mencionaban Azure como plus.",

    salario: "25k–30k bruto/año (según valía)",
    notas: "Me guardo la oferta por si desaparece. No han respondido.",

    ultimoContacto: "2026-02-01",
    recordatorio: "2026-02-08",
  },
];
