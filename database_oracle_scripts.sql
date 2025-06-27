-- ====================================================================
-- SISTEMA FINANCEIRO FAMILIAR KIGI - SCRIPTS ORACLE 11G
-- ====================================================================
-- 
-- Descrição: Scripts para criação das tabelas, índices, constraints
-- e relacionamentos do sistema financeiro familiar KIGI
-- 
-- Base de análise: types.ts e estruturas de dados do projeto
-- Versão: Oracle Database 11G
-- Data: Janeiro 2025
-- ====================================================================

-- ====================================================================
-- 1. CRIAÇÃO DAS SEQUENCES PARA IDs AUTOINCREMENTAIS
-- ====================================================================

-- Sequence para tabela USUARIOS
CREATE SEQUENCE seq_usuarios
    START WITH 1
    INCREMENT BY 1
    NOMAXVALUE
    NOCACHE;

-- Sequence para tabela EMPRESAS
CREATE SEQUENCE seq_empresas
    START WITH 1
    INCREMENT BY 1
    NOMAXVALUE
    NOCACHE;

-- Sequence para tabela PRODUTOS
CREATE SEQUENCE seq_produtos
    START WITH 1
    INCREMENT BY 1
    NOMAXVALUE
    NOCACHE;

-- Sequence para tabela ENTRADAS
CREATE SEQUENCE seq_entradas
    START WITH 1
    INCREMENT BY 1
    NOMAXVALUE
    NOCACHE;

-- Sequence para tabela SAIDAS
CREATE SEQUENCE seq_saidas
    START WITH 1
    INCREMENT BY 1
    NOMAXVALUE
    NOCACHE;

-- Sequence para tabela ITENS_SAIDA
CREATE SEQUENCE seq_itens_saida
    START WITH 1
    INCREMENT BY 1
    NOMAXVALUE
    NOCACHE;

-- Sequence para tabela PARCELAS
CREATE SEQUENCE seq_parcelas
    START WITH 1
    INCREMENT BY 1
    NOMAXVALUE
    NOCACHE;

-- Sequence para tabela SAIDA_TITULARES
CREATE SEQUENCE seq_saida_titulares
    START WITH 1
    INCREMENT BY 1
    NOMAXVALUE
    NOCACHE;

-- ====================================================================
-- 2. CRIAÇÃO DAS TABELAS PRINCIPAIS
-- ====================================================================

