import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Button } from "./button";

export interface AutocompleteOption {
  value: string;
  label: string;
  id: number;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onSearch?: (query: string) => void;
  loading?: boolean;
  emptyMessage?: string;

}

export default function Autocomplete({
  options,
  value,
  onValueChange,
  placeholder = "Digite para buscar...",
  className,
  disabled = false,
  onSearch,
  loading = false,
  emptyMessage = "Nenhum resultado encontrado",
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Encontrar o item selecionado
  const selectedOption = options.find(option => option.value === value);

  // Filtrar opções baseado na busca (mínimo 3 caracteres)
  const filteredOptions = searchQuery.length >= 3 
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Resetar índice destacado quando as opções mudarem
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);

  // Gerenciar busca (mínimo 3 caracteres)
  useEffect(() => {
    if (onSearch && searchQuery && searchQuery.length >= 3) {
      const debounceTimer = setTimeout(() => {
        onSearch(searchQuery);
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, onSearch]);

  // Effect para sincronizar o valor selecionado com o searchQuery
  useEffect(() => {
    if (selectedOption && selectedOption.label !== searchQuery) {
      setSearchQuery(selectedOption.label);
    }
  }, [selectedOption]);

  // Effect crítico para limpar searchQuery quando value for resetado
  useEffect(() => {
    if (!value || value === "" || value === "0") {
      setSearchQuery("");
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, [value]);

  /**
   * FUNÇÃO HANDLEINPUTCHANGE - GERENCIAR MUDANÇAS NO INPUT
   * 
   * @param e - Evento de mudança do input
   * 
   * Responsabilidade:
   * - Atualizar query de busca baseada no input do usuário
   * - Controlar abertura/fechamento do dropdown baseado no comprimento
   * - Implementar lógica de busca progressiva
   * 
   * Regras de Negócio:
   * - Dropdown abre quando query tem 3+ caracteres
   * - Dropdown fecha quando query tem menos de 3 caracteres
   * - Query é sempre atualizada independente do estado do dropdown
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!isOpen && query) {
      setIsOpen(true);
    }

    // Se limpar o input, limpar seleção
    if (!query && onValueChange) {
      onValueChange("");
    }
  };

  /**
   * FUNÇÃO HANDLEOPTIONSELECT - SELECIONAR OPÇÃO DO DROPDOWN
   * 
   * @param option - Opção selecionada pelo usuário
   * 
   * Responsabilidade:
   * - Notificar componente pai sobre seleção via callback
   * - Fechar dropdown após seleção
   * - Limpar query de busca
   * - Remover foco do input
   * 
   * Regras de Negócio:
   * - Callback onValueChange é chamado com valor da opção
   * - Dropdown é fechado imediatamente
   * - Interface retorna ao estado inicial
   * - Foco é removido para melhor UX
   */
  const handleOptionSelect = (option: AutocompleteOption) => {
    setSearchQuery(option.label);
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onValueChange) {
      onValueChange(option.value);
    }

    inputRef.current?.blur();
  };

  /**
   * FUNÇÃO HANDLEKEYDOWN - NAVEGAÇÃO POR TECLADO
   * 
   * @param e - Evento de tecla pressionada
   * 
   * Responsabilidade:
   * - Implementar navegação por setas (ArrowUp/ArrowDown)
   * - Permitir seleção por Enter
   * - Implementar fechamento por Escape
   * - Controlar highlight de opções
   * - Gerenciar abertura por ArrowDown quando fechado
   * 
   * Regras de Negócio:
   * - ArrowDown quando fechado: abre dropdown se query válida
   * - ArrowDown quando aberto: move highlight para baixo
   * - ArrowUp: move highlight para cima
   * - Enter: seleciona opção highlighted
   * - Escape: fecha dropdown e remove foco
   * - Navegação fica dentro dos limites das opções
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        if (searchQuery.length >= 3) {
          setIsOpen(true);
        }
        return;
      }
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;

      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onValueChange) {
      onValueChange("");
    }
    inputRef.current?.focus();
  };

  /**
   * FUNÇÃO HANDLEINPUTFOCUS - TRATAR FOCO NO INPUT
   * 
   * Responsabilidade:
   * - Reabrir dropdown se query já tem 3+ caracteres
   * - Melhorar experiência do usuário em re-foco
   * - Manter consistência de comportamento
   * 
   * Regras de Negócio:
   * - Dropdown reabre apenas se query atende critério mínimo
   * - Não modifica query existente
   * - Permite continuação de busca interrompida
   */
  const handleInputFocus = () => {
    if (searchQuery.length >= 3) {
      setIsOpen(true);
    }
  };

  /**
   * FUNÇÃO HANDLEINPUTBLUR - TRATAR PERDA DE FOCO DO INPUT
   * 
   * Responsabilidade:
   * - Fechar dropdown quando input perde foco
   * - Usar delay para permitir cliques nas opções
   * - Evitar fechamento prematuro durante seleção
   * 
   * Regras de Negócio:
   * - Delay de 150ms permite clique em opções
   * - Dropdown sempre fecha após blur (com delay)
   * - UX preservada para seleção por mouse
   */
  const handleInputBlur = () => {
    // Delay para permitir clique em opções
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  // Scroll para item destacado
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-20"
          autoComplete="off"
        />

        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={() => {
              if (searchQuery.length >= 3) {
                setIsOpen(!isOpen);
              } else {
                inputRef.current?.focus();
              }
            }}
          >
            <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto">
          <ul ref={listRef} className="py-1">
            {loading ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Carregando...
              </li>
            ) : searchQuery.length < 3 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Digite pelo menos 3 caracteres para buscar...
              </li>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    highlightedIndex === index && "bg-accent text-accent-foreground",
                    value === option.value && "bg-primary/10 font-medium"
                  )}
                  onClick={() => handleOptionSelect(option)}
                >
                  <span className="flex-1">{option.label}</span>

                  {value === option.value && (
                    <Check className="h-4 w-4 ml-2" />
                  )}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                {emptyMessage}
              </li>
            )}
          </ul>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Named export for compatibility
export { Autocomplete };