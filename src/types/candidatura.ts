// src/types/candidatura.ts

// Fuente indica de dónde viene la oferta.
// Esto es un "union type": solo permite estos valores exactos (evita typos).
export type Fuente = "LinkedIn" | "InfoJobs" | "Web empresa" | "Recruiter" | "Otra";

// Candidatura es el "modelo" principal de la app.
// Si en el futuro lo conectamos a .NET + DB, este tipo te guía para mantener consistencia.
export type Candidatura = {
  id: string; // Identificador único (por ahora en mock; luego vendrá de DB)

  empresa: string;
  puesto: string;

  // Guardamos fechas en formato ISO "YYYY-MM-DD".
  // Ventaja: fácil de ordenar y compatible con backend.
  fechaAplicacion: string;

  fuente: Fuente;

  // El enlace es opcional porque a veces la oferta se borra o no hay link.
  enlaceOferta?: string;

  // Requisitos y lo que ofrecían mejor en texto (la oferta real suele ser texto libre).
  requisitos: string;
  ofrecian: string;

  // Tecnologías: aquí combinamos tags (lista) + notas libres (texto).
  tecnologiasTags: string[];
  tecnologiasNotas?: string;

  // Salario: texto libre porque cada oferta lo expresa distinto.
  salario?: string;

  // Notas personales para ti (cómo fue la llamada, sensaciones, etc.)
  notas?: string;

  // Seguimiento: fechas opcionales porque no siempre hay contacto.
  ultimoContacto?: string;
  recordatorio?: string;
};