-- TABELA: USUARIOS
-- Armazena os usuários da família (pai, mãe, filhos)
CREATE TABLE usuarios (
    id NUMBER(10) PRIMARY KEY,
    nome VARCHAR2(100) NOT NULL,
    login VARCHAR2(50) NOT NULL UNIQUE,
    senha VARCHAR2(255) NOT NULL,
    papel VARCHAR2(10) NOT NULL CHECK (papel IN ('pai', 'mae', 'filho', 'filha')),
    ativo NUMBER(1) DEFAULT 1 CHECK (ativo IN (0, 1)),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABELA: EMPRESAS
-- Armazena as empresas onde são realizadas compras/pagamentos
CREATE TABLE empresas (
    id NUMBER(10) PRIMARY KEY,
    nome VARCHAR2(200) NOT NULL,
    ativo NUMBER(1) DEFAULT 1 CHECK (ativo IN (0, 1)),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABELA: PRODUTOS
-- Armazena o catálogo de produtos da família
-- Nota: precoUnitario foi removido - será definido apenas no momento da compra
CREATE TABLE produtos (
    id NUMBER(10) PRIMARY KEY,
    codigo_barras VARCHAR2(50),
    nome VARCHAR2(200) NOT NULL,
    unidade VARCHAR2(20) NOT NULL,
    classificacao VARCHAR2(100) NOT NULL,
    ativo NUMBER(1) DEFAULT 1 CHECK (ativo IN (0, 1)),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABELA: ENTRADAS
-- Armazena as receitas/entradas financeiras da família
CREATE TABLE entradas (
    id NUMBER(10) PRIMARY KEY,
    usuario_registro_id NUMBER(10) NOT NULL,
    data_hora_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_titular_id NUMBER(10) NOT NULL,
    data_referencia DATE NOT NULL,
    valor NUMBER(15,2) NOT NULL CHECK (valor > 0),
    empresa_pagadora_id NUMBER(10) NOT NULL,
    CONSTRAINT fk_entrada_usuario_registro FOREIGN KEY (usuario_registro_id) REFERENCES usuarios(id),
    CONSTRAINT fk_entrada_usuario_titular FOREIGN KEY (usuario_titular_id) REFERENCES usuarios(id),
    CONSTRAINT fk_entrada_empresa_pagadora FOREIGN KEY (empresa_pagadora_id) REFERENCES empresas(id)
);

-- TABELA: SAIDAS
-- Armazena as despesas/saídas financeiras da família
CREATE TABLE saidas (
    id NUMBER(10) PRIMARY KEY,
    usuario_registro_id NUMBER(10) NOT NULL,
    data_hora_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_saida DATE NOT NULL,
    empresa_id NUMBER(10) NOT NULL,
    tipo_pagamento VARCHAR2(10) NOT NULL CHECK (tipo_pagamento IN ('avista', 'parcelado')),
    valor_total NUMBER(15,2) NOT NULL CHECK (valor_total > 0),
    observacao VARCHAR2(500),
    numero_parcelas NUMBER(3),
    data_primeira_parcela DATE,
    CONSTRAINT fk_saida_usuario_registro FOREIGN KEY (usuario_registro_id) REFERENCES usuarios(id),
    CONSTRAINT fk_saida_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    CONSTRAINT chk_parcelas_avista CHECK (
        (tipo_pagamento = 'avista' AND numero_parcelas IS NULL AND data_primeira_parcela IS NULL) OR
        (tipo_pagamento = 'parcelado' AND numero_parcelas > 1 AND data_primeira_parcela IS NOT NULL)
    )
);

-- TABELA: ITENS_SAIDA
-- Armazena os itens individuais de cada saída/despesa
CREATE TABLE itens_saida (
    id NUMBER(10) PRIMARY KEY,
    saida_id NUMBER(10) NOT NULL,
    produto_id NUMBER(10) NOT NULL,
    nome_produto VARCHAR2(200) NOT NULL,
    quantidade NUMBER(10,3) NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMBER(15,2) NOT NULL CHECK (preco_unitario > 0),
    total NUMBER(15,2) NOT NULL CHECK (total > 0),
    CONSTRAINT fk_item_saida FOREIGN KEY (saida_id) REFERENCES saidas(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_produto FOREIGN KEY (produto_id) REFERENCES produtos(id),
    CONSTRAINT chk_total_item CHECK (total = quantidade * preco_unitario)
);

-- TABELA: SAIDA_TITULARES
-- Tabela de relacionamento many-to-many entre saídas e usuários titulares
-- Uma saída pode ter múltiplos usuários como titulares
CREATE TABLE saida_titulares (
    id NUMBER(10) PRIMARY KEY,
    saida_id NUMBER(10) NOT NULL,
    usuario_id NUMBER(10) NOT NULL,
    CONSTRAINT fk_saida_titular_saida FOREIGN KEY (saida_id) REFERENCES saidas(id) ON DELETE CASCADE,
    CONSTRAINT fk_saida_titular_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT uk_saida_usuario UNIQUE (saida_id, usuario_id)
);

-- TABELA: PARCELAS
-- Armazena as parcelas das compras parceladas
CREATE TABLE parcelas (
    id NUMBER(10) PRIMARY KEY,
    saida_original_id NUMBER(10) NOT NULL,
    numero_parcela NUMBER(3) NOT NULL CHECK (numero_parcela > 0),
    data_vencimento DATE NOT NULL,
    valor_parcela NUMBER(15,2) NOT NULL CHECK (valor_parcela > 0),
    status VARCHAR2(10) NOT NULL CHECK (status IN ('paga', 'vencida', 'a vencer')),
    data_pagamento DATE,
    CONSTRAINT fk_parcela_saida FOREIGN KEY (saida_original_id) REFERENCES saidas(id) ON DELETE CASCADE,
    CONSTRAINT uk_saida_parcela UNIQUE (saida_original_id, numero_parcela),
    CONSTRAINT chk_data_pagamento CHECK (
        (status = 'paga' AND data_pagamento IS NOT NULL) OR
        (status IN ('vencida', 'a vencer') AND data_pagamento IS NULL)
    )
);

-- ====================================================================
-- 3. CRIAÇÃO DOS ÍNDICES PARA OTIMIZAÇÃO
-- ====================================================================

-- Índices para tabela USUARIOS
CREATE INDEX idx_usuarios_login ON usuarios(login);
CREATE INDEX idx_usuarios_papel ON usuarios(papel);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);

-- Índices para tabela EMPRESAS
CREATE INDEX idx_empresas_nome ON empresas(nome);
CREATE INDEX idx_empresas_ativo ON empresas(ativo);

-- Índices para tabela PRODUTOS
CREATE INDEX idx_produtos_codigo_barras ON produtos(codigo_barras);
CREATE INDEX idx_produtos_nome ON produtos(nome);
CREATE INDEX idx_produtos_classificacao ON produtos(classificacao);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);

-- Índices para tabela ENTRADAS
CREATE INDEX idx_entradas_usuario_registro ON entradas(usuario_registro_id);
CREATE INDEX idx_entradas_usuario_titular ON entradas(usuario_titular_id);
CREATE INDEX idx_entradas_data_referencia ON entradas(data_referencia);
CREATE INDEX idx_entradas_empresa_pagadora ON entradas(empresa_pagadora_id);
CREATE INDEX idx_entradas_data_hora_registro ON entradas(data_hora_registro);

-- Índices para tabela SAIDAS
CREATE INDEX idx_saidas_usuario_registro ON saidas(usuario_registro_id);
CREATE INDEX idx_saidas_data_saida ON saidas(data_saida);
CREATE INDEX idx_saidas_empresa ON saidas(empresa_id);
CREATE INDEX idx_saidas_tipo_pagamento ON saidas(tipo_pagamento);
CREATE INDEX idx_saidas_data_hora_registro ON saidas(data_hora_registro);

-- Índices para tabela ITENS_SAIDA
CREATE INDEX idx_itens_saida_saida ON itens_saida(saida_id);
CREATE INDEX idx_itens_saida_produto ON itens_saida(produto_id);

-- Índices para tabela SAIDA_TITULARES
CREATE INDEX idx_saida_titulares_saida ON saida_titulares(saida_id);
CREATE INDEX idx_saida_titulares_usuario ON saida_titulares(usuario_id);

-- Índices para tabela PARCELAS
CREATE INDEX idx_parcelas_saida_original ON parcelas(saida_original_id);
CREATE INDEX idx_parcelas_data_vencimento ON parcelas(data_vencimento);
CREATE INDEX idx_parcelas_status ON parcelas(status);
CREATE INDEX idx_parcelas_data_pagamento ON parcelas(data_pagamento);

-- ====================================================================
-- 4. CRIAÇÃO DOS TRIGGERS PARA IDs AUTOINCREMENTAIS
-- ====================================================================

-- Trigger para tabela USUARIOS
CREATE OR REPLACE TRIGGER trg_usuarios_id
    BEFORE INSERT ON usuarios
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        SELECT seq_usuarios.NEXTVAL INTO :NEW.id FROM dual;
    END IF;
END;
/

-- Trigger para tabela EMPRESAS
CREATE OR REPLACE TRIGGER trg_empresas_id
    BEFORE INSERT ON empresas
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        SELECT seq_empresas.NEXTVAL INTO :NEW.id FROM dual;
    END IF;
END;
/

-- Trigger para tabela PRODUTOS
CREATE OR REPLACE TRIGGER trg_produtos_id
    BEFORE INSERT ON produtos
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        SELECT seq_produtos.NEXTVAL INTO :NEW.id FROM dual;
    END IF;
END;
/

-- Trigger para tabela ENTRADAS
CREATE OR REPLACE TRIGGER trg_entradas_id
    BEFORE INSERT ON entradas
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        SELECT seq_entradas.NEXTVAL INTO :NEW.id FROM dual;
    END IF;
END;
/

-- Trigger para tabela SAIDAS
CREATE OR REPLACE TRIGGER trg_saidas_id
    BEFORE INSERT ON saidas
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        SELECT seq_saidas.NEXTVAL INTO :NEW.id FROM dual;
    END IF;
END;
/

-- Trigger para tabela ITENS_SAIDA
CREATE OR REPLACE TRIGGER trg_itens_saida_id
    BEFORE INSERT ON itens_saida
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        SELECT seq_itens_saida.NEXTVAL INTO :NEW.id FROM dual;
    END IF;
END;
/

-- Trigger para tabela SAIDA_TITULARES
CREATE OR REPLACE TRIGGER trg_saida_titulares_id
    BEFORE INSERT ON saida_titulares
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        SELECT seq_saida_titulares.NEXTVAL INTO :NEW.id FROM dual;
    END IF;
END;
/

-- Trigger para tabela PARCELAS
CREATE OR REPLACE TRIGGER trg_parcelas_id
    BEFORE INSERT ON parcelas
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        SELECT seq_parcelas.NEXTVAL INTO :NEW.id FROM dual;
    END IF;
END;
/

-- ====================================================================
-- 5. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE TIMESTAMPS
-- ====================================================================

-- Trigger para atualizar campo atualizado_em na tabela USUARIOS
CREATE OR REPLACE TRIGGER trg_usuarios_updated
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
BEGIN
    :NEW.atualizado_em := CURRENT_TIMESTAMP;
END;
/

-- Trigger para atualizar campo atualizado_em na tabela EMPRESAS
CREATE OR REPLACE TRIGGER trg_empresas_updated
    BEFORE UPDATE ON empresas
    FOR EACH ROW
BEGIN
    :NEW.atualizado_em := CURRENT_TIMESTAMP;
END;
/

-- Trigger para atualizar campo atualizado_em na tabela PRODUTOS
CREATE OR REPLACE TRIGGER trg_produtos_updated
    BEFORE UPDATE ON produtos
    FOR EACH ROW
BEGIN
    :NEW.atualizado_em := CURRENT_TIMESTAMP;
END;
/

-- ====================================================================
-- 6. TRIGGER PARA VALIDAÇÃO DE TOTAL DOS ITENS DE SAÍDA
-- ====================================================================

-- Trigger para validar se o valor total da saída corresponde à soma dos itens
CREATE OR REPLACE TRIGGER trg_validar_total_saida
    AFTER INSERT OR UPDATE OR DELETE ON itens_saida
    FOR EACH ROW
DECLARE
    v_saida_id NUMBER(10);
    v_total_calculado NUMBER(15,2);
    v_total_saida NUMBER(15,2);
BEGIN
    -- Determinar o ID da saída afetada
    IF INSERTING OR UPDATING THEN
        v_saida_id := :NEW.saida_id;
    ELSIF DELETING THEN
        v_saida_id := :OLD.saida_id;
    END IF;
    
    -- Calcular total dos itens
    SELECT NVL(SUM(total), 0) INTO v_total_calculado
    FROM itens_saida
    WHERE saida_id = v_saida_id;
    
    -- Obter valor total da saída
    SELECT valor_total INTO v_total_saida
    FROM saidas
    WHERE id = v_saida_id;
    
    -- Validar se os totais são consistentes
    IF ABS(v_total_calculado - v_total_saida) > 0.01 THEN
        RAISE_APPLICATION_ERROR(-20001, 
            'Total dos itens (' || v_total_calculado || 
            ') não confere com o total da saída (' || v_total_saida || ')');
    END IF;
END;
/

-- ====================================================================
-- 7. TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DE STATUS DAS PARCELAS
-- ====================================================================

-- Trigger para atualizar automaticamente o status das parcelas baseado na data
CREATE OR REPLACE TRIGGER trg_atualizar_status_parcela
    BEFORE INSERT OR UPDATE ON parcelas
    FOR EACH ROW
BEGIN
    -- Se não tem data de pagamento e a data de vencimento já passou
    IF :NEW.data_pagamento IS NULL AND :NEW.data_vencimento < SYSDATE THEN
        :NEW.status := 'vencida';
    -- Se não tem data de pagamento e a data de vencimento ainda não chegou
    ELSIF :NEW.data_pagamento IS NULL AND :NEW.data_vencimento >= SYSDATE THEN
        :NEW.status := 'a vencer';
    -- Se tem data de pagamento
    ELSIF :NEW.data_pagamento IS NOT NULL THEN
        :NEW.status := 'paga';
    END IF;
END;
/

-- ====================================================================
-- 8. COMENTÁRIOS NAS TABELAS E COLUNAS
-- ====================================================================

-- Comentários na tabela USUARIOS
COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema familiar';
COMMENT ON COLUMN usuarios.id IS 'Identificador único do usuário';
COMMENT ON COLUMN usuarios.nome IS 'Nome completo do usuário';
COMMENT ON COLUMN usuarios.login IS 'Login único para acesso ao sistema';
COMMENT ON COLUMN usuarios.senha IS 'Senha criptografada do usuário';
COMMENT ON COLUMN usuarios.papel IS 'Papel do usuário na família (pai, mae, filho, filha)';
COMMENT ON COLUMN usuarios.ativo IS 'Indica se o usuário está ativo (1) ou inativo (0)';

-- Comentários na tabela EMPRESAS
COMMENT ON TABLE empresas IS 'Tabela de empresas onde são realizadas compras';
COMMENT ON COLUMN empresas.id IS 'Identificador único da empresa';
COMMENT ON COLUMN empresas.nome IS 'Nome da empresa';
COMMENT ON COLUMN empresas.ativo IS 'Indica se a empresa está ativa (1) ou inativa (0)';

-- Comentários na tabela PRODUTOS
COMMENT ON TABLE produtos IS 'Catálogo de produtos da família';
COMMENT ON COLUMN produtos.id IS 'Identificador único do produto';
COMMENT ON COLUMN produtos.codigo_barras IS 'Código de barras do produto (opcional)';
COMMENT ON COLUMN produtos.nome IS 'Nome do produto';
COMMENT ON COLUMN produtos.unidade IS 'Unidade de medida (kg, un, lt, etc.)';
COMMENT ON COLUMN produtos.classificacao IS 'Categoria/classificação do produto';

-- Comentários na tabela ENTRADAS
COMMENT ON TABLE entradas IS 'Receitas e entradas financeiras da família';
COMMENT ON COLUMN entradas.usuario_registro_id IS 'Usuário que registrou a entrada';
COMMENT ON COLUMN entradas.usuario_titular_id IS 'Usuário titular da receita';
COMMENT ON COLUMN entradas.data_referencia IS 'Data de referência da receita';
COMMENT ON COLUMN entradas.valor IS 'Valor da entrada em reais';
COMMENT ON COLUMN entradas.empresa_pagadora_id IS 'Empresa que efetuou o pagamento';

-- Comentários na tabela SAIDAS
COMMENT ON TABLE saidas IS 'Despesas e saídas financeiras da família';
COMMENT ON COLUMN saidas.usuario_registro_id IS 'Usuário que registrou a saída';
COMMENT ON COLUMN saidas.data_saida IS 'Data da compra/gasto';
COMMENT ON COLUMN saidas.empresa_id IS 'Empresa onde foi realizada a compra';
COMMENT ON COLUMN saidas.tipo_pagamento IS 'Tipo de pagamento (avista, parcelado)';
COMMENT ON COLUMN saidas.valor_total IS 'Valor total da saída em reais';
COMMENT ON COLUMN saidas.numero_parcelas IS 'Número de parcelas (apenas para parcelado)';
COMMENT ON COLUMN saidas.data_primeira_parcela IS 'Data de vencimento da primeira parcela';

-- Comentários na tabela ITENS_SAIDA
COMMENT ON TABLE itens_saida IS 'Itens individuais de cada saída/despesa';
COMMENT ON COLUMN itens_saida.saida_id IS 'Referência à saída principal';
COMMENT ON COLUMN itens_saida.produto_id IS 'Referência ao produto';
COMMENT ON COLUMN itens_saida.nome_produto IS 'Nome do produto no momento da compra';
COMMENT ON COLUMN itens_saida.quantidade IS 'Quantidade comprada';
COMMENT ON COLUMN itens_saida.preco_unitario IS 'Preço unitário no momento da compra';
COMMENT ON COLUMN itens_saida.total IS 'Total do item (quantidade × preço unitário)';

-- Comentários na tabela SAIDA_TITULARES
COMMENT ON TABLE saida_titulares IS 'Relacionamento entre saídas e usuários titulares';
COMMENT ON COLUMN saida_titulares.saida_id IS 'Referência à saída';
COMMENT ON COLUMN saida_titulares.usuario_id IS 'Referência ao usuário titular';

-- Comentários na tabela PARCELAS
COMMENT ON TABLE parcelas IS 'Parcelas das compras parceladas';
COMMENT ON COLUMN parcelas.saida_original_id IS 'Referência à saída parcelada original';
COMMENT ON COLUMN parcelas.numero_parcela IS 'Número sequencial da parcela';
COMMENT ON COLUMN parcelas.data_vencimento IS 'Data de vencimento da parcela';
COMMENT ON COLUMN parcelas.valor_parcela IS 'Valor da parcela em reais';
COMMENT ON COLUMN parcelas.status IS 'Status da parcela (paga, vencida, a vencer)';
COMMENT ON COLUMN parcelas.data_pagamento IS 'Data em que a parcela foi paga';

-- ====================================================================
-- 9. DADOS INICIAIS (SEEDS)
-- ====================================================================

-- Inserir usuários iniciais
INSERT INTO usuarios (nome, login, senha, papel) VALUES 
('João Silva', 'joao', 'senha_hash_aqui', 'pai');

INSERT INTO usuarios (nome, login, senha, papel) VALUES 
('Maria Silva', 'maria', 'senha_hash_aqui', 'mae');

INSERT INTO usuarios (nome, login, senha, papel) VALUES 
('Pedro Silva', 'pedro', 'senha_hash_aqui', 'filho');

INSERT INTO usuarios (nome, login, senha, papel) VALUES 
('Ana Silva', 'ana', 'senha_hash_aqui', 'filha');

-- Inserir empresas iniciais
INSERT INTO empresas (nome) VALUES ('Supermercado ABC');
INSERT INTO empresas (nome) VALUES ('Farmácia Central');
INSERT INTO empresas (nome) VALUES ('Posto Shell');

-- Inserir produtos iniciais
INSERT INTO produtos (codigo_barras, nome, unidade, classificacao) VALUES 
('7891234567890', 'Arroz Integral 5kg', 'kg', 'Alimentação');

INSERT INTO produtos (codigo_barras, nome, unidade, classificacao) VALUES 
('7891234567891', 'Feijão Preto 1kg', 'kg', 'Alimentação');

INSERT INTO produtos (codigo_barras, nome, unidade, classificacao) VALUES 
('7891234567892', 'Óleo de Soja 900ml', 'ml', 'Alimentação');

-- Commit das inserções iniciais
COMMIT;

-- ====================================================================
-- 10. VIEWS PARA RELATÓRIOS E CONSULTAS FREQUENTES
-- ====================================================================

-- View para resumo financeiro por usuário
CREATE OR REPLACE VIEW vw_resumo_usuario AS
SELECT 
    u.id,
    u.nome,
    u.papel,
    NVL(entradas.total_entradas, 0) as total_entradas,
    NVL(saidas.total_saidas, 0) as total_saidas,
    NVL(entradas.total_entradas, 0) - NVL(saidas.total_saidas, 0) as saldo
FROM usuarios u
LEFT JOIN (
    SELECT usuario_titular_id, SUM(valor) as total_entradas
    FROM entradas 
    WHERE EXTRACT(YEAR FROM data_referencia) = EXTRACT(YEAR FROM SYSDATE)
    GROUP BY usuario_titular_id
) entradas ON u.id = entradas.usuario_titular_id
LEFT JOIN (
    SELECT st.usuario_id, SUM(s.valor_total) as total_saidas
    FROM saidas s
    INNER JOIN saida_titulares st ON s.id = st.saida_id
    WHERE EXTRACT(YEAR FROM s.data_saida) = EXTRACT(YEAR FROM SYSDATE)
    GROUP BY st.usuario_id
) saidas ON u.id = saidas.usuario_id
WHERE u.ativo = 1;

-- View para parcelas em atraso
CREATE OR REPLACE VIEW vw_parcelas_vencidas AS
SELECT 
    p.id,
    p.saida_original_id,
    s.data_saida,
    e.nome as empresa,
    p.numero_parcela,
    p.data_vencimento,
    p.valor_parcela,
    TRUNC(SYSDATE) - TRUNC(p.data_vencimento) as dias_atraso,
    u.nome as responsavel
FROM parcelas p
INNER JOIN saidas s ON p.saida_original_id = s.id
INNER JOIN empresas e ON s.empresa_id = e.id
INNER JOIN usuarios u ON s.usuario_registro_id = u.id
WHERE p.status = 'vencida'
ORDER BY p.data_vencimento;

-- View para relatório de gastos por categoria
CREATE OR REPLACE VIEW vw_gastos_categoria AS
SELECT 
    p.classificacao,
    COUNT(*) as total_compras,
    SUM(i.quantidade) as quantidade_total,
    SUM(i.total) as valor_total,
    AVG(i.preco_unitario) as preco_medio
FROM itens_saida i
INNER JOIN produtos p ON i.produto_id = p.id
INNER JOIN saidas s ON i.saida_id = s.id
WHERE EXTRACT(YEAR FROM s.data_saida) = EXTRACT(YEAR FROM SYSDATE)
GROUP BY p.classificacao
ORDER BY valor_total DESC;

-- ====================================================================
-- FIM DOS SCRIPTS
-- ====================================================================

/*
OBSERVAÇÕES IMPORTANTES:

1. RELACIONAMENTOS IDENTIFICADOS:
   - usuarios 1:N entradas (usuário que registra)
   - usuarios 1:N entradas (usuário titular)  
   - usuarios 1:N saidas (usuário que registra)
   - usuarios N:M saidas (usuários titulares) - através de saida_titulares
   - empresas 1:N entradas (empresa pagadora)
   - empresas 1:N saidas (empresa vendedora)
   - produtos 1:N itens_saida
   - saidas 1:N itens_saida
   - saidas 1:N parcelas (para compras parceladas)

2. CAMPOS IMPORTANTES:
   - precoUnitario foi removido da tabela produtos (conforme solicitação)
   - precoUnitario permanece em itens_saida (preço no momento da compra)
   - usuariosTitularesIds do frontend é implementado via tabela saida_titulares
   - Campos de timestamp seguem padrão ISO (TIMESTAMP no Oracle)
   - Status das parcelas é controlado automaticamente via trigger

3. INTEGRIDADE DE DADOS:
   - Constraints para garantir consistência
   - Triggers para validação de totais
   - Triggers para atualização automática de timestamps
   - Índices para otimização de consultas

4. SEGURANÇA:
   - Senhas devem ser criptografadas na aplicação antes de serem inseridas
   - Campos sensíveis protegidos por constraints
   - Validações de domínio implementadas

5. PERFORMANCE:
   - Índices criados em campos frequentemente consultados
   - Views materializadas podem ser criadas posteriormente se necessário
   - Sequences otimizadas para inserções em lote

Para utilizar estes scripts:
1. Execute na ordem apresentada
2. Ajuste os valores de hash das senhas conforme sua implementação
3. Adicione dados de teste conforme necessário
4. Configure backup e recovery adequados para produção
*/