
-- ====================================================================
-- SISTEMA FINANCEIRO FAMILIAR KIGI - SCRIPTS ORACLE 11G
-- ====================================================================
-- 
-- Descrição: Scripts para criação das tabelas, índices, constraints
-- e relacionamentos do sistema financeiro familiar KIGI
-- 
-- NOVA ESTRUTURA: Saídas unificadas com tipos (normal, parcelada_pai, parcela)
-- Versão: Oracle Database 11G - REVISÃO COMPLETA
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
-- NOVA ESTRUTURA: Unifica saídas à vista e parceladas em uma única tabela
-- Cada saída tem impacto financeiro no mês de vencimento (data_saida)
CREATE TABLE saidas (
    id NUMBER(10) PRIMARY KEY,
    saida_pai_id NUMBER(10), -- Referência à saída pai (NULL para saídas normais e saídas_pai)
    tipo_saida VARCHAR2(20) NOT NULL CHECK (tipo_saida IN ('normal', 'parcelada_pai', 'parcela')),
    numero_parcela NUMBER(3) NOT NULL DEFAULT 1 CHECK (numero_parcela > 0),
    total_parcelas NUMBER(3), -- Preenchido apenas para saídas parceladas (pai)
    usuario_registro_id NUMBER(10) NOT NULL,
    data_hora_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_saida DATE NOT NULL, -- Data de impacto financeiro (vencimento da parcela)
    empresa_id NUMBER(10) NOT NULL,
    tipo_pagamento VARCHAR2(10) NOT NULL CHECK (tipo_pagamento IN ('avista', 'parcelado')),
    valor_total NUMBER(15,2) NOT NULL CHECK (valor_total > 0),
    observacao VARCHAR2(500),
    CONSTRAINT fk_saida_usuario_registro FOREIGN KEY (usuario_registro_id) REFERENCES usuarios(id),
    CONSTRAINT fk_saida_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    CONSTRAINT fk_saida_pai FOREIGN KEY (saida_pai_id) REFERENCES saidas(id),
    -- Constraints de integridade da nova estrutura
    CONSTRAINT chk_saida_avista CHECK (
        (tipo_pagamento = 'avista' AND tipo_saida = 'normal' AND saida_pai_id IS NULL AND numero_parcela = 1) OR
        (tipo_pagamento = 'parcelado')
    ),
    CONSTRAINT chk_saida_parcelada_pai CHECK (
        (tipo_saida = 'parcelada_pai' AND saida_pai_id IS NULL AND total_parcelas > 1) OR
        (tipo_saida != 'parcelada_pai')
    ),
    CONSTRAINT chk_saida_parcela_filha CHECK (
        (tipo_saida = 'parcela' AND saida_pai_id IS NOT NULL AND total_parcelas IS NULL) OR
        (tipo_saida != 'parcela')
    ),
    CONSTRAINT chk_numero_parcela_consistente CHECK (
        (tipo_saida = 'normal' AND numero_parcela = 1) OR
        (tipo_saida IN ('parcelada_pai', 'parcela') AND numero_parcela >= 1)
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
CREATE TABLE saida_titulares (
    id NUMBER(10) PRIMARY KEY,
    saida_id NUMBER(10) NOT NULL,
    usuario_id NUMBER(10) NOT NULL,
    CONSTRAINT fk_saida_titular_saida FOREIGN KEY (saida_id) REFERENCES saidas(id) ON DELETE CASCADE,
    CONSTRAINT fk_saida_titular_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT uk_saida_usuario UNIQUE (saida_id, usuario_id)
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

-- Índices para tabela SAIDAS (NOVA ESTRUTURA)
CREATE INDEX idx_saidas_usuario_registro ON saidas(usuario_registro_id);
CREATE INDEX idx_saidas_data_saida ON saidas(data_saida);
CREATE INDEX idx_saidas_empresa ON saidas(empresa_id);
CREATE INDEX idx_saidas_tipo_pagamento ON saidas(tipo_pagamento);
CREATE INDEX idx_saidas_tipo_saida ON saidas(tipo_saida);
CREATE INDEX idx_saidas_saida_pai ON saidas(saida_pai_id);
CREATE INDEX idx_saidas_numero_parcela ON saidas(numero_parcela);
CREATE INDEX idx_saidas_data_hora_registro ON saidas(data_hora_registro);

-- Índices para tabela ITENS_SAIDA
CREATE INDEX idx_itens_saida_saida ON itens_saida(saida_id);
CREATE INDEX idx_itens_saida_produto ON itens_saida(produto_id);

-- Índices para tabela SAIDA_TITULARES
CREATE INDEX idx_saida_titulares_saida ON saida_titulares(saida_id);
CREATE INDEX idx_saida_titulares_usuario ON saida_titulares(usuario_id);

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
-- 6. TRIGGERS DE VALIDAÇÃO E INTEGRIDADE
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

-- Trigger para validação específica da estrutura de parcelas
CREATE OR REPLACE TRIGGER trg_validar_estrutura_parcelas
    BEFORE INSERT OR UPDATE ON saidas
    FOR EACH ROW
DECLARE
    v_saida_pai_tipo VARCHAR2(20);
    v_saida_pai_total_parcelas NUMBER(3);
BEGIN
    -- Validações para parcelas filhas
    IF :NEW.tipo_saida = 'parcela' THEN
        -- Verificar se a saída pai existe e é do tipo correto
        SELECT tipo_saida, total_parcelas 
        INTO v_saida_pai_tipo, v_saida_pai_total_parcelas
        FROM saidas 
        WHERE id = :NEW.saida_pai_id;
        
        -- Saída pai deve ser do tipo 'parcelada_pai'
        IF v_saida_pai_tipo != 'parcelada_pai' THEN
            RAISE_APPLICATION_ERROR(-20002, 
                'Parcela filha deve referenciar uma saída pai do tipo parcelada_pai');
        END IF;
        
        -- Número da parcela não pode exceder o total de parcelas
        IF :NEW.numero_parcela > v_saida_pai_total_parcelas THEN
            RAISE_APPLICATION_ERROR(-20003, 
                'Número da parcela (' || :NEW.numero_parcela || 
                ') não pode exceder o total de parcelas (' || v_saida_pai_total_parcelas || ')');
        END IF;
        
        -- Herdar configurações da saída pai
        SELECT empresa_id, tipo_pagamento, valor_total
        INTO :NEW.empresa_id, :NEW.tipo_pagamento, :NEW.valor_total
        FROM saidas
        WHERE id = :NEW.saida_pai_id;
    END IF;
    
    -- Validação para saídas parceladas pai
    IF :NEW.tipo_saida = 'parcelada_pai' THEN
        IF :NEW.total_parcelas IS NULL OR :NEW.total_parcelas < 2 THEN
            RAISE_APPLICATION_ERROR(-20004, 
                'Saída parcelada pai deve ter total_parcelas >= 2');
        END IF;
        
        IF :NEW.numero_parcela != 1 THEN
            RAISE_APPLICATION_ERROR(-20005, 
                'Saída parcelada pai deve ter numero_parcela = 1');
        END IF;
    END IF;
    
    -- Validação para saídas normais
    IF :NEW.tipo_saida = 'normal' THEN
        IF :NEW.saida_pai_id IS NOT NULL THEN
            RAISE_APPLICATION_ERROR(-20006, 
                'Saída normal não pode ter saida_pai_id');
        END IF;
        
        IF :NEW.numero_parcela != 1 THEN
            RAISE_APPLICATION_ERROR(-20007, 
                'Saída normal deve ter numero_parcela = 1');
        END IF;
    END IF;
END;
/

-- ====================================================================
-- 7. COMENTÁRIOS NAS TABELAS E COLUNAS
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

-- Comentários na tabela SAIDAS (NOVA ESTRUTURA)
COMMENT ON TABLE saidas IS 'Despesas e saídas financeiras unificadas - à vista e parceladas';
COMMENT ON COLUMN saidas.id IS 'Identificador único da saída';
COMMENT ON COLUMN saidas.saida_pai_id IS 'Referência à saída pai (NULL para normais e parceladas_pai)';
COMMENT ON COLUMN saidas.tipo_saida IS 'Tipo: normal (à vista), parcelada_pai (primeira parcela), parcela (parcelas subsequentes)';
COMMENT ON COLUMN saidas.numero_parcela IS 'Número da parcela (1 para à vista, 1-N para parceladas)';
COMMENT ON COLUMN saidas.total_parcelas IS 'Total de parcelas (apenas para parceladas_pai)';
COMMENT ON COLUMN saidas.usuario_registro_id IS 'Usuário que registrou a saída';
COMMENT ON COLUMN saidas.data_saida IS 'Data de impacto financeiro (vencimento da parcela)';
COMMENT ON COLUMN saidas.empresa_id IS 'Empresa onde foi realizada a compra';
COMMENT ON COLUMN saidas.tipo_pagamento IS 'Tipo de pagamento (avista, parcelado)';
COMMENT ON COLUMN saidas.valor_total IS 'Valor da parcela (impacto financeiro no mês)';
COMMENT ON COLUMN saidas.observacao IS 'Observações adicionais';

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

-- ====================================================================
-- 8. VIEWS PARA RELATÓRIOS E CONSULTAS FREQUENTES
-- ====================================================================

-- View para saídas principais (apenas normais e parceladas_pai)
CREATE OR REPLACE VIEW vw_saidas_principais AS
SELECT 
    s.*,
    e.nome as empresa_nome,
    u.nome as usuario_registro_nome
FROM saidas s
INNER JOIN empresas e ON s.empresa_id = e.id
INNER JOIN usuarios u ON s.usuario_registro_id = u.id
WHERE s.tipo_saida IN ('normal', 'parcelada_pai')
ORDER BY s.data_saida DESC;

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

-- View para parcelas futuras (a vencer)
CREATE OR REPLACE VIEW vw_parcelas_futuras AS
SELECT 
    s.id,
    s.saida_pai_id,
    sp.data_saida as data_compra_original,
    e.nome as empresa,
    s.numero_parcela,
    s.data_saida as data_vencimento,
    s.valor_total as valor_parcela,
    TRUNC(s.data_saida) - TRUNC(SYSDATE) as dias_para_vencimento,
    u.nome as responsavel
FROM saidas s
INNER JOIN saidas sp ON s.saida_pai_id = sp.id -- Join com a saída pai
INNER JOIN empresas e ON s.empresa_id = e.id
INNER JOIN usuarios u ON s.usuario_registro_id = u.id
WHERE s.tipo_saida = 'parcela'
  AND s.data_saida > SYSDATE
ORDER BY s.data_saida;

-- View para gastos por categoria
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
INSERT INTO empresas (nome) VALUES ('Magazine Luiza');

-- Inserir produtos iniciais
INSERT INTO produtos (codigo_barras, nome, unidade, classificacao) VALUES 
('7891234567890', 'Arroz Integral 5kg', 'kg', 'Alimentação');

INSERT INTO produtos (codigo_barras, nome, unidade, classificacao) VALUES 
('7891234567891', 'Feijão Preto 1kg', 'kg', 'Alimentação');

INSERT INTO produtos (codigo_barras, nome, unidade, classificacao) VALUES 
('7891234567892', 'Óleo de Soja 900ml', 'ml', 'Alimentação');

INSERT INTO produtos (codigo_barras, nome, unidade, classificacao) VALUES 
('7891234567893', 'Smartphone Samsung', 'un', 'Eletrônicos');

-- Inserir exemplos de entradas
INSERT INTO entradas (usuario_registro_id, usuario_titular_id, data_referencia, valor, empresa_pagadora_id) 
VALUES (1, 1, DATE '2024-01-01', 5000.00, 1);

INSERT INTO entradas (usuario_registro_id, usuario_titular_id, data_referencia, valor, empresa_pagadora_id) 
VALUES (1, 2, DATE '2024-01-01', 3000.00, 2);

-- Exemplos de saídas à vista
INSERT INTO saidas (tipo_saida, numero_parcela, usuario_registro_id, data_saida, empresa_id, tipo_pagamento, valor_total, observacao) 
VALUES ('normal', 1, 1, DATE '2024-01-05', 1, 'avista', 250.00, 'Compras do mês');

-- Exemplo de saída parcelada - Primeira parcela (saída pai)
INSERT INTO saidas (tipo_saida, numero_parcela, total_parcelas, usuario_registro_id, data_saida, empresa_id, tipo_pagamento, valor_total, observacao) 
VALUES ('parcelada_pai', 1, 3, 1, DATE '2024-01-15', 4, 'parcelado', 400.00, 'Smartphone parcelado em 3x');

-- Parcelas subsequentes da saída parcelada
INSERT INTO saidas (saida_pai_id, tipo_saida, numero_parcela, usuario_registro_id, data_saida, empresa_id, tipo_pagamento, valor_total) 
VALUES (2, 'parcela', 2, 1, DATE '2024-02-15', 4, 'parcelado', 400.00);

INSERT INTO saidas (saida_pai_id, tipo_saida, numero_parcela, usuario_registro_id, data_saida, empresa_id, tipo_pagamento, valor_total) 
VALUES (2, 'parcela', 3, 1, DATE '2024-03-15', 4, 'parcelado', 400.00);

-- Inserir itens para as saídas
INSERT INTO itens_saida (saida_id, produto_id, nome_produto, quantidade, preco_unitario, total) 
VALUES (1, 1, 'Arroz Integral 5kg', 2, 25.00, 50.00);

INSERT INTO itens_saida (saida_id, produto_id, nome_produto, quantidade, preco_unitario, total) 
VALUES (1, 2, 'Feijão Preto 1kg', 3, 8.00, 24.00);

INSERT INTO itens_saida (saida_id, produto_id, nome_produto, quantidade, preco_unitario, total) 
VALUES (1, 3, 'Óleo de Soja 900ml', 4, 6.50, 26.00);

-- Itens para a saída parcelada (apenas na primeira parcela)
INSERT INTO itens_saida (saida_id, produto_id, nome_produto, quantidade, preco_unitario, total) 
VALUES (2, 4, 'Smartphone Samsung', 1, 1200.00, 1200.00);

-- Inserir titulares das saídas
INSERT INTO saida_titulares (saida_id, usuario_id) VALUES (1, 1);
INSERT INTO saida_titulares (saida_id, usuario_id) VALUES (1, 2);
INSERT INTO saida_titulares (saida_id, usuario_id) VALUES (2, 1);

-- Commit das inserções iniciais
COMMIT;

-- ====================================================================
-- 10. PROCEDURES PARA OPERAÇÕES ESPECÍFICAS
-- ====================================================================

-- Procedure para criar saída parcelada automaticamente
CREATE OR REPLACE PROCEDURE sp_criar_saida_parcelada(
    p_usuario_registro_id IN NUMBER,
    p_empresa_id IN NUMBER,
    p_valor_parcela IN NUMBER,
    p_total_parcelas IN NUMBER,
    p_data_primeira_parcela IN DATE,
    p_observacao IN VARCHAR2 DEFAULT NULL,
    p_saida_pai_id OUT NUMBER
) AS
    v_data_parcela DATE;
BEGIN
    -- Inserir a saída pai (primeira parcela)
    INSERT INTO saidas (
        tipo_saida, numero_parcela, total_parcelas,
        usuario_registro_id, data_saida, empresa_id,
        tipo_pagamento, valor_total, observacao
    ) VALUES (
        'parcelada_pai', 1, p_total_parcelas,
        p_usuario_registro_id, p_data_primeira_parcela, p_empresa_id,
        'parcelado', p_valor_parcela, p_observacao
    ) RETURNING id INTO p_saida_pai_id;
    
    -- Inserir as parcelas subsequentes
    FOR i IN 2..p_total_parcelas LOOP
        v_data_parcela := ADD_MONTHS(p_data_primeira_parcela, i-1);
        
        INSERT INTO saidas (
            saida_pai_id, tipo_saida, numero_parcela,
            usuario_registro_id, data_saida, empresa_id,
            tipo_pagamento, valor_total
        ) VALUES (
            p_saida_pai_id, 'parcela', i,
            p_usuario_registro_id, v_data_parcela, p_empresa_id,
            'parcelado', p_valor_parcela
        );
    END LOOP;
    
    COMMIT;
END;
/

-- ====================================================================
-- FIM DOS SCRIPTS
-- ====================================================================

/*
OBSERVAÇÕES IMPORTANTES DA NOVA ESTRUTURA:

1. MUDANÇAS PRINCIPAIS:
   - Remoção da tabela PARCELAS
   - Unificação de saídas à vista e parceladas na tabela SAIDAS
   - Novos campos: saida_pai_id, tipo_saida, numero_parcela, total_parcelas
   - Constraints específicas para validar a integridade da nova estrutura

2. TIPOS DE SAÍDA:
   - 'normal': Saídas à vista (numero_parcela = 1, saida_pai_id = NULL)
   - 'parcelada_pai': Primeira parcela de uma compra parcelada
   - 'parcela': Parcelas subsequentes (referenciam saida_pai_id)

3. IMPACTO FINANCEIRO:
   - Todas as saídas têm impacto financeiro no mês da data_saida
   - Parcelas filhas geram débito no mês de vencimento
   - Rastreabilidade total via saida_pai_id

4. INTEGRIDADE DOS DADOS:
   - Triggers de validação específicos para a nova estrutura
   - Constraints garantem consistência entre tipos de saída
   - Procedure para facilitar criação de saídas parceladas

5. PERFORMANCE:
   - Índices otimizados para a nova estrutura
   - Views específicas para consultas frequentes
   - Separação clara entre saídas principais e parcelas

6. COMPATIBILIDADE:
   - Scripts de migração serão necessários para dados existentes
   - Views mantêm compatibilidade com consultas antigas
   - Estrutura flexível para futuras expansões

Para utilizar:
1. Execute os scripts em ordem
2. Use a procedure sp_criar_saida_parcelada para saídas parceladas
3. Consulte vw_saidas_principais para listagens
4. Use vw_parcelas_futuras para controle de vencimentos
*/
