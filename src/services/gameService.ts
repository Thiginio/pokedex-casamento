export interface QuizQuestion {
  id: number;
  missionId?: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const WEDDING_CHALLENGES: Record<string, QuizQuestion[]> = {
  // Desafio para Flabébé: A Flor Especial
  flabebe_flor_especial: [
    {
      id: 1,
      missionId: 'flabebe_flor_especial',
      question: 'Qual é a cor predominante das flores principais na decoração do casamento de João & Mirella?',
      options: ['Branco & Rosa', 'Azul Marinho', 'Preto & Cinza', 'Roxo Escuro'],
      correctIndex: 0,
    },
    {
      id: 2,
      missionId: 'flabebe_flor_especial',
      question: 'Flabébé segura qual elemento da natureza que simboliza o casamento?',
      options: ['Uma Pedra', 'Uma Flor Pequena', 'Um Ramo de Oliveira', 'Uma Espada'],
      correctIndex: 1,
    },
  ],

  // Desafio para Bulbasaur: A Semente do Amor
  bulbasaur_semente_amor: [
    {
      id: 1,
      missionId: 'bulbasaur_semente_amor',
      question: 'Qual valor que os noivos João & Mirella sempre cultivaram desde o início do namoro?',
      options: ['Aventura & Companheirismo', 'Competição Desenfreada', 'Silêncio Absoluto', 'Distância'],
      correctIndex: 0,
    },
    {
      id: 2,
      missionId: 'bulbasaur_semente_amor',
      question: 'Qual é o Pokémon nº 001 que representa o início da jornada do casal?',
      options: ['Charmander', 'Squirtle', 'Bulbasaur', 'Pikachu'],
      correctIndex: 2,
    },
  ],
};

// Fallback geral
export const WHO_IS_THAT_POKEMON_CHALLENGES: QuizQuestion[] = [
  {
    id: 1,
    question: 'Qual é o Pokémon inicial nº 001 que planta as sementes do amor?',
    options: ['Bulbasaur', 'Roselia', 'Sunflora', 'Bellossom'],
    correctIndex: 0,
  },
  {
    id: 2,
    question: 'Qual Pokémon fada é adorado por Mirella e traz a bênção da Lua?',
    options: ['Clefable', 'Florges', 'Cherrim', 'Lilligant'],
    correctIndex: 0,
  },
];

export const COUPLE_QUIZ_CHALLENGES: QuizQuestion[] = [
  {
    id: 1,
    question: 'Qual é a maior paixão em comum de João e Mirella?',
    options: ['Pokémon e Aventuras', 'Fórmula 1', 'Futebol', 'Pescaria'],
    correctIndex: 0,
  },
  {
    id: 2,
    question: 'Qual flor representa a alegria de João & Mirella nesta celebração?',
    options: ['Sunflora', 'Gloom', 'Koffing', 'Weezing'],
    correctIndex: 0,
  },
];

/**
 * Valida a pontuação de um minijogo
 */
export function validateMinigameResult(
  score: number,
  targetScore: number
): { passed: boolean; message: string } {
  const passed = score >= targetScore;
  return {
    passed,
    message: passed
      ? `Parabéns! Você alcançou ${score}/${targetScore} pontos e concluiu o desafio com perfeição!`
      : `Você fez ${score}/${targetScore} pontos. Tente novamente para alcançar a pontuação mínima!`,
  };
}
