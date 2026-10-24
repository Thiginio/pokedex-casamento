/**
 * SUÍTE DE TESTES OBRIGATÓRIOS DO SISTEMA DE MISSÕES POKÉDEX DO CASAMENTO
 * Validação rigorosa dos 15 requisitos de qualidade e integridade do catálogo.
 */

import {
  INITIAL_MISSIONS,
  AUTHORIZED_POKEMON_SPECIES_LIST,
  AUTHORIZED_POKEMON_IDS_SET,
  ELECTABUZZ_POKEMON_ID,
  SHINY_CHANCE_PERCENT,
  isAuthorizedSpecies,
  rollShinyVariant,
  validateCatalogIntegrity,
  getMissionsForGuest,
} from '../services/missionService';

import {
  completeMissionForGuest,
  isMissionCompletedByGuest,
  migrateGuestData,
} from '../services/guestService';

import { Guest } from '../types/guest';
import { Mission } from '../types/mission';

// Helper de asserção simples
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[FALHA] ${message}`);
  }
}

function runAllTests() {
  console.log('========================================================');
  console.log('🧪 INICIANDO TESTES DO SISTEMA DE MISSÕES E POKÉDEX');
  console.log('========================================================\n');

  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void) {
    total++;
    try {
      fn();
      passed++;
      console.log(`✅ [TESTE ${total}] ${name}`);
    } catch (e: any) {
      console.error(`❌ [TESTE ${total}] ${name}`);
      console.error(`   Erro: ${e.message}\n`);
      throw e;
    }
  }

  // 1. Existência de exatamente 23 missões canônicas
  test('1. Existência de exatamente 23 missões canônicas', () => {
    assert(
      INITIAL_MISSIONS.length === 23,
      `Esperado 23 missões no catálogo, encontrado ${INITIAL_MISSIONS.length}`
    );
    assert(
      AUTHORIZED_POKEMON_SPECIES_LIST.length === 23,
      `Esperado 23 espécies na lista autorizada, encontrado ${AUTHORIZED_POKEMON_SPECIES_LIST.length}`
    );
  });

  // 2. Existência de exatamente 23 espécies distintas autorizadas
  test('2. Existência de exatamente 23 espécies distintas autorizadas', () => {
    const speciesIds = new Set(INITIAL_MISSIONS.map((m) => m.recompensa.pokemonId));
    assert(
      speciesIds.size === 23,
      `Esperado 23 IDs distintos, encontrado ${speciesIds.size}`
    );
    assert(
      AUTHORIZED_POKEMON_IDS_SET.size === 23,
      `Esperado 23 IDs no Set de autorizados, encontrado ${AUTHORIZED_POKEMON_IDS_SET.size}`
    );
  });

  // 3. Uma única missão por espécie
  test('3. Uma única missão por espécie (sem duplicatas)', () => {
    const idCount: Record<number, number> = {};
    for (const mission of INITIAL_MISSIONS) {
      const pId = mission.recompensa.pokemonId;
      idCount[pId] = (idCount[pId] || 0) + 1;
      assert(
        idCount[pId] === 1,
        `Espécie ID ${pId} possui mais de uma missão vinculada!`
      );
    }
  });

  // 4. Correspondência correta entre cada missão e sua recompensa autorizada
  test('4. Correspondência correta entre cada missão e sua recompensa', () => {
    const expectedMapping: Record<string, number> = {
      sunflora_jardim_felicidade: 192,
      roselia_rosa_amizade: 315,
      roserade_elegancia_flor: 407,
      cherrim_florescer_alegria: 421,
      petilil_pequenos_detalhes: 548,
      lilligant_danca_flores: 549,
      flabebe_flor_especial: 669,
      floette_guardiao_buque: 670,
      florges_reino_flores: 671,
      comfey_lacos_carinho: 764,
      fomantis_explorador_botanico: 753,
      lurantis_pose_campeao: 754,
      gossifleur_vento_primavera: 829,
      eldegoss_espalhando_felicidade: 830,
      bellossom_ritmo_tropical: 182,
      electabuzz_choque_pista: 125,
      bulbasaur_semente_amor: 1,
      eevee_foto_mesa: 133,
      skarmory_mensageiro_alado: 227,
      jigglypuff_karaoke_pokemon: 39,
      ho_oh_lenda_uniao: 250,
      hariyama_forca_amizade: 297,
      clefable_foto_mirella: 36,
    };

    for (const [missionId, expectedId] of Object.entries(expectedMapping)) {
      const mission = INITIAL_MISSIONS.find((m) => m.id === missionId);
      assert(Boolean(mission), `Missão "${missionId}" não encontrada no catálogo!`);
      assert(
        mission!.recompensa.pokemonId === expectedId,
        `Missão "${missionId}" esperava espécie #${expectedId}, recebeu #${mission!.recompensa.pokemonId}`
      );
    }
  });

  // 5. Ausência de recompensas de espécies não autorizadas
  test('5. Ausência de recompensas de espécies não autorizadas', () => {
    const forbiddenIds = [6, 25, 282, 175, 272, 700, 448, 370, 94, 151]; // Charizard, Pikachu, Gardevoir, etc
    for (const mission of INITIAL_MISSIONS) {
      assert(
        !forbiddenIds.includes(mission.recompensa.pokemonId),
        `Espécie proibida #${mission.recompensa.pokemonId} detectada na missão "${mission.id}"!`
      );
      assert(
        isAuthorizedSpecies(mission.recompensa.pokemonId),
        `Espécie #${mission.recompensa.pokemonId} não está presente na lista autorizada!`
      );
    }
  });

  // 6. Rejeição no backend de tentativas de conceder espécies proibidas
  test('6. Rejeição no backend de tentativas de conceder espécies proibidas', () => {
    const guest: Guest = {
      id: 'test_guest_1',
      nome: 'Teste',
      createdAt: new Date().toISOString(),
      completedMissions: {},
      capturedPokemons: [],
    };

    const forgedMission: Mission = {
      id: 'missao_falsificada',
      nome: 'Missão Falsa',
      descricao: 'Tentativa de pegar Mew',
      categoria: 'FOTO',
      tipoValidacao: 'UPLOAD_FOTO',
      dificuldade: 'FACIL',
      status: 'DISPONIVEL',
      ordem: 99,
      ativa: true,
      recompensa: {
        pokemonId: 151, // Mew (Não autorizado)
        pokemonName: 'Mew',
      },
    };

    let caughtError = false;
    try {
      completeMissionForGuest(guest, forgedMission, 'FOTO');
    } catch (e: any) {
      caughtError = true;
    }
    assert(caughtError, 'O backend DEVE rejeitar missões que não existam ou não sejam autorizadas!');
  });

  // 7. Probabilidade configurada de 10% de shiny nas 22 missões comuns (Testes Determinísticos)
  test('7. Probabilidade de 10% de shiny nas 22 missões comuns (Determinístico)', () => {
    assert(SHINY_CHANCE_PERCENT === 10, 'A constante de probabilidade deve ser exatamente 10%');

    // RNG controlado: valor 0.05 (< 0.10) DEVE gerar Shiny
    const deterministicShiny = rollShinyVariant(192, () => 0.05);
    assert(deterministicShiny === true, 'RNG 0.05 deve resultar em variante Shiny (true)');

    // RNG controlado: valor 0.0999 (< 0.10) DEVE gerar Shiny
    const boundaryShiny = rollShinyVariant(192, () => 0.0999);
    assert(boundaryShiny === true, 'RNG 0.0999 deve resultar em variante Shiny (true)');

    // RNG controlado: valor 0.10 (>= 0.10) DEVE gerar Normal
    const boundaryNormal = rollShinyVariant(192, () => 0.10);
    assert(boundaryNormal === false, 'RNG 0.10 deve resultar em variante Normal (false)');

    // RNG controlado: valor 0.75 (>= 0.10) DEVE gerar Normal
    const deterministicNormal = rollShinyVariant(192, () => 0.75);
    assert(deterministicNormal === false, 'RNG 0.75 deve resultar em variante Normal (false)');
  });

  // 8. Recompensa de Electabuzz sempre composta por 1 normal e 1 shiny
  test('8. Recompensa de Electabuzz composta por 1 normal e 1 shiny', () => {
    const electabuzzMission = INITIAL_MISSIONS.find((m) => m.id === 'electabuzz_choque_pista')!;
    assert(Boolean(electabuzzMission), 'Missão de Electabuzz deve existir no catálogo');

    const guest: Guest = {
      id: 'guest_electabuzz_test',
      nome: 'Teste Electabuzz',
      createdAt: new Date().toISOString(),
      completedMissions: {},
      capturedPokemons: [],
    };

    const result = completeMissionForGuest(
      guest,
      electabuzzMission,
      'CODIGO',
      'PISTA-ELETRICA',
      () => 0.99 // Mesmo com RNG alto, a regra de Electabuzz entrega garantido
    );

    assert(
      result.rewards.length === 2,
      `Electabuzz deve entregar exatamente 2 recompensas, entregou ${result.rewards.length}`
    );

    const normal = result.rewards.find((r) => !r.isShiny);
    const shiny = result.rewards.find((r) => r.isShiny);

    assert(Boolean(normal), 'Electabuzz deve conter uma captura Normal');
    assert(Boolean(shiny), 'Electabuzz deve conter uma captura Shiny');
    assert(normal!.pokemonId === ELECTABUZZ_POKEMON_ID, 'ID da captura normal deve ser 125');
    assert(shiny!.pokemonId === ELECTABUZZ_POKEMON_ID, 'ID da captura shiny deve ser 125');
  });

  // 9. Ausência de sorteio de shiny na missão especial de Electabuzz
  test('9. Ausência de sorteio de shiny na missão especial de Electabuzz', () => {
    let threwError = false;
    try {
      rollShinyVariant(ELECTABUZZ_POKEMON_ID);
    } catch (e: any) {
      threwError = true;
    }
    assert(
      threwError,
      'rollShinyVariant DEVE lançar exceção ao ser invocada para Electabuzz, pois não há sorteio aleatório nele.'
    );
  });

  // 10. Ausência de recompensas duplicadas em reenvios e requisições simultâneas
  test('10. Prevenção de duplicidade em reenvios e concorrência', () => {
    const sunfloraMission = INITIAL_MISSIONS.find((m) => m.id === 'sunflora_jardim_felicidade')!;
    const guest: Guest = {
      id: 'guest_dup_test',
      nome: 'Teste Duplicidade',
      createdAt: new Date().toISOString(),
      completedMissions: {},
      capturedPokemons: [],
    };

    // Primeira conclusão: deve ter sucesso
    const firstCall = completeMissionForGuest(guest, sunfloraMission, 'FOTO');
    assert(
      isMissionCompletedByGuest(firstCall.updatedGuest, sunfloraMission.id),
      'Missão deve estar marcada como concluída'
    );
    assert(
      firstCall.updatedGuest.capturedPokemons.length === 1,
      'Deve conter 1 Pokémon capturado'
    );

    // Segunda tentativa imediata com o mesmo convidado: DEVE falhar
    let rejected = false;
    try {
      completeMissionForGuest(firstCall.updatedGuest, sunfloraMission, 'FOTO');
    } catch (e) {
      rejected = true;
    }

    assert(rejected, 'Reenvio de missão já concluída deve ser estritamente bloqueado!');
  });

  // 11. Persistência da variante sorteada
  test('11. Persistência da variante sorteada e suas artworks', () => {
    const roseliaMission = INITIAL_MISSIONS.find((m) => m.id === 'roselia_rosa_amizade')!;
    const guest: Guest = {
      id: 'guest_persist_test',
      nome: 'Teste Persistência',
      createdAt: new Date().toISOString(),
      completedMissions: {},
      capturedPokemons: [],
    };

    // Força shiny via RNG controlado
    const shinyResult = completeMissionForGuest(
      guest,
      roseliaMission,
      'FOTO',
      undefined,
      () => 0.02
    );

    const shinyCap = shinyResult.rewards[0];
    assert(shinyCap.isShiny === true, 'A captura deve registrar isShiny: true');
    assert(
      shinyCap.artworkUrl.includes('/shiny/'),
      'A captura Shiny deve conter a URL da artwork shiny'
    );

    // Força normal via RNG controlado
    const guest2: Guest = {
      id: 'guest_persist_test_2',
      nome: 'Teste Normal',
      createdAt: new Date().toISOString(),
      completedMissions: {},
      capturedPokemons: [],
    };

    const normalResult = completeMissionForGuest(
      guest2,
      roseliaMission,
      'FOTO',
      undefined,
      () => 0.85
    );

    const normalCap = normalResult.rewards[0];
    assert(normalCap.isShiny === false, 'A captura deve registrar isShiny: false');
    assert(
      !normalCap.artworkUrl.includes('/shiny/'),
      'A captura Normal não deve conter /shiny/ na URL da artwork'
    );
  });

  // 12. Exibição do nome do Pokémon como identificação principal
  test('12. Exibição do nome do Pokémon como identificação principal', () => {
    // Verificamos que o modelo da missão não possui o número no nome do Pokémon
    for (const mission of INITIAL_MISSIONS) {
      assert(
        !mission.recompensa.pokemonName.startsWith('#'),
        `O nome do Pokémon não deve começar com número: "${mission.recompensa.pokemonName}"`
      );
    }
  });

  // 13. Funcionamento correto do inventário e da Pokédex
  test('13. Funcionamento correto do inventário e progresso de missões', () => {
    const guest: Guest = {
      id: 'guest_inv_test',
      nome: 'Teste Inventário',
      createdAt: new Date().toISOString(),
      completedMissions: {},
      capturedPokemons: [],
    };

    const missionsForGuestInitial = getMissionsForGuest(guest);
    assert(
      missionsForGuestInitial.length === 23,
      'Deve retornar todas as 23 missões para o convidado'
    );

    // Missão secreta Ho-Oh bloqueada inicialmente (requer 5 missões)
    const hoOhInitial = missionsForGuestInitial.find((m) => m.id === 'ho_oh_lenda_uniao');
    assert(
      hoOhInitial?.status === 'BLOQUEADA',
      'Ho-Oh deve estar bloqueado no início'
    );
  });

  // 14. Preservação de contas, convidados e histórico legítimo na migração
  test('14. Preservação de contas e histórico legítimo na migração', () => {
    const legacyGuest: any = {
      id: 'legacy_user_1',
      nome: 'Convidado Antigo',
      createdAt: '2026-01-01T00:00:00.000Z',
      completedMissions: {
        foto_antiga: {
          missionId: 'foto_antiga',
          completedAt: '2026-01-01T00:00:00.000Z',
          proofType: 'FOTO',
          rewardReceived: { pokemonId: 6, pokemonName: 'Charizard' },
        },
      },
      capturedPokemons: [
        {
          pokemonId: 6,
          pokemonName: 'Charizard',
          capturedAt: '2026-01-01T00:00:00.000Z',
          sourceMissionId: 'foto_antiga',
        },
      ],
    };

    const migrated = migrateGuestData(legacyGuest);
    assert(migrated.id === 'legacy_user_1', 'ID do convidado deve ser preservado');
    assert(migrated.capturedPokemons.length === 1, 'Histórico de capturas deve ser mantido');
    assert(migrated.capturedPokemons[0].isShiny === false, 'Novo campo isShiny atribuído');
    assert(Boolean(migrated.capturedPokemons[0].artworkUrl), 'Novo campo artworkUrl atribuído');
  });

  // 15. Ausência de missões antigas incompatíveis no catálogo ativo
  test('15. Ausência de missões antigas incompatíveis no catálogo ativo', () => {
    const catalogValidation = validateCatalogIntegrity();
    assert(
      catalogValidation.isValid,
      `Catálogo falhou na auditoria: ${catalogValidation.errors.join('; ')}`
    );

    const oldMissionIds = [
      'foto_noiva',
      'foto_noivo',
      'foto_casal',
      'foto_amigos_mesa',
      'video_recado_noivos',
      'video_danca_festa',
      'noivos_mirella_amizade',
      'noivos_joao_danca',
      'noivos_casal_historia',
      'minijogo_quem_e_esse_pokemon',
      'minijogo_quiz_casal',
      'missao_secreta_gardevoir',
    ];

    for (const oldId of oldMissionIds) {
      const exists = INITIAL_MISSIONS.some((m) => m.id === oldId);
      assert(!exists, `Missão antiga incompatível "${oldId}" ainda presente no catálogo!`);
    }
  });

  console.log('\n========================================================');
  console.log(`🎉 TODOS OS ${passed}/${total} TESTES OBRIGATÓRIOS PASSARAM COM SUCESSO!`);
  console.log('========================================================\n');
}

runAllTests();
