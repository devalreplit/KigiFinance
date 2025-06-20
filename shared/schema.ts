import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// KIGI specific tables
export const familyUsers = pgTable("family_users", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  nome: varchar("nome").notNull(),
  senha: varchar("senha").notNull(),
  papel: varchar("papel").notNull(), // 'pai' | 'mae' | 'filho' | 'filha'
  createdAt: timestamp("created_at").defaultNow(),
});

export const empresas = pgTable("empresas", {
  id: serial("id").primaryKey(),
  nome: varchar("nome").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const produtos = pgTable("produtos", {
  id: serial("id").primaryKey(),
  codigoBarras: varchar("codigo_barras"),
  nome: varchar("nome").notNull(),
  unidade: varchar("unidade").notNull(),
  classificacao: varchar("classificacao").notNull(),
  precoUnitario: decimal("preco_unitario", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const entradas = pgTable("entradas", {
  id: serial("id").primaryKey(),
  usuarioRegistroId: integer("usuario_registro_id").references(() => familyUsers.id).notNull(),
  dataHoraRegistro: timestamp("data_hora_registro").defaultNow().notNull(),
  usuarioTitularId: integer("usuario_titular_id").references(() => familyUsers.id).notNull(),
  dataReferencia: date("data_referencia").notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  empresaPagadoraId: integer("empresa_pagadora_id").references(() => empresas.id).notNull(),
});

export const saidas = pgTable("saidas", {
  id: serial("id").primaryKey(),
  usuarioRegistroId: integer("usuario_registro_id").references(() => familyUsers.id).notNull(),
  dataHoraRegistro: timestamp("data_hora_registro").defaultNow().notNull(),
  dataSaida: date("data_saida").notNull(),
  empresaId: integer("empresa_id").references(() => empresas.id).notNull(),
  tipoPagamento: varchar("tipo_pagamento").notNull(), // 'avista' | 'parcelado'
  usuariosTitularesIds: jsonb("usuarios_titulares_ids").notNull(),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  observacao: text("observacao"),
  saidaOriginalId: integer("saida_original_id").references(() => saidas.id),
});

export const itensSaida = pgTable("itens_saida", {
  id: serial("id").primaryKey(),
  saidaId: integer("saida_id").references(() => saidas.id).notNull(),
  produtoId: integer("produto_id").references(() => produtos.id).notNull(),
  quantidade: decimal("quantidade", { precision: 10, scale: 3 }).notNull(),
  precoUnitario: decimal("preco_unitario", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

export const parcelas = pgTable("parcelas", {
  id: serial("id").primaryKey(),
  saidaOriginalId: integer("saida_original_id").references(() => saidas.id).notNull(),
  numeroParcela: integer("numero_parcela").notNull(),
  dataVencimento: date("data_vencimento").notNull(),
  valorParcela: decimal("valor_parcela", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default('a vencer'), // 'paga' | 'vencida' | 'a vencer'
  dataPagamento: date("data_pagamento"),
});

// Schema types for Replit Auth
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Schema types for KIGI system
export const familyUserInsertSchema = createInsertSchema(familyUsers).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const empresaInsertSchema = createInsertSchema(empresas).omit({
  id: true,
  createdAt: true,
});

export const produtoInsertSchema = createInsertSchema(produtos).omit({
  id: true,
  createdAt: true,
});

export const entradaInsertSchema = createInsertSchema(entradas).omit({
  id: true,
  dataHoraRegistro: true,
});

export const saidaInsertSchema = createInsertSchema(saidas).omit({
  id: true,
  dataHoraRegistro: true,
  valorTotal: true,
});

export const parcelaInsertSchema = createInsertSchema(parcelas).omit({
  id: true,
});

export type FamilyUser = typeof familyUsers.$inferSelect;
export type FamilyUserInput = z.infer<typeof familyUserInsertSchema>;
export type Empresa = typeof empresas.$inferSelect;
export type EmpresaInput = z.infer<typeof empresaInsertSchema>;
export type Produto = typeof produtos.$inferSelect;
export type ProdutoInput = z.infer<typeof produtoInsertSchema>;
export type Entrada = typeof entradas.$inferSelect;
export type EntradaInput = z.infer<typeof entradaInsertSchema>;
export type Saida = typeof saidas.$inferSelect;
export type SaidaInput = z.infer<typeof saidaInsertSchema>;
export type Parcela = typeof parcelas.$inferSelect;
export type ParcelaInput = z.infer<typeof parcelaInsertSchema>;
