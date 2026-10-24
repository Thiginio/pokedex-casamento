import { useState, useEffect, useCallback } from 'react';
import { Pokemon, PokemonListItem } from '../types/pokemon';
import {
  fetchPokemon,
  fetchPokemonList,
  fetchAllPokemonCatalog,
} from '../services/pokeapi';

/**
 * Hook para buscar dados e TODOS os sprites de qualquer Pokémon
 * Suporta busca por ID (1, 2, 25, 150...) ou Nome ('pikachu', 'charizard', 'mewtwo'...)
 */
export function usePokemon(idOrName: string | number | null) {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(idOrName));
  const [error, setError] = useState<string | null>(null);

  const loadPokemon = useCallback(async () => {
    if (!idOrName) {
      setPokemon(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchPokemon(idOrName);
      setPokemon(data);
    } catch (err: any) {
      setError(err?.message || 'Falha ao buscar Pokémon.');
      setPokemon(null);
    } finally {
      setLoading(false);
    }
  }, [idOrName]);

  useEffect(() => {
    loadPokemon();
  }, [loadPokemon]);

  return {
    pokemon,
    loading,
    error,
    refetch: loadPokemon,
  };
}

/**
 * Hook para listar múltiplos Pokémons paginados com sprites
 */
export function usePokemonList(limit: number = 20, offset: number = 0) {
  const [list, setList] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await fetchPokemonList(limit, offset);
      setList(items);
    } catch (err: any) {
      setError(err?.message || 'Falha ao listar Pokémons.');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  return {
    list,
    loading,
    error,
    refetch: loadList,
  };
}

/**
 * Hook para carregar o catálogo de todos os Pokémons (1 a 1025)
 * Ideal para buscas rápidas, dropdowns ou navegação direta
 */
export function useAllPokemonCatalog(limit: number = 1025) {
  const [catalog, setCatalog] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchAllPokemonCatalog(limit)
      .then((items) => {
        if (isMounted) {
          setCatalog(items);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Falha ao carregar catálogo completo.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [limit]);

  return {
    catalog,
    loading,
    error,
  };
}
