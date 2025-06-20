import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  familyUserInsertSchema,
  empresaInsertSchema,
  produtoInsertSchema,
  entradaInsertSchema,
  saidaInsertSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const familyUser = await storage.getFamilyUserByUserId(userId);
      
      res.json({
        ...user,
        familyUser,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Family Users routes
  app.get('/api/family-users', isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getFamilyUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch family users" });
    }
  });

  app.post('/api/family-users', isAuthenticated, async (req: any, res) => {
    try {
      const data = familyUserInsertSchema.parse(req.body);
      const userId = req.user.claims.sub;
      const user = await storage.createFamilyUser({ ...data, userId });
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.put('/api/family-users/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = familyUserInsertSchema.partial().parse(req.body);
      const user = await storage.updateFamilyUser(id, data);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to update family user" });
    }
  });

  app.delete('/api/family-users/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFamilyUser(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete family user" });
    }
  });

  // Companies routes
  app.get('/api/empresas', isAuthenticated, async (req, res) => {
    try {
      const empresas = await storage.getEmpresas();
      res.json(empresas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.post('/api/empresas', isAuthenticated, async (req, res) => {
    try {
      const data = empresaInsertSchema.parse(req.body);
      const empresa = await storage.createEmpresa(data);
      res.json(empresa);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.put('/api/empresas/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = empresaInsertSchema.partial().parse(req.body);
      const empresa = await storage.updateEmpresa(id, data);
      res.json(empresa);
    } catch (error) {
      res.status(400).json({ message: "Failed to update company" });
    }
  });

  app.delete('/api/empresas/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEmpresa(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete company" });
    }
  });

  // Products routes
  app.get('/api/produtos', isAuthenticated, async (req, res) => {
    try {
      const produtos = await storage.getProdutos();
      res.json(produtos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/produtos/search', isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q as string;
      const produtos = await storage.searchProdutos(query || '');
      res.json(produtos);
    } catch (error) {
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  app.post('/api/produtos', isAuthenticated, async (req, res) => {
    try {
      const data = produtoInsertSchema.parse(req.body);
      const produto = await storage.createProduto(data);
      res.json(produto);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.put('/api/produtos/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = produtoInsertSchema.partial().parse(req.body);
      const produto = await storage.updateProduto(id, data);
      res.json(produto);
    } catch (error) {
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/produtos/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduto(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete product" });
    }
  });

  // Entries routes
  app.get('/api/entradas', isAuthenticated, async (req, res) => {
    try {
      const entradas = await storage.getEntradas();
      res.json(entradas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  app.post('/api/entradas', isAuthenticated, async (req, res) => {
    try {
      const data = entradaInsertSchema.parse(req.body);
      const entrada = await storage.createEntrada(data);
      res.json(entrada);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  // Exits routes
  app.get('/api/saidas', isAuthenticated, async (req, res) => {
    try {
      const saidas = await storage.getSaidas();
      res.json(saidas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exits" });
    }
  });

  app.post('/api/saidas', isAuthenticated, async (req, res) => {
    try {
      const data = saidaInsertSchema.extend({
        itens: require('zod').array(require('zod').object({
          produtoId: require('zod').number(),
          quantidade: require('zod').number(),
          precoUnitario: require('zod').number(),
        })),
      }).parse(req.body);
      
      const saida = await storage.createSaida(data);
      res.json(saida);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  // Installments routes
  app.get('/api/parcelas', isAuthenticated, async (req, res) => {
    try {
      const parcelas = await storage.getParcelas();
      res.json(parcelas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch installments" });
    }
  });

  app.get('/api/parcelas/pendentes', isAuthenticated, async (req, res) => {
    try {
      const parcelas = await storage.getParcelasPendentes();
      res.json(parcelas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending installments" });
    }
  });

  app.put('/api/parcelas/:id/status', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, dataPagamento } = req.body;
      const parcela = await storage.updateParcelaStatus(id, status, dataPagamento);
      res.json(parcela);
    } catch (error) {
      res.status(400).json({ message: "Failed to update installment status" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/resumo', isAuthenticated, async (req, res) => {
    try {
      const resumo = await storage.getResumoFinanceiro();
      res.json(resumo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  app.get('/api/dashboard/transacoes', isAuthenticated, async (req, res) => {
    try {
      const transacoes = await storage.getUltimasTransacoes();
      res.json(transacoes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
