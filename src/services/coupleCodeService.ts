/**
 * Serviço de Validação de Códigos dos Noivos (João, Mirella e Casal)
 */

export interface CodeValidationResult {
  valid: boolean;
  message: string;
  coupleName?: string;
}

// Códigos secretos distribuídos presencialmente pelos noivos durante o casamento
export const COUPLE_SECRET_CODES: Record<
  string,
  { missionId: string; couple: string; description: string }
> = {
  // Missão da Floette: Guardião do Buquê
  'BUQUE-FLORES-2026': {
    missionId: 'floette_guardiao_buque',
    couple: 'Mirella',
    description: 'Descobriu onde o buquê está sendo guardado!',
  },
  'BUQUE-MAGICO': {
    missionId: 'floette_guardiao_buque',
    couple: 'Mirella',
    description: 'Encontrou o guardião oficial do buquê.',
  },
  'GUARDIAO-BUQUE': {
    missionId: 'floette_guardiao_buque',
    couple: 'Mirella',
    description: 'Código secreto do buquê dos noivos.',
  },
  'BUQUE-2026': {
    missionId: 'floette_guardiao_buque',
    couple: 'Mirella',
    description: 'Código de celebração do Buquê.',
  },

  // Missão do Electabuzz: Choque na Pista (Especial de Dança)
  'PISTA-ELETRICA': {
    missionId: 'electabuzz_choque_pista',
    couple: 'João',
    description: 'Dançou com o noivo e incendiou a pista de dança!',
  },
  'JOAO-DANCA-SHOW': {
    missionId: 'electabuzz_choque_pista',
    couple: 'João',
    description: 'Performance de dança eletrizante na pista!',
  },
  'ELECTA-2026': {
    missionId: 'electabuzz_choque_pista',
    couple: 'João',
    description: 'Código elétrico do noivo para a pista.',
  },
  'CHOQUE-NA-PISTA': {
    missionId: 'electabuzz_choque_pista',
    couple: 'João',
    description: 'Validação oficial da dança com o noivo.',
  },

  // Missão do Ho-Oh: Lenda da União (Missão Secreta)
  'UNIAO-ETERNA-2026': {
    missionId: 'ho_oh_lenda_uniao',
    couple: 'João & Mirella',
    description: 'Decifrou a mensagem mágica da união de João & Mirella!',
  },
  'HO-OH-LENDARIO': {
    missionId: 'ho_oh_lenda_uniao',
    couple: 'João & Mirella',
    description: 'A bênção lendária dos noivos.',
  },
  'CASAL-JOAO-MIRELLA': {
    missionId: 'ho_oh_lenda_uniao',
    couple: 'João & Mirella',
    description: 'O amor eterno de João & Mirella selado.',
  },
  'LENDA-2026': {
    missionId: 'ho_oh_lenda_uniao',
    couple: 'João & Mirella',
    description: 'Código de ouro dos Noivos.',
  },
};

/**
 * Valida o código digitado para a missão específica
 */
export function validateCoupleMissionCode(
  missionId: string,
  rawCode: string
): CodeValidationResult {
  if (!rawCode || !rawCode.trim()) {
    return { valid: false, message: 'Digite o código fornecido pelos noivos ou organização.' };
  }

  const cleanCode = rawCode.trim().toUpperCase().replace(/\s+/g, '-');
  const codeEntry = COUPLE_SECRET_CODES[cleanCode];

  if (!codeEntry) {
    return {
      valid: false,
      message: 'Código incorreto ou inválido. Peça o código correto ao noivo, noiva ou organização!',
    };
  }

  if (codeEntry.missionId !== missionId) {
    return {
      valid: false,
      message: `Este código pertence a outra missão especial (${codeEntry.couple}). Verifique as instruções!`,
    };
  }

  return {
    valid: true,
    message: `Código validado com sucesso por ${codeEntry.couple}!`,
    coupleName: codeEntry.couple,
  };
}
